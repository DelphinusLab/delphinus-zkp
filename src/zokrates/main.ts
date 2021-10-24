import sha256 from "crypto-js/sha256";
import hexEnc from "crypto-js/enc-hex";
import BN from "bn.js";
import path from "path";
import fs from "fs-extra";

import { exec } from "child_process";
import { Field } from "delphinus-curves/src/field";
import { MaxHeight, PathInfo } from "delphinus-curves/src//merkle-tree";
import { Command, L2Storage } from "./command";
import { createCommand } from "./command-factory";

const ZKPPath = path.resolve(__dirname, "..", "..", "..");

class ZKPInputBuilder {
  inputs: Field[] = [];

  push(data: Field | Field[]) {
    if (data instanceof Field) {
      this.inputs.push(data);
    } else {
      this.inputs = this.inputs.concat(data);
    }
  }

  _pushPathInfo(pathInfo: PathInfo) {
    this.push(pathInfo.root);

    for (let i = 0; i < 32; i++) {
      this.push(new Field((pathInfo.index >> (31 - i)) & 1));
    }

    for (let i = 0; i < MaxHeight; i++) {
      this.push(pathInfo.pathDigests[i].slice(0, 4));
    }
  }

  async pushPathInfo(pathInfoList: PathInfo[], storage: L2Storage) {
    for (const pathInfo of pathInfoList) {
      this._pushPathInfo(pathInfo);
    }

    for (let i = 0; i < 5 - pathInfoList.length; i++) {
      this._pushPathInfo(await storage.getPath(0));
    }
  }

  pushCommand(op: Field, command: Command) {
    this.push(op);
    this.push(command.args);
  }

  async pushRootHash(storage: L2Storage) {
    this.push(await storage.getRoot());
  }
}

export function shaCommand(op: Field, command: Command) {
  const data = [new Field(0), op]
    .concat(command.args)
    .map((x) => {
      return x.v.toBuffer("be", 32).toString("hex");
    })
    .join("");
  const hvalue = sha256(hexEnc.parse(data)).toString();

  return [
    new Field(new BN(hvalue.slice(0, 32), "hex", "be")),
    new Field(new BN(hvalue.slice(32, 64), "hex", "be")),
  ];
}

export async function genZKPInput(
  op: Field,
  args: Field[],
  storage: L2Storage
) {
  const builder = new ZKPInputBuilder();
  const command = createCommand(op, args) as Command;

  const shaValue = shaCommand(op, command);
  builder.push(shaValue);
  builder.push(await storage.getRoot());
  builder.pushCommand(op, command);

  const pathInfo = await command.run(storage);
  await builder.pushPathInfo(pathInfo, storage);

  await builder.pushRootHash(storage);
  return builder.inputs;
}

export async function runZkp(
  op: Field,
  args: Field[],
  storage: L2Storage,
  runProof = true
) {
  const data = await genZKPInput(op, args, storage);

  if (!runProof) {
    return;
  }

  console.log(
    `zokrates compute-witness -a ${data
      .slice(0, 11)
      .map((f: Field) => f.v.toString(10))
      .join(" ")} ...`
  );

  await new Promise((resolve, reject) =>
    exec(
      `zokrates compute-witness -a ${data
        .map((f: Field) => f.v.toString(10))
        .join(" ")}`,
      {
        cwd: ZKPPath,
      },
      (error, stdout, stderr) => {
        console.log("stdout\n", stdout);

        if (error) {
          reject(error);
          return;
        }
        resolve(undefined);
      }
    )
  );

  console.log("zokrates generate-proof ...");

  await new Promise((resolve, reject) =>
    exec(
      "zokrates generate-proof",
      {
        cwd: ZKPPath,
      },
      (error, stdout, stderr) => {
        console.log("stdout\n", stdout);

        if (error) {
          reject(error);
          return;
        }
        resolve(undefined);
      }
    )
  );

  const proof = await fs.readJson(
    path.resolve(ZKPPath, "proof.json")
  );

  console.log(JSON.stringify(proof));

  return proof.proof.a
    .concat(proof.proof.b[0])
    .concat(proof.proof.b[1])
    .concat(proof.proof.c)
    .concat(proof.inputs);
}

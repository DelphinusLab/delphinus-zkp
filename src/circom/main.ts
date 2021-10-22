import sha256 from "crypto-js/sha256";
import hexEnc from "crypto-js/enc-hex";
import BN from "bn.js";
import path from "path";
import fs from "fs-extra";

import { exec } from "child_process";
import { Field } from "delphinus-curves/src/field";
import { MaxHeight, PathInfo } from "delphinus-curves/src//markle-tree";
import { Command, getBalanceStoreIndex, L2Storage } from "../circom/command";
import { createCommand } from "../circom/command-factory";

interface Input {
  commandHash: string[];
  startRootHash: string;
  endRootHash: string;
  sign: string[][];
  commands: string[][];
  keyPath: string[][];
  dataPath: string[][][];
}

class ZKPInputBuilder {
  input: Input = {
    commandHash: [],
    startRootHash: "",
    sign: [],
    commands: [],
    dataPath: [],
    keyPath: [],
    endRootHash: "",
  };

  genMerkleData(pathInfo: PathInfo) {
    let data = [];
    data.push(pathInfo.index.toString(10));
    for (let i = 0; i < MaxHeight; i++) {
      data = data.concat(
        pathInfo.pathDigests[i].slice(0, 4).map((x) => x.toString())
      );
    }
    data.push(pathInfo.root.v.toString(10));
    return data;
  }

  pushKeyData(pathInfo: PathInfo) {
    this.input.keyPath.push(this.genMerkleData(pathInfo));
  }

  async pushTreeDataWithPadding(
    pathInfoList: PathInfo[],
    storage: L2Storage,
    len = 5
  ) {
    const data = [];
    for (const pathInfo of pathInfoList) {
      data.push(this.genMerkleData(pathInfo));
    }
    for (let i = 0; i < len - pathInfoList.length; i++) {
      data.push(this.genMerkleData(await storage.getPath(0)));
    }
    this.input.dataPath.push(data);
  }

  pushCommand(command: [Field, Field[]]) {
    let data = [];
    data = data.concat(command[1].slice(3, 8).map((x) => x.toString()));
    this.input.commands.push(data);
  }

  pushSign(command: [Field, Field[]]) {
    const sign = command[1].slice(0, 3).map((x) => x.toString());
    this.input.sign.push(sign);
  }

  pushHash(hash: Field[]) {
    this.input.commandHash = hash.map((x) => x.toString());
  }

  async pushStartRootHash(storage: L2Storage) {
    this.input.startRootHash = (await storage.getRoot()).v.toString(10);
  }

  async pushEndRootHash(storage: L2Storage) {
    this.input.endRootHash = (await storage.getRoot()).v.toString(10);
  }
}

export function shaCommands(commands: [Field, Field[]][]) {
  const data = commands
    .map((command) =>
      [
        command[0].v.toBuffer("be", 1),
        command[1][3].v.toBuffer("be", 8),
        command[1][4].v.toBuffer("be", 4),
        command[1][5].v.toBuffer("be", 4),
        command[1][6].v.toBuffer("be", 32),
        command[1][7].v.toBuffer("be", 32),
      ]
        .map((x) => {
          return x.toString("hex");
        })
        .join("")
    )
    .join("");
  const hvalue = sha256(hexEnc.parse(data)).toString();

  return [
    new Field(new BN(hvalue.slice(0, 32), "hex", "be")),
    new Field(new BN(hvalue.slice(32, 64), "hex", "be")),
  ];
}

export async function genZKPInput(
  commands: [Field, Field[]][],
  storage: L2Storage
) {
  const keyPathInfo = [];
  const builder = new ZKPInputBuilder();
  const shaValue = shaCommands(commands);
  builder.pushHash(shaValue);
  await builder.pushStartRootHash(storage);

  for (const command of commands) {
    builder.pushSign(command);
  }

  for (const command of commands) {
    const op = command[0];
    const args = command[1];
    const accountIndex = args[4].v.toNumber();
    const keyIndex = getBalanceStoreIndex(accountIndex, 0);
    const commandWorker = createCommand(op, args) as Command;

    builder.pushCommand(command);

    keyPathInfo.push(await storage.getPath(keyIndex));
    const pathInfo = await commandWorker.run(storage);
    await builder.pushTreeDataWithPadding(pathInfo, storage);
  }

  keyPathInfo.forEach((v) => builder.pushKeyData(v));

  await builder.pushEndRootHash(storage);
  return builder.input;
}

export async function writeInput(input: Input) {
  return await fs.writeJSON(
    path.join(__dirname, "..", "..", "..", "circom", "input.json"),
    input
  );
}

export async function runZkp(
  op: Field,
  args: Field[],
  storage: L2Storage,
  runProof = true
) {
  const input = await genZKPInput([[op, args]], storage);
  await writeInput(input);
}

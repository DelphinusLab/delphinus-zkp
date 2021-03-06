import sha256 from "crypto-js/sha256";
import hexEnc from "crypto-js/enc-hex";
import BN from "bn.js";

import { Field } from "delphinus-curves/src/field";
import { MaxHeight, PathInfo } from "delphinus-curves/src//merkle-tree";
import { Command } from "../circom/command";
import { createCommand } from "../circom/command-factory";
import { L2Storage } from "./address-space";
import { Account } from "./address/account";

export interface Input {
  commandHash: string[];
  startRootHash: string;
  endRootHash: string;
  sign: string[][];
  args: string[][];
  keyPath: string[][];
  dataPath: string[][][];
}

class ZKPInputBuilder {
  input: Input = {
    commandHash: [],
    args: [],
    sign: [],
    keyPath: [],
    dataPath: [],
    startRootHash: "",
    endRootHash: "",
  };

  genMerkleData(pathInfo: PathInfo) {
    let data = [];
    data.push(
      pathInfo.index >= 0
        ? pathInfo.index.toString(10)
        : (new BN(1)).shln(32).add(new BN(pathInfo.index)).toString(10)
    );
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
    len = 6
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
    let data: string[] = [command[0].v.toString()];
    data = data.concat(command[1].slice(3, 8).map((x) => x.toString()));
    this.input.args.push(data);
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
  const builder = new ZKPInputBuilder();

  // input: sha
  const shaValue = shaCommands(commands);
  builder.pushHash(shaValue);

  // input: command
  commands.forEach((command) => builder.pushCommand(command));

  // input: signatures
  for (const command of commands) {
    builder.pushSign(command);
  }

  // input: start root hash
  await builder.pushStartRootHash(storage);

  {
    for (const command of commands) {
      const op = command[0];
      const args = command[1];
      const commandWorker = createCommand(op, args) as Command;

      // input: key path
      const accountIndex = commandWorker.callerAccountIndex;
      const account = new Account(storage, accountIndex);
      const keyAddress = account.getAccountPublicKeyAddress();
      builder.pushKeyData(await storage.getPath(keyAddress));

      // input: data path
      const pathInfo = await commandWorker.run(storage);
      await builder.pushTreeDataWithPadding(pathInfo, storage);
    }
  }

  // input: end root hash
  await builder.pushEndRootHash(storage);

  return builder.input;
}

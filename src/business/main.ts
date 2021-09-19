import sha256 from 'crypto-js/sha256';
import hexEnc from 'crypto-js/enc-hex';
import BN from "bn.js";

import { exec } from "child_process";
import { Field } from "delphinus-curves/src/field";
import { MaxHeight, PathInfo } from "delphinus-curves/src//markle-tree";
import { Command, L2Storage } from "./command";
import { createCommand } from "./command-factory";

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

  pushPathInfo(pathInfoList: PathInfo[], storage: L2Storage) {
    for (const pathInfo of pathInfoList) {
      this._pushPathInfo(pathInfo);
    }

    for (let i = 0; i < 5 - pathInfoList.length; i++) {
      this._pushPathInfo(storage.getPath(0));
    }
  }

  pushCommand(op: Field, command: Command) {
    this.push(op);
    //console.log(command.args);
    this.push(command.args);
  }

  pushRootHash(storage: L2Storage) {
    this.push(storage.root.value);
  }
}

export function shaCommand(op: Field, command: Command) {
  const data =
    [op].concat(command.args).concat([new Field(0)]).map(x => x.v.toString('hex', 64)).join('');
  const hvalue = sha256(hexEnc.parse(data)).toString();

  return [
    new Field(new BN(hvalue.slice(0, 32), 'hex')),
    new Field(new BN(hvalue.slice(32, 64), 'hex'))
  ];
}

export function genZKPInput(op: Field, args: Field[], storage: L2Storage): Field[] {
  const builder = new ZKPInputBuilder();
  const command = createCommand(op, args) as Command;

  const shaValue = shaCommand(op, command);
  builder.push(shaValue);
  builder.pushCommand(op, command);

  const pathInfo = command.run(storage);
  builder.pushPathInfo(pathInfo, storage);

  builder.pushRootHash(storage);
  return builder.inputs;
}

export function runZkp(op: Field, args: Field[], storage: L2Storage) {
  const data = genZKPInput(op, args, storage);

  console.log(`zokrates compute-witness -a ${data.map((f: Field) => f.v.toString(10)).join(" ")}`);

  return new Promise((resolve, reject) =>
    exec(
      `zokrates compute-witness -a ${data.map((f: Field) => f.v.toString(10)).join(" ")}`,
      (error, stdout, stderr) => {
        console.log('stdout\n', stdout);

        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        //console.log('error\n', error);
        //console.log('stderr\n', stderr);
        resolve(undefined);
      }
    )
  );
}

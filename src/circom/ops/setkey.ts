import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { getAccountPublicKeyIndex, L2Storage } from "../address-space";
import { Command } from "../command";

export class SetKeyCommand extends Command {
  get callerAccountIndex() {
    return this.args[4].v.toNumber();
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const accountIndex = this.args[4];
    const x = this.args[6];
    const y = this.args[7];

    // circuits: check accountIndex < 2 ^ 20
    // circuits: check (x, y) is a valid point

    // STEP1: init nonce and key
    // circuits: check nonce
    path.push(await storage.getAccountInfo(accountIndex));

    await storage.setLeaves(getAccountPublicKeyIndex(accountIndex), [
      x,
      y,
      nonce.add(new Field(1)),
      new Field(0),
    ]);

    return path;
  }
}
import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";
import { Account } from "../address/account";

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

    const account = new Account(storage, accountIndex);

    // circuits: check accountIndex < 2 ^ 20
    // circuits: check (x, y) is a valid point

    // STEP1: init nonce and key
    // circuits: check nonce
    // circuits: check ax == 0 && ay == 0
    path.push(await account.getAccountInfo());

    await storage.setLeaves(account.getAccountPublicKeyAddress(), [
      x,
      y,
      nonce.add(new Field(1)),
      new Field(0),
    ]);

    return path;
  }
}

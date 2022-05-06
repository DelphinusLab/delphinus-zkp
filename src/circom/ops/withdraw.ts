import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";
import { Account } from "../address/account";

export class WithdrawCommand extends Command {
  get callerAccountIndex() {
    return this.args[4].v.toNumber();
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const accountIndex = this.args[4];
    const tokenIndex = this.args[5];
    const amount = this.args[6];

    const account = new Account(storage, accountIndex);

    // circuits: check accountIndex < 2 ^ 20
    // circuits: check tokenIndex < 2 ^ 10

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await account.getAndUpdateNonce(nonce));

    // STEP2: udpate balance
    // circuits: check balance >= amount
    path.push(
      await account.getAndAddBalance(
        tokenIndex,
        new Field(0).sub(amount)
      )
    );

    return path;
  }
}

import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Pool, initSharePriceKBN } from "../address/pool";
import { Account } from "../address/account";
import { Command } from "../command";

export class AddPoolCommand extends Command {
  get callerAccountIndex() {
    return this.args[9].v.toNumber();
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];
    const nonce = this.args[3];
    const tokenIndex0 = this.args[4];
    const tokenIndex1 = this.args[5];

    // circuits: check tokenIndex0 < 2 ^ 10
    // circuits: check tokenIndex1 < 2 ^ 10
    // circuits: check tokenIndex0 != tokenIndex1
    // check if the other part of args is 0
    // omit poolIndex in circuits args, we can get it from merkle tree path
    const poolIndex = this.args[8];
    const pool = new Pool(storage, poolIndex);
    const account = new Account(storage, this.callerAccountIndex);

    // STEP1: udpate nonce
    // circuits: check nonce
    // circuits: check caller permission
    path.push(await account.getAndUpdateNonce(nonce));

    // STEP2: init pool's token index and liq
    // circuits: check index of pool
    // circuits: check leafValues[0] and leafValues[1] equal to 0
    path.push(await pool.getAndInitTokenIndexAndLiq(tokenIndex0, tokenIndex1, new Field(0), new Field(0)));

    // STEP3: init pool's sharePriceK and remainder
    path.push(await pool.getAndUpdateKAndRem(new Field(initSharePriceKBN), new Field(0)));

    return path;
  }
}

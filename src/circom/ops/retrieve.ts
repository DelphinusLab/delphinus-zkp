import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Pool } from "../address/pool";
import { Account } from "../address/account";
import { Command } from "../command";
import { ShareCalcHelper } from "../shareCalc_helper";
import { calcAmount1ToPool } from "../poolHelper";

export class RetrieveCommand extends Command {
  get callerAccountIndex() {
    return this.args[4].v.toNumber();
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const accountIndex = this.args[4];
    const poolIndex = this.args[5];
    const amount0 = this.args[6];
    const allowedMinAmount1 = this.args[7];

    const pool = new Pool(storage, poolIndex);
    const account = new Account(storage, accountIndex);
    const [tokenIndex0, tokenIndex1, liq0, liq1] = await pool.getTokenIndexAndLiq();

    // circuits: check accountIndex < 2 ^ 20
    // circuits: check poolIndex < 2 ^ 10
    // circuits: allowedMinAmount1 + amount0 not overflow
    // circuits: check amount0 * liq1 >= allowedMinAmount1 * liq0

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await account.getAndUpdateNonce(nonce));

    // STEP2: udpate liquility
    // circuits: check token0 != 0 || token1 != 0
    // circuits: liq0 >= amount0
    // circuits: liq1 >= amount1ToPool
    const amount1ToPool = calcAmount1ToPool(amount0.v, liq0.v, liq1.v, false);
    path.push(await pool.getAndUpdateLiqByAddition(
      new Field(0).sub(amount0),
      new Field(0).sub(amount1ToPool)
    ));

    // STEP3: udpate share
    // circuits: check share >= allowedMinAmount1 + amount0
    const shareTotal = await pool.getShareTotal();
    const shareCalc = new ShareCalcHelper;
    const shareDelta = shareCalc.calcRetrieveShare(amount0.v, shareTotal.v, liq0.v);
    path.push(
      await account.getAndAddShare(
        poolIndex,
        new Field(0).sub(shareDelta)
      )
    );

    // STEP4: udpate balance0
    // circuits: check balance0 + amount0 not overflow
    path.push(
      await account.getAndAddBalance(tokenIndex0, amount0)
    );

    // STEP5: udpate balance1
    // circuits: check balance1 + amount1ToPool not overflow
    path.push(
      await account.getAndAddBalance(tokenIndex1, amount1ToPool)
    );

    // STEP6: add Share Total
    path.push(
      await pool.getAndAddShareTotal(new Field(0).sub(shareDelta))
    );

    return path;
  }
}

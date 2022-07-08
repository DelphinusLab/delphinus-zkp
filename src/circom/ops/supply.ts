import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Pool } from "../address/pool";
import { Account } from "../address/account";
import { Command } from "../command";
import { ShareCalcHelper } from "../shareCalc_helper";
import { calcAmount1ToPool, isPoolEmpty } from "../poolHelper";

export class SupplyCommand extends Command {
  get callerAccountIndex() {
    return this.args[4].v.toNumber();
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const accountIndex = this.args[4];
    const poolIndex = this.args[5];
    const amount0 = this.args[6];
    const allowedMaxAmount1 = this.args[7];

    const pool = new Pool(storage, poolIndex);
    const account = new Account(storage, accountIndex);
    const [tokenIndex0, tokenIndex1, liq0, liq1] = await pool.getTokenIndexAndLiq();
    // circuits: check accountIndex < 2 ^ 20
    // circuits: check poolIndex < 2 ^ 10
    // circuits: allowedMaxAmount1 + amount0 not overflow
    // circuits: check allowedMaxAmount1 * liq0 >= amount0 * liq1

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await account.getAndUpdateNonce(nonce));

    // STEP2: udpate liquility
    // circuits: check token0 != 0 || token1 != 0
    // circuits: liq0 + amount0 doesn't overflow
    // circuits: liq1 + amount1ToPool doesn't overflow
    let amount1ToPool;
    if(isPoolEmpty(liq0.v)) {
        amount1ToPool = allowedMaxAmount1;
    } else {
        amount1ToPool = calcAmount1ToPool(amount0.v, liq0.v, liq1.v, true);
    }
    path.push(await pool.getAndUpdateLiqByAddition(
      amount0,
      amount1ToPool
    ));

    // STEP3: udpate share
    // circuits: check share + allowedMaxAmount1 + amount0 not overflow
    const shareTotal = await pool.getShareTotal();
    const shareCalc = new ShareCalcHelper;
    const shareDelta = shareCalc.calcSupplyShare(amount0.v, shareTotal.v, liq0.v);
    path.push(
      await account.getAndAddShare(
        poolIndex,
        shareDelta
      )
    );

    // STEP4: udpate balance0
    // circuits: check balance0 >= amount0
    path.push(
      await account.getAndAddBalance(
        tokenIndex0,
        new Field(0).sub(amount0)
      )
    );

    // STEP5: udpate balance1
    // circuits: check balance1 >= amount1ToPool
    path.push(
      await account.getAndAddBalance(
        tokenIndex1,
        new Field(0).sub(amount1ToPool)
      )
    );

    // STEP6: add Share Total
    path.push(
      await pool.getAndAddShareTotal(shareDelta)
    );

    return path;
  }
}

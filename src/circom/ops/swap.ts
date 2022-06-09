import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Pool } from "../address/pool";
import { Command } from "../command";
import { Account } from "../address/account";
import { ShareCalcHelper } from "../shareCalc_helper";

export class SwapCommand extends Command {
  get callerAccountIndex() {
    return this.args[4].v.toNumber();
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const accountIndex = this.args[4];
    const poolIndex = this.args[5];
    const reverse = this.args[6];
    const amount = this.args[7];

    const pool = new Pool(storage, poolIndex);
    const account = new Account(storage, accountIndex);
    const shareCalc = new ShareCalcHelper;
    const [tokenIndex0, tokenIndex1, liq0, liq1] = await pool.getTokenIndexAndLiq();
    const amount_out = shareCalc.calcAmountOut_AMM(
      amount.v,
      reverse.v.eqn(0) ? liq1.v : liq0.v,
      reverse.v.eqn(0) ? liq0.v : liq1.v
    );

    // circuits: check accountIndex < 2 ^ 20
    // circuits: check poolIndex < 2 ^ 10
    // circuits: amount1 + amount0 not overflow

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await account.getAndUpdateNonce(nonce));

    // STEP2: udpate liquility
    // circuits: check token0 != 0 || token1 != 0
    // circuits: if reverse == 0 then liq0 + amount doesn't overflow else liq0 >= amount
    // circuits: if reverse == 0 then liq1 >= amount else liq1 + amount doesn't overflow
    const poolTotalLiq_old = liq1.add(liq0);
    const poolTotalLiq_new = liq1.add(liq0).add(amount).sub(amount_out);
    const [k_new, rem_new] = shareCalc.calcKAndRem_new(poolTotalLiq_old.v, poolTotalLiq_new.v, (await pool.getSharePriceK()).v, (await pool.getAccumulatedRem()).v);
    path.push(await pool.updateLiqByAddition(
      reverse.v.eqn(0) ? amount : new Field(0).sub(amount_out),
      reverse.v.eqn(0) ? new Field(0).sub(amount_out) : amount,
    ));
    // STEP3: update SharePriceK and Remainder (but added as 5-th path)
    const kAndRemPath = await pool.updateKAndRem(k_new, rem_new)

    // STEP4: udpate balance0
    // circuits: if reverse == 0 then balance0 >= amount else balance0 + amount doesn't overflow
    path.push(
      await account.getAndAddBalance(
        tokenIndex0,
        reverse.v.eqn(0) ? new Field(0).sub(amount) : amount_out
      )
    );

    // STEP5: udpate balance1
    // circuits: if reverse == 0 then balance1 + amount doesn't overflow else balance1 >= amount
    path.push(
      await account.getAndAddBalance(
        tokenIndex1,
        reverse.v.eqn(0) ? amount_out : new Field(0).sub(amount)
      )
    );

    path.push(kAndRemPath);

    return path;
  }
}

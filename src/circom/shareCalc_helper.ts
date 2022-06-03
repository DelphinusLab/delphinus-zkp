import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";

export class ShareCalcHelper {
    profit_AMM(
        amount: BN,
        token_SwapFrom_amount: BN,
        token_SwapTo_amount: BN
    ){
        const amount_out = token_SwapFrom_amount.mul(amount).mul(new BN(1021)).div(token_SwapTo_amount.add(amount).mul(new BN(1024)));
        const profit = amount.sub(amount_out);
        return new Field(profit)
    }

    calcAmountOut_AMM(
        amount: BN,
        tokenliq_SwapFrom: BN,
        tokenliq_SwapTo: BN
    ){
        const amount_out = tokenliq_SwapFrom.mul(amount).mul(new BN(1021)).div(tokenliq_SwapTo.add(amount).mul(new BN(1024)));
        return new Field(amount_out)
    }

    calcK_new(
        poolTotal_old: BN,
        poolTotal_new: BN,
        k: BN
    ) {
        const rem = poolTotal_old.mul(k).mod(poolTotal_new);
        let k_new: BN;
        if (rem.eqn(0)) {
            k_new = poolTotal_old.mul(k).div(poolTotal_new);
        } else {
            k_new = poolTotal_old.mul(k).div(poolTotal_new).add(new BN(1));
        }
        return new Field(k_new)
    }
}
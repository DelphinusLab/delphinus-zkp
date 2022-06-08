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

    calcKAndRem_new(
        poolTotal_old: BN,
        poolTotal_new: BN,
        k: BN,
        rem: BN
    ) {
        let k_new: BN = poolTotal_old.mul(k).sub(rem).div(poolTotal_new);
        let rem_new: BN = poolTotal_old.mul(k).sub(rem).mod(poolTotal_new);
        if (!rem_new.eqn(0)) {
            k_new = k_new.add(new BN(1));
            rem_new = poolTotal_new.sub(rem_new);
        }
        return [new Field(k_new), new Field(rem_new)];
    }
}
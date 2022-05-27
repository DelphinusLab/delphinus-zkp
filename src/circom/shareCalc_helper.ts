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

    calcK_new(
        totalAmount: BN,
        k: BN,
        profit: BN
    ) {
        const total_new = totalAmount.add(profit);
        const rem = totalAmount.mul(k).mod(total_new);
        let k_new: BN;
        if (rem.eqn(0)) {
            k_new = totalAmount.mul(k).div(total_new);
        } else {
            k_new = totalAmount.mul(k).div(total_new).add(new BN(1));
        }

        return new Field(k_new)
    }
}
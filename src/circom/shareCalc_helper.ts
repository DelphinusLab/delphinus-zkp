import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";

export class ShareCalcHelper {
    percentage_Profit(
        amount: BN,
        molecule: BN,
        denominator: BN
    ) {
        const rem = amount.mul(molecule).mod(denominator);
        let ans: BN;
        if (rem.eqn(0)) {
            ans = amount.mul(molecule).div(denominator);
        } else {
            ans = amount.mul(molecule).div(denominator).add(new BN(1));
        }
        return new Field(ans)
    }

    calcProfit(
        amount: BN
    ) {
        const profit = this.percentage_Profit(amount, new BN(3), new BN(1000));
        return profit
    }

    amountToShare(
        amount: BN,
        k: BN
    ) {
        const share = amount.mul(k.sub(new BN(1)));
        return share     //might be neg, return BN
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
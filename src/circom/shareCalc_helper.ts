import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";

export class ShareCalcHelper {
    percentage_Profit(
        amount: Field,
        molecule: BN,
        denominator: BN
    ) {
        const rem = molecule.mod(denominator);
        let ans: Field;
        if (rem.eqn(0)) {
            ans = amount.mul(new Field(molecule)).div(new Field(denominator));
        } else {
            ans = amount.mul(new Field(molecule)).div(new Field(denominator)).add(new Field(1));
        }
        return ans
    }

    calcProfit(
        amount: Field
    ) {
        const profit = this.percentage_Profit(amount, new BN(3), new BN(1000));
        return profit
    }

    amountToShare(
        amount: BN,
        k: BN
    ) {
        const share = amount.mul(k.sub(new BN(1)));
        return share
    }

    calcK_new(
        totalAmount: Field,
        k: Field,
        profit: Field
    ) {
        const total_new = totalAmount.add(profit);
        const rem = totalAmount.v.mul(k.v).mod(total_new.v);
        let k_new: Field;
        if (rem.eqn(0)) {
            k_new = totalAmount.mul(k).div(total_new);
        } else {
            k_new = totalAmount.mul(k).div(total_new).add(new Field(1));
        }

        return k_new
    }
}
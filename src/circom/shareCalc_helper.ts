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

    calcSupply_Share_New(
        amountX: BN,
        share_total: BN,
        liqX: BN
    ){
        let share_new;
        let amp = new BN(10 * 15);
        if(share_total.eqn(0)){
            share_new = amountX.mul(amp);
        }else{
            share_new = amountX.mul(share_total).div(liqX);
        }
        return new Field(share_new)
    }

    calcRetrieve_Share_New(
        amountX: BN,
        share_total: BN,
        liqX: BN
    ){
        const share_new = amountX.mul(share_total).div(liqX);
        const rem = amountX.mul(share_total).mod(liqX);
        if(!rem.eqn(0)){
            return new Field(share_new).add(new Field(1));
        }else {
            return new Field(share_new);
        }
    }
}
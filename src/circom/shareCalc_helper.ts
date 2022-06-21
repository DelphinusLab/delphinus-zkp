import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";

export class ShareCalcHelper {
    profitAMM(
        amount: BN,
        tokenSwapFromamount: BN,
        tokenSwapToamount: BN
    ){
        const amount_out = tokenSwapFromamount.mul(amount).mul(new BN(1021)).div(tokenSwapToamount.add(amount).mul(new BN(1024)));
        const profit = amount.sub(amount_out);
        return new Field(profit)
    }

    calcAmountOutAMM(
        amount: BN,
        tokenliqSwapFrom: BN,
        tokenliqSwapTo: BN
    ){
        const amount_out = tokenliqSwapFrom.mul(amount).mul(new BN(1021)).div(tokenliqSwapTo.add(amount).mul(new BN(1024)));
        return new Field(amount_out)
    }

    calcSupplyShare(
        amountX: BN,
        shareTotal: BN,
        liqX: BN
    ){
        let shareDelta;
        let amp = new BN(10 ** 15);
        if(shareTotal.eqn(0)){
            shareDelta = amountX.mul(amp);
        }else{
            shareDelta = amountX.mul(shareTotal).div(liqX);
        }
        return new Field(shareDelta)
    }

    calcRetrieveShare(
        amountX: BN,
        shareTotal: BN,
        liqX: BN
    ){
        const shareDelta = amountX.mul(shareTotal).div(liqX);
        const rem = amountX.mul(shareTotal).mod(liqX);
        if(!rem.eqn(0)){
            return new Field(shareDelta).add(new Field(1));
        }else {
            return new Field(shareDelta);
        }
    }
}
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
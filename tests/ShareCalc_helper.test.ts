import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";
import { ShareCalcHelper } from "../src/circom/shareCalc_helper"

describe("test ShareCalc_helper class", () => {
    test("test calcK_new with remainder", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const totalAmount = new BN(1000);
        const k = new BN(10);
        const profit = new BN(1000);
        const k_new = shareCalc.calcK_new(totalAmount,k,profit);

        // k_new = 1000*10/(1000+1000) = 5
        expect(k_new).toEqual(new Field(5));
    });

    test("test calcK_new with remainder", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const totalAmount = new BN(1000);
        const k = new BN(1);
        const profit = new BN(1000);
        const k_new = shareCalc.calcK_new(totalAmount,k,profit);

        // k_new = 1000*1/(1000+1000) = 0.5 rounding up
        expect(k_new).toEqual(new Field(1));
    });

    test("test profit_AMM positive", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const swapAmount = new BN(100);
        const token_SwapFrom_amount = new BN(2000);
        const token_SwapTo_amount = new BN(2000);
        const profit = shareCalc.profit_AMM(swapAmount, token_SwapFrom_amount, token_SwapTo_amount);

        // profit = 100 - 2000*100*1021/((2000+100)*1024) = 100 - 94(rounding down) = 6
        expect(profit.toString()).toEqual('6');
    });

    test("test profit_AMM Negitive", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const swapAmount = new BN(100);
        const token_SwapFrom_amount = new BN(2000);
        const token_SwapTo_amount = new BN(1000);
        const profit = shareCalc.profit_AMM(swapAmount, token_SwapFrom_amount, token_SwapTo_amount);

        // profit = 100 - 2000*100*1021/((1000+100)*1024) = 100 - 181(rounding down) = -81
        expect(profit.toString()).toEqual(new Field(0).sub(new Field(81)).toString());
    });
});
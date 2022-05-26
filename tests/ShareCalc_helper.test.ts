import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";
import { ShareCalcHelper } from "../src/circom/shareCalc_helper"

describe("test ShareCalc_helper class", () => {
    test("test amountToShare", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const amount = new BN(500);
        const k = new BN(11);
        const share = shareCalc.amountToShare(amount, k);

        // share = 5000 * (11 - 1) = 5000
        expect(share).toEqual(new BN(5000));
    });

    test("test calcProfit without remainder", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const amount = new BN(1000);
        const profit = shareCalc.calcProfit(amount);

        // profit = 1000*3/1000 = 3
        expect(profit).toEqual(new Field(3));
    });

    test("test calcProfit with remainder", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const amount = new BN(400);
        const profit = shareCalc.calcProfit(amount);

        // profit = 400*3/1000 = 1.2 rounding up 2
        expect(profit).toEqual(new Field(2));
    });

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
});
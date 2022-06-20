import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";
import { ShareCalcHelper } from "../src/circom/shareCalc_helper"

describe("test ShareCalc_helper class", () => {
    test("test calcSupplyShare supply 1000 to a new pool", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const amountX = new BN(500);
        const shareTotal = new BN(0);
        const liqX = new BN(0);
        const share_new = shareCalc.calcSupplyShare(amountX, shareTotal, liqX);

        const amp = 10**15;
        const share_check = 500 * amp;
        expect(share_new.toString()).toEqual(`${share_check}`);
    });

    test("test calcSupplyShare supply 1000 to an exist pool", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const amountX = new BN(1000);
        const shareTotal = new BN(200);
        const liqX = new BN(30);
        const share_new = shareCalc.calcSupplyShare(amountX, shareTotal, liqX);

        expect(share_new.toString()).toEqual("6666");
    });

    test("test calcRetrieveShare retrieve 50 without rem", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const amountX = new BN(50);
        const shareTotal = new BN(100);
        const liqX = new BN(50);
        const shareDelta = shareCalc.calcRetrieveShare(amountX, shareTotal, liqX);

        expect(shareDelta.toString()).toEqual("100");
    });

    test("test calcRetrieveShare retrieve 50 with rem", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const amountX = new BN(50);
        const shareTotal = new BN(100);
        const liqX = new BN(60);
        const shareDelta = shareCalc.calcRetrieveShare(amountX, shareTotal, liqX);

        expect(shareDelta.toString()).toEqual("84");
    });

    test("test calcAmountOutAMM", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const amount = new BN(500);
        const tokenliqSwapFrom = new BN(1000);
        const tokenliqSwapTo = new BN(5000);
        const amountOut = shareCalc.calcAmountOutAMM(amount,tokenliqSwapFrom,tokenliqSwapTo);

        // amount_out = 1000*500*1021/((5000+500)*1024) = 90.64 rounding down 90
        expect(amountOut.toString()).toEqual('90');
    });
});
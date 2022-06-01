import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";
import { ShareCalcHelper } from "../src/circom/shareCalc_helper"

describe("test ShareCalc_helper class", () => {
    test("test calcK_new with remainder", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const poolTotal_old = new BN(2000);
        const poolTotal_new = new BN(2200);
        const k = new BN(10);
        const k_new = shareCalc.calcK_new(poolTotal_old, poolTotal_new, k);

        // k_new = 2000*10/2200 = 9.09 rounding up 10
        expect(k_new.toString()).toEqual('10');
    });

    test("test calcK_new with remainder", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const poolTotal_old = new BN(220);
        const poolTotal_new = new BN(2200);
        const k = new BN(10);
        const k_new = shareCalc.calcK_new(poolTotal_old, poolTotal_new, k);

        // k_new = 2000*10/2200 = 9.09 rounding up 10
        expect(k_new.toString()).toEqual('1');
    });

    test("test calcAmountOut_AMM", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const amount = new BN(500);
        const tokenliq_SwapFrom = new BN(1000);
        const tokenliq_SwapTo = new BN(5000);
        const amount_out = shareCalc.calcAmountOut_AMM(amount,tokenliq_SwapFrom,tokenliq_SwapTo);

        // amount_out = 1000*500*1021/((5000+500)*1024) = 90.64 rounding down 90
        expect(amount_out.toString()).toEqual('90');
    });
});
import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";
import { ShareCalcHelper } from "../src/circom/shareCalc_helper"

describe("test ShareCalc_helper class", () => {
    test("test calcK_new with old rem being 0", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const poolTotal_old = new BN(2000);
        const poolTotal_new = new BN(2200);
        const k = new BN(10);
        const rem = new BN(0);
        const [k_new, rem_new] = shareCalc.calcKAndRem_new(poolTotal_old, poolTotal_new, k, rem);

        // k_new, rem_new = 2000*10/2200 = 9 r 200
        expect(k_new.toString()).toEqual('10'); // ceil to 10
        expect(rem_new.toString()).toEqual('2000');  // total_new - rem
    });

    test("test calcK_new with old rem being >0 and new rem being 0", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const poolTotal_old = new BN(2000);
        const poolTotal_new = new BN(2200);
        const k = new BN(10);
        const rem = new BN(200);
        const [k_new, rem_new] = shareCalc.calcKAndRem_new(poolTotal_old, poolTotal_new, k, rem);

        // k_new = (2000*10-200)/2200 = 9 r 0
        expect(k_new.toString()).toEqual('9');
        expect(rem_new.toString()).toEqual('0');
    });

    test("test calcK_new with old rem being >0 and new rem being >0", async () => {
        jest.setTimeout(60000); //1 minute timeout
        
        const shareCalc = new ShareCalcHelper;
        const poolTotal_old = new BN(2000);
        const poolTotal_new = new BN(2200);
        const k = new BN(10);
        const rem = new BN(400);
        const [k_new, rem_new] = shareCalc.calcKAndRem_new(poolTotal_old, poolTotal_new, k, rem);

        // k_new = (2000*10-400)/2200 = 8 r 2000
        expect(k_new.toString()).toEqual('9');
        expect(rem_new.toString()).toEqual('200');
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
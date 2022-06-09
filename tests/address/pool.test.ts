import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../src/circom/address-space";
import { Pool } from "../../src/circom/address/pool"

describe("test pool class", () => {
    test("test initSharePriceK init its tree node", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);
        
        const poolIndex = 0;
        const pool = new Pool(storage, poolIndex);
        const k = new Field(11);
        await pool.updateK(k);
        const k_check = await pool.getSharePriceK();

        expect(k_check.toString()).toEqual('11');
    });

    test("test getSharePriceK throw error when k is not init", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);
        
        const poolIndex = 0;
        const pool = new Pool(storage, poolIndex);

        expect(
            async () => {
                await pool.getSharePriceK();
            }
        ).rejects.toEqual(new Error('SharePriceK has not been initiated yet'));
    });

    test("test getAndAddLiq_withK", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);
        
        const poolIndex = 0;
        const pool = new Pool(storage, poolIndex);
        const tokenIndex0 = new Field(0);
        const tokenIndex1 = new Field(1);
        const token0liq = new Field(1000);
        const token1liq = new Field(1000);
        const sharePriceK = new Field(10);
        const accumulatedRem = new Field(0);
        await pool.initPoolForTest(tokenIndex0,tokenIndex1,token0liq,token1liq,sharePriceK, accumulatedRem);
        
        const amount = new Field(600);
        const amount_out = new Field(400);
        const k_new = new Field(11);
        const rem_new = new Field(200);
        await pool.updateLiqByAddition(amount,amount_out);
        await pool.updateKAndRem(k_new, rem_new);
        
        const k_new_check = await pool.getSharePriceK();
        const rem_new_check = await pool.getAccumulatedRem();
        expect(k_new_check.toString()).toEqual('11');
        expect(rem_new_check.toString()).toEqual('200');
    });
});
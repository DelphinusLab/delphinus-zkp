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
        await pool.initSharePriceK(k);
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

    test("test getTotalAmount", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);
        
        const poolIndex = 0;
        const pool = new Pool(storage, poolIndex);
        const token0Amount = new Field(500);
        const token1Amount = new Field(500);
        await pool.getAndAddLiq(token0Amount,token1Amount);
        const totalAmount = await pool.getTotalAmount()

        expect(totalAmount.toString()).toEqual('1000');
    });

    test("test getAndUpdateSharePriceK", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);
        
        const poolIndex = 0;
        const pool = new Pool(storage, poolIndex);
        const token0Amount = new Field(500);
        const token1Amount = new Field(500);
        const profit = new Field(1000);
        const k = new Field(10);
        await pool.initSharePriceK(k);
        await pool.getAndAddLiq(token0Amount,token1Amount);
        await pool.getAndUpdateSharePriceK(profit);
        const k_new = await pool.getSharePriceK();

        // kew_new = (500+500)*10/(500+500+1000) = 5
        expect(k_new.toString()).toEqual('5');
    });
});
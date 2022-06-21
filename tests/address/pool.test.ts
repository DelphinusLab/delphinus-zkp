import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../src/circom/address-space";
import { Pool } from "../../src/circom/address/pool"

describe("test pool class", () => {
    test("test getAndInitShareTotal", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);
        
        const poolIndex = 0;
        const pool = new Pool(storage, poolIndex);
        const initShare = new Field(5);
        await pool.getAndInitShareTotal(initShare);
        
        const initShareCheck = await pool.getShareTotal();
        expect(initShareCheck.toString()).toEqual('5');
    });

    test("test getAndUpdateShareTotal", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);
        
        const poolIndex = 0;
        const pool = new Pool(storage, poolIndex);
        const init_share = new Field(5);
        await pool.getAndInitShareTotal(init_share);
        const shareDelta = new Field(5);
        await pool.getAndAddShareTotal(shareDelta);
        
        const shareTotalCheck = await pool.getShareTotal();
        expect(shareTotalCheck.toString()).toEqual('10');
    });
});
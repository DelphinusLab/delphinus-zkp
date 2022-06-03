import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../src/circom/address-space";
import { AddPoolCommand } from "../../src/circom/ops/addpool";
import { Account } from "../../src/circom/address/account";
import { Pool } from "../../src/circom/address/pool";
import { AddressSpace, getSpaceIndex } from "../../src/circom/address/space";

describe("test Addpool op", () => {
    test("Add Pool case", async () => {
        jest.setTimeout(60000);
        let storage: L2Storage = new L2Storage(true);

        const nonce = 1;
        const tokenIndex0 = 0;
        const tokenIndex1 = 1;
        const poolIndex = 0;
        const callerAccountIndex = 1;

        const account = new Account(storage, callerAccountIndex);
        const pool = new Pool(storage, poolIndex);
        const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | poolIndex << 20;
        
        const addpool_command = new AddPoolCommand(
            [
                new Field(0),
                new Field(0),
                new Field(0),
                new Field(nonce),
                new Field(tokenIndex0),
                new Field(tokenIndex1),
                new Field(0),
                new Field(0),
                new Field(poolIndex),
                new Field(callerAccountIndex)
            ]
        );
        await addpool_command.run(storage);

        const nonce_check = await storage.getLeave(account.getAccountNonceIndex());
        const resetPool_check = await storage.getLeaves(poolInfo_Index);
        const initK_check = await storage.getLeave(pool.getSharePriceKIndex());

        expect(nonce_check).toEqual(new Field(nonce + 1));
        expect(resetPool_check).toEqual([new Field(tokenIndex0), new Field(tokenIndex1), new Field(0), new Field(0)]);
        expect(initK_check).toEqual(new Field(10 ** 12));
    });
}
);
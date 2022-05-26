import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";
import { L2Storage } from "../../src/circom/address-space";
import { Account } from "../../src/circom/address/account"
import { Pool } from "../../src/circom/address/pool"
import { SetKeyCommand } from "../../src/circom/ops/setkey";
import { AddPoolCommand } from "../../src/circom/ops/addpool";

describe("test account class", () => {
    test("test getAndAddShare normal number", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);

        const accountIndex = 0;
        const poolIndex = 0;
        const amount0 = new Field(1000);
        const amount1 = new Field(1000);
        const account = new Account(storage, accountIndex);

        await account.getAndAddShare(
            poolIndex,
            new Field(0).add(amount0).add(amount1)
        );

        const shareInfoIndex = account.getShareInfoIndex(poolIndex);
        const leafNode = await storage.getLeave(shareInfoIndex);

        expect(leafNode.v).toEqual(new Field(amount0.v.toNumber() + amount1.v.toNumber()).v);
    });

    test("test getAndUpdateNewShare supply 1000 and retrieve 500", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);

        const accountIndex = 0;
        const poolIndex = 0;
        const amount_supply = new Field(1000);
        const amount_retrieve =  new Field(0).sub(new Field(500));
        const account = new Account(storage, accountIndex);
        const pool = new Pool(storage, poolIndex);
        const k = new Field(11);
        await pool.initSharePriceK(k);
        const SharePriceK = await pool.getSharePriceK();
        
        await account.getAndUpdateNewShare(
            poolIndex,
            SharePriceK,
            amount_supply
        );

        await account.getAndUpdateNewShare(
            poolIndex,
            SharePriceK,
            amount_retrieve
        );
        const shareInfoIndex = account.getShareInfoIndex(poolIndex);
        const leafNode = await storage.getLeave(shareInfoIndex);
        const ans1 = leafNode.v.cmp(new BN(5000));
        const ans2 = leafNode.sub(new Field(5000));

        // Calc: totalShare_new = 1000*(11-1)-500(11-1) = 5000
        // expect(leafNode.v.toNumber()).toEqual(5000);           OK!
        // expect(ans1).toEqual(0);                               OK!
        // expect(ans2).toEqual(new Field(0));                    OK!
        expect(leafNode).toEqual(new Field(5000));              // Not working!
    });

    test("test getAndAddShare 18 wei number", async () => {
        jest.setTimeout(60000);
        let storage: L2Storage = new L2Storage(true);

        const accountIndex = 0;
        const poolIndex = 0;
        const amountBN: BN = new BN(10).pow(new BN(18)).mul(new BN(1000));
        const amount0 = new Field(amountBN);
        const amount1 = new Field(amountBN);
        const account = new Account(storage, accountIndex);

        await account.getAndAddShare(
            poolIndex,
            new Field(0).add(amount0).add(amount1)
        )

        const shareInfoIndex = account.getShareInfoIndex(poolIndex);
        const leafNode = await storage.getLeave(shareInfoIndex);

        expect(leafNode.v).toEqual(amountBN.add(amountBN));
    });
});



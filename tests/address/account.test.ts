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

    test("test getAndUpdateNewShare normal number", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);

        const accountIndex = 0;
        const poolIndex = 0;
        const amount_supply = new Field(1000);
        const amount_retrieve =  new Field(0).sub(new Field(500));
        const account = new Account(storage, accountIndex);
        const pool = new Pool(storage, poolIndex);
        const sharePriceKIndex = await pool.getSharePriceKIndex();
        const k = new Field(10 ** 12);
        await pool.initSharePriceK(k);
        
        await account.getAndUpdateNewShare(
            poolIndex,
            sharePriceKIndex,
            amount_supply
        );

        await account.getAndUpdateNewShare(
            poolIndex,
            sharePriceKIndex,
            amount_retrieve
        );

        const shareInfoIndex = await account.getShareInfoIndex(poolIndex);
        const leafNode = await storage.getLeave(shareInfoIndex);
        const share_0 = amount_supply.mul(k.sub(new Field(1)));
        const share_1 = share_0.add(amount_retrieve.mul(k.sub(new Field(1))));
        const ans = leafNode.sub(share_1);

        expect(ans).toEqual(new Field(0));
    });

    test("getSharePriceK Error Catch", async () => {
        jest.setTimeout(60000); //1 minute timeout
        let storage: L2Storage = new L2Storage(true);

        const accountIndex = 0;
        const poolIndex = 0;
        const account = new Account(storage, accountIndex);
        const pool = new Pool(storage, poolIndex);
        const sharePriceKIndex = await pool.getSharePriceKIndex();

        async function aaa () {
            await account.getSharePriceK(sharePriceKIndex);
        }
        expect(aaa
        ).toThrow();
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



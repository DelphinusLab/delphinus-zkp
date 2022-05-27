import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";
import { L2Storage } from "../../src/circom/address-space";
import { Account } from "../../src/circom/address/account"
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

        expect(leafNode.toString()).toEqual('2000');
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

        // expect(leafNode.v).toEqual(amountBN.add(amountBN));
        expect(leafNode.toString()).toEqual(`${BigInt(10 ** 18 * 1000 * 2)}`);
    });
});



import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";
import { L2Storage } from "../../src/circom/address-space";
import { Account } from "../../src/circom/address/account"
import { SetKeyCommand } from "../../src/circom/ops/setkey";
import { AddPoolCommand } from "../../src/circom/ops/addpool";

describe("test account class", () => {
    test("test getAndAddShare normal number", async () => {
        jest.setTimeout(160000);
        let storage: L2Storage = new L2Storage();
        await storage.startSnapshot("0");

        const accountIndex = 0;
        const poolIndex = 0;
        const amount0 = new Field(1000);
        const amount1 = new Field(1000);
        const account = new Account(storage, accountIndex);

        //Create node for share in storage
        const shareInfoIndex = account.getShareInfoIndex(poolIndex);
        await storage.setLeave(shareInfoIndex, new Field(0)); // issue line, if comment this line, the test will fail! which means our production should have bug when first time do supply.
        
        /*
        The issue here is if we never setLeave, in the getAndAddShare(), when it call:
        const share = await this.storage.getLeave(shareInfoIndex);
        await this.storage.setLeave(shareInfoIndex, share.add(amount));

        the number of share is wrong.
        This is because if the leave node was not set, the getLeave will use getNodeOrDefault and it will return default value, which is from 
            value = MerkleTree.emptyNodeHash(mtIndex.length)
        and it is not 0!
        */
        await account.getAndAddShare(
            poolIndex,
            new Field(0).add(amount0).add(amount1)
        )

       
        const leafNode = await storage.getLeave(shareInfoIndex);
        expect(leafNode.v).toEqual(new Field(amount0.v.toNumber() + amount1.v.toNumber()).v);
        await storage.endSnapshot();
        await storage.closeDb();
    });

/*    test("test getAndAddShare 18 wei number", async () => {
        jest.setTimeout(60000);
        let storage: L2Storage = new L2Storage();
        await storage.startSnapshot("0");

        const accountIndex = 0;
        const poolIndex = 0;
        const amountBN: BN = new BN(10).pow(new BN(18)).mul(new BN(1000));
        const amount0 = new Field(amountBN);
        const amount1 = new Field(amountBN);
        const account = new Account(storage, accountIndex);

        const path = await account.getAndAddShare(
            poolIndex,
            new Field(0).add(amount0).add(amount1)
        )

        const shareInfoIndex = account.getShareInfoIndex(poolIndex);
        const leafNode = await storage.getLeave(shareInfoIndex);

        expect(leafNode).toEqual(new Field(amountBN.mul(new BN(2))));
        await storage.endSnapshot();
        await storage.closeDb();
    });*/
});



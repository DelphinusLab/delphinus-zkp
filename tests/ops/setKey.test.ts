import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../../src/circom/address-space";
import { SetKeyCommand } from "../../src/circom/ops/setkey";
import { Account } from "../../src/circom/address/account";

describe("test SetKey op", () => {
    test("Add key case", async () => {
        jest.setTimeout(60000);
        let storage: L2Storage = new L2Storage(true);
        await storage.startSnapshot("0");
        await storage.endSnapshot();
        await storage.loadSnapshot("0");
        const nonce = 0;
        const accountIndex = 0;
        const ax = new Field(1);
        const ay = new Field(2);
        const args: Field[] = [
            new Field(0),
            new Field(0),
            new Field(0),
            new Field(nonce),
            new Field(accountIndex),
            new Field(0),
            ax,
            ay,
            new Field(0),
            new Field(0)
        ];
        const command = new SetKeyCommand(args);
        const pathInfo = await command.run(storage);

        const account = new Account(storage, accountIndex);
        const leafValues = await storage.getLeaves(account.getAccountPublicKeyIndex());

        expect(leafValues).toEqual([ax, ay, new Field(nonce + 1), new Field(0)]);
    });
}
);



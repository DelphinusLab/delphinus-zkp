import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../src/circom/address-space";
import { RetrieveCommand } from "../../src/circom/ops/retrieve";
import { Account } from "../../src/circom/address/account";
import { Pool } from "../../src/circom/address/pool";
import { AddressSpace, getSpaceIndex } from "../../src/circom/address/space";

describe("test retrieve op", () => {
    test("retrive from pool case", async () => {
        jest.setTimeout(60000);
        let storage: L2Storage = new L2Storage(true);

        const nonce = 2;
        const accountIndex = 2;
        const poolIndex = 0;
        const amount0 = 500;
        const amount1 = 500;
        const tokenIndex0 = 0;
        const tokenIndex1 = 1;
        const depositToken0 = 1000;
        const depositToken1 = 1000;
        const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | poolIndex << 20;
        const amount0_pre = 1000;
        const amount1_pre = 1000; 
        
        //Setup Pool
        const pool = new Pool(storage, new Field(poolIndex));
        const init_sharePriceK = 10 ** 12;
        await pool.resetPool(new Field(tokenIndex0), new Field(tokenIndex1), new Field(init_sharePriceK));
        //Setup Account
        const account = new Account(storage, new Field(accountIndex));
        //account2 deposit 1000 token0
        await account.getAndAddBalance(new Field(tokenIndex0), new Field(depositToken0));
        //account2 deposit 1000 token1
        await account.getAndAddBalance(new Field(tokenIndex1), new Field(depositToken1));
        //account2 supplied 1000 token0 and 1000 token2
        await pool.getAndAddLiq(new Field(amount0_pre),new Field(amount1_pre));
        //Setup share_pre = 0 + (1000 + 1000) * (10^12 - 1) = 2 * 10^15 - 2000
        const share_pre = 0 + ((amount0_pre + amount1_pre) * (init_sharePriceK - 1));
        await account.getAndAddShare(new Field(poolIndex), new Field(share_pre));

        //Setup Expect Results
        //share = 2 * 10^15 - 2000 - (500 + 500) * 10^12 = 2 * 10^15 - 2000 - 1 * 10^15 = 1 * 10^15 - 2000;
        const share = share_pre - (amount0 + amount1) * init_sharePriceK;
        //liq0 = 1000 - 500 = 500
        const liq0 = amount0_pre - amount0;
        //liq1 = 1000 - 500 = 500
        const liq1 = amount1_pre - amount1;
        //token0Balance =  1000 + 500 = 1500
        const token0Balance = depositToken0 + amount0;
        //token1Balance =  1000 + 500 = 1500
        const token1Balance = depositToken1 + amount1;


        const retrieve_command = new RetrieveCommand(
            [
                new Field(0),
                new Field(0),
                new Field(0),
                new Field(nonce),
                new Field(accountIndex),
                new Field(poolIndex),
                new Field(amount0),
                new Field(amount1),
                new Field(0),
                new Field(0)
            ]
        );
        await retrieve_command.run(storage);

        const nonce_check = await storage.getLeave(account.getAccountNonceIndex());
        const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
        const share_check = await storage.getLeave(account.getShareInfoIndex(poolIndex));
        const token0Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[0][0]));
        const token1Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[1][0]));

        expect(nonce_check).toEqual(new Field(nonce + 1));
        expect(tokenIndex0_check.v.toString()).toEqual(`${tokenIndex0}`);
        expect(tokenIndex1_check.v.toString()).toEqual(`${tokenIndex1}`);
        expect(liq0_check.v.toString()).toEqual(`${liq0}`);
        expect(liq1_check.v.toString()).toEqual(`${liq1}`);
        expect(share_check.v.toString()).toEqual(`${share}`);
        expect(token0Balance_check.v.toString()).toEqual(`${token0Balance}`);
        expect(token1Balance_check.v.toString()).toEqual(`${token1Balance}`);
    })
}
);
import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../src/circom/address-space";
import { SwapCommand } from "../../src/circom/ops/swap";
import { Account } from "../../src/circom/address/account";
import { Pool } from "../../src/circom/address/pool";
import { AddressSpace, getSpaceIndex } from "../../src/circom/address/space";
import BN from "bn.js";

describe("test swap op", () => {
    test("swap 100 case", async () => {
        jest.setTimeout(60000);
        let storage: L2Storage = new L2Storage(true);

        const nonce = 3;
        const accountIndex = 2;
        const poolIndex = 0;
        const reverse = 0;
        const amount = 100;
        const tokenIndex0 = 0;
        const tokenIndex1 = 1;
        const depositToken0 = 1500;
        const depositToken1 = 1500;
        const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | poolIndex << 20;
        const amount0_pre = 1000;
        const amount1_pre = 1000; 
        
        //Setup Pool
        const pool = new Pool(storage, new Field(poolIndex));
        await pool.getAndInitTokenIndexAndLiq(new Field(tokenIndex0), new Field(tokenIndex1), new Field(0), new Field(0));
        //Setup Account
        const account = new Account(storage, new Field(accountIndex));
        //account2 deposit 1000 token0
        await account.getAndAddBalance(new Field(tokenIndex0), new Field(depositToken0));
        //account2 deposit 1000 token1
        await account.getAndAddBalance(new Field(tokenIndex1), new Field(depositToken1));
        //account2 supplied 1000 token0 and 1000 token2
        await pool.getAndUpdateLiqByAddition(new Field(amount0_pre),new Field(amount1_pre));

        //Setup Expect Results
        const liq0 = amount0_pre + amount;
        const amount_out = Math.floor(amount1_pre * amount * 1021 / ((amount1_pre + amount) * 1024));
        const liq1 = amount1_pre - amount_out; 
        const token0Balance = depositToken0 - amount;
        const token1Balance = depositToken1 + amount_out;
        
        const swap_command = new SwapCommand(
            [
                new Field(0),
                new Field(0),
                new Field(0),
                new Field(nonce),
                new Field(accountIndex),
                new Field(poolIndex),
                new Field(reverse),
                new Field(amount),
                new Field(0),
                new Field(0)
            ]
        );
        await swap_command.run(storage);

        const nonce_check = await storage.getLeave(account.getAccountNonceAddress());
        const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
        const token0Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[0]));
        const token1Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[1]));

        expect(nonce_check).toEqual(new Field(nonce + 1));
        expect(tokenIndex0_check.v.toString()).toEqual(`${tokenIndex0}`);
        expect(tokenIndex1_check.v.toString()).toEqual(`${tokenIndex1}`);
        expect(liq0_check.v.toString()).toEqual(`${liq0}`);
        expect(liq1_check.v.toString()).toEqual(`${liq1}`);
        expect(token0Balance_check.v.toString()).toEqual(`${token0Balance}`);
        expect(token1Balance_check.v.toString()).toEqual(`${token1Balance}`);
    });

}
);

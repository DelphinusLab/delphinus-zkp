import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../src/circom/address-space";
import { SupplyCommand } from "../../src/circom/ops/supply";
import { Account } from "../../src/circom/address/account";
import { Pool } from "../../src/circom/address/pool";
import { AddressSpace, getSpaceIndex } from "../../src/circom/address/space";
import { BN } from "bn.js";

describe("test supply op", () => {
    test("supply to empty pool case", async () => {
        jest.setTimeout(60000);
        let storage: L2Storage = new L2Storage(true);

        const nonce = 1;
        const accountIndex = 2;
        const poolIndex = 0;
        const amount0 = 1000;
        const amount1 = 1000;
        const tokenIndex0 = 0;
        const tokenIndex1 = 1;
        const depositToken0 = 2000;
        const depositToken1 = 2000;
        const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | poolIndex << 20;
        
        //Setup Pool
        const pool = new Pool(storage, poolIndex);
        await pool.getAndInitTokenIndexAndLiq(new Field(tokenIndex0), new Field(tokenIndex1), new Field(0), new Field(0))
        await pool.getAndInitShareTotal(new Field(0));
        //Setup Account
        const account = new Account(storage, accountIndex);
        //account2 deposit 2000 token0
        await account.getAndAddBalance(new Field(tokenIndex0), new Field(depositToken0));
        //account2 deposit 2000 token1
        await account.getAndAddBalance(new Field(tokenIndex1), new Field(depositToken1));

        //Setup Expect Results
        //share = 1000 * 10^15
        const share = amount0 * (10**15);
        //liq0 = 1000 = 1000
        const liq0 = amount0;
        //liq1 = 1000 = 1000
        const liq1 = amount1;
        //token0Balance =  2000 - 1000 = 1000
        const token0Balance = depositToken0 - amount0;
        //token1Balance =  2000 - 1000 = 1000
        const token1Balance = depositToken1 - amount1;

        const supply_command = new SupplyCommand(
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
        await supply_command.run(storage);

        const nonce_check = await storage.getLeave(account.getAccountNonceAddress());
        const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
        const share_check = await storage.getLeave(account.getShareInfoAddress(poolIndex));
        const token0Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[0]));
        const token1Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[1]));
        const ShareTotal_check = await storage.getLeave(pool.getShareTotalAddress());

        expect(nonce_check).toEqual(new Field(nonce + 1));
        expect(tokenIndex0_check.v.toString()).toEqual(`${tokenIndex0}`);
        expect(tokenIndex1_check.v.toString()).toEqual(`${tokenIndex1}`);
        expect(liq0_check.v.toString()).toEqual(`${liq0}`);
        expect(liq1_check.v.toString()).toEqual(`${liq1}`);
        expect(share_check.v.toString()).toEqual(`${share}`);
        expect(token0Balance_check.v.toString()).toEqual(`${token0Balance}`);
        expect(token1Balance_check.v.toString()).toEqual(`${token1Balance}`);
        expect(ShareTotal_check.v.toString()).toEqual(`${share}`);
    });

    test("supply to exist pool case", async () => {
        jest.setTimeout(60000);
        let storage: L2Storage = new L2Storage(true);

        const nonce = 1;
        const accountIndex = 2;
        const poolIndex = 0;
        const amount0 = 1000;
        const amount1 = 1000;
        const tokenIndex0 = 0;
        const tokenIndex1 = 1;
        const depositToken0 = 2000;
        const depositToken1 = 2000;
        const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | poolIndex << 20;
        const amount0_pre = 1000;
        const amount1_pre = 1000;

        //Setup Pool
        const pool = new Pool(storage, poolIndex);
        await pool.getAndInitTokenIndexAndLiq(new Field(tokenIndex0), new Field(tokenIndex1), new Field(0), new Field(0))
        //Setup Account
        const account = new Account(storage, accountIndex);
        //account2 deposit 2000 token0
        await account.getAndAddBalance(new Field(tokenIndex0), new Field(depositToken0));
        //account2 deposit 2000 token1
        await account.getAndAddBalance(new Field(tokenIndex1), new Field(depositToken1));
        //account2 supplied 1000 token0 and 1000 token2
        await pool.getAndUpdateLiqByAddition(new Field(amount0_pre),new Field(amount1_pre));
        //Setup share_pre = 1000 * 10^15
        const amp = new Field(10**15);
        const share_pre = new Field(amount0_pre).mul(amp);
        //Setup user.share
        await account.getAndAddShare(poolIndex, share_pre);
        //Setup pool.totalShare
        await pool.getAndInitShareTotal(share_pre);

        //Setup Expect Results
        //share = 1000 * 10^15 + 1000 * 1000 * 10^15/1000 = 2000000000000000000;
        const share = share_pre.add(new Field(amount0).mul(share_pre).div(new Field(amount0_pre)));
        //liq0 = 1000 + 1000 = 2000
        const liq0 = amount0_pre + amount0;
        //liq1 = 1000 + 1000 = 2000
        const liq1 = amount1_pre + amount1;
        //token0Balance =  2000 - 1000 = 1000
        const token0Balance = depositToken0 - amount0;
        //token1Balance =  2000 - 1000 = 1000
        const token1Balance = depositToken1 - amount1;

        const supply_command = new SupplyCommand(
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
        await supply_command.run(storage);

        const nonce_check = await storage.getLeave(account.getAccountNonceAddress());
        const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
        const share_check = await storage.getLeave(account.getShareInfoAddress(poolIndex));
        const token0Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[0]));
        const token1Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[1]));
        const ShareTotal_check = await storage.getLeave(pool.getShareTotalAddress());

        expect(nonce_check).toEqual(new Field(nonce + 1));
        expect(tokenIndex0_check.v.toString()).toEqual(`${tokenIndex0}`);
        expect(tokenIndex1_check.v.toString()).toEqual(`${tokenIndex1}`);
        expect(liq0_check.v.toString()).toEqual(`${liq0}`);
        expect(liq1_check.v.toString()).toEqual(`${liq1}`);
        expect(share_check.v.toString()).toEqual(`${share}`);
        expect(token0Balance_check.v.toString()).toEqual(`${token0Balance}`);
        expect(token1Balance_check.v.toString()).toEqual(`${token1Balance}`);
        expect(ShareTotal_check.v.toString()).toEqual(`${share}`);
    });
}
);
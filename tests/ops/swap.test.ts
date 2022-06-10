import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../src/circom/address-space";
import { SwapCommand } from "../../src/circom/ops/swap";
import { Account } from "../../src/circom/address/account";
import { Pool, initSharePriceKBN } from "../../src/circom/address/pool";
import { AddressSpace, getSpaceIndex } from "../../src/circom/address/space";
import BN from "bn.js";

describe("test swap op", () => {
    test("swap 600 case & sharePriceK with old rem and new rem being 0", async () => {
        jest.setTimeout(60000);
        let storage: L2Storage = new L2Storage(true);

        const nonce = 3;
        const accountIndex = 2;
        const poolIndex = 0;
        const reverse = 0;
        const amount = 600;
        const tokenIndex0 = 0;
        const tokenIndex1 = 1;
        const depositToken0 = 1500;
        const depositToken1 = 1500;
        const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | poolIndex << 20;
        const amount0_pre = 1627;
        const amount1_pre = 373; 
        
        //Setup Pool
        const pool = new Pool(storage, new Field(poolIndex));
        await pool.initPoolForTest(new Field(tokenIndex0), new Field(tokenIndex1), new Field(0), new Field(0), new Field(initSharePriceKBN), new Field(0));
        //Setup Account
        const account = new Account(storage, new Field(accountIndex));
        //account2 deposit token0
        await account.getAndAddBalance(new Field(tokenIndex0), new Field(depositToken0));
        //account2 deposit token1
        await account.getAndAddBalance(new Field(tokenIndex1), new Field(depositToken1));
        //account2 supplied token0 and token1 to the pool
        await pool.getAndUpdateLiqByAddition(new Field(amount0_pre),new Field(amount1_pre));

        //Setup Expect Results
        let amount_out, sharePriceK, rem, total_old, total_new, liq0, liq1, token0Balance, token1Balance
        //(reverse == 0) amount_out = 373 * 600 * 1021 / [(1627 + 600) * 1024] = 100.199 rounding down => 100
        //(reverse == 0) rem = [(373 + 1627) * 10^12] % (373 + 1627 + 600 - 100) = 0
        //(reverse == 0) (rem != 0) sharePriceK = (373 + 1627) * 10^12 / (373 + 1627 + 600 - 100) = 800000000000
        if (reverse == 0){
            amount_out = Math.floor(amount1_pre * amount * 1021 / ((amount0_pre + amount) * 1024));
        }else {
            amount_out = Math.floor(amount0_pre * amount * 1021 / ((amount1_pre + amount) * 1024));
        };
        total_old = new BN(amount0_pre + amount1_pre);
        total_new = total_old.add(new BN(amount - amount_out));
        rem = total_old.mul(initSharePriceKBN).mod(total_new);
        if (rem.eqn(0)){
            sharePriceK = total_old.mul(initSharePriceKBN).div(total_new);
        }else {
            sharePriceK = total_old.mul(initSharePriceKBN).div(total_new).add(new BN(1));
            rem = total_new.sub(rem);
        }
        //(reverse == 0) liq0 = 1627 + 600 = 2227
        if (reverse == 0) {
            liq0 = amount0_pre + amount;
        }else {
            liq0 = amount0_pre - amount_out;
        }
        //(reverse == 0) liq1 = 373 - 100 = 273
        if (reverse == 0) {
            liq1 = amount1_pre - amount_out;
        }else {
            liq1 = amount1_pre + amount;
        }
        //(reverse == 0) token0Balance = 1500 - 600 = 900
        if (reverse == 0) {
            token0Balance = depositToken0 - amount;
        }else {
            token0Balance = depositToken0 + amount_out;
        }
        //(reverse == 0) token1Balance = 1500 + 100 = 1600
        if (reverse == 0) {
            token1Balance = depositToken1 + amount_out;
        }else {
            token1Balance = depositToken1 - amount;
        }
        
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

        const nonce_check = await storage.getLeave(account.getAccountNonceIndex());
        const sharePriceK_check = await storage.getLeave(pool.getSharePriceKIndex());
        const accumulatedRem_check = await storage.getLeave(pool.getAccumulatedRemIndex());
        const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
        const token0Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenIndexAndLiq())[0]));
        const token1Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenIndexAndLiq())[1]));

        expect(nonce_check).toEqual(new Field(nonce + 1));
        expect(tokenIndex0_check.v.toString()).toEqual(`${tokenIndex0}`);
        expect(tokenIndex1_check.v.toString()).toEqual(`${tokenIndex1}`);
        expect(sharePriceK_check.v.toString()).toEqual(`${sharePriceK}`);
        expect(accumulatedRem_check.v.toString()).toEqual(`${rem}`);
        expect(liq0_check.v.toString()).toEqual(`${liq0}`);
        expect(liq1_check.v.toString()).toEqual(`${liq1}`);
        expect(token0Balance_check.v.toString()).toEqual(`${token0Balance}`);
        expect(token1Balance_check.v.toString()).toEqual(`${token1Balance}`);
    });

    test("swap 100 case & sharePriceK with new rem", async () => {
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
        await pool.initPoolForTest(new Field(tokenIndex0), new Field(tokenIndex1),new Field(0), new Field(0), new Field(initSharePriceKBN), new Field(0));
        //Setup Account
        const account = new Account(storage, new Field(accountIndex));
        //account2 deposit 1000 token0
        await account.getAndAddBalance(new Field(tokenIndex0), new Field(depositToken0));
        //account2 deposit 1000 token1
        await account.getAndAddBalance(new Field(tokenIndex1), new Field(depositToken1));
        //account2 supplied 1000 token0 and 1000 token2
        await pool.getAndUpdateLiqByAddition(new Field(amount0_pre),new Field(amount1_pre));

        //Setup Expect Results
        let amount_out, sharePriceK, rem, total_old, total_new, liq0, liq1, token0Balance, token1Balance
        //(reverse == 0) amount_out = 1000 * 100 * 1021 / [(1000 + 100) * 1024] = 90.64 rounding down => 90
        //(reverse == 0) rem = [(1000 + 1000) * 10^24] % (1000 + 1000 + 100 - 90) = 1190
        //(reverse == 0) (rem != 0) sharePriceK = (1000 + 1000) * 10^24 / (1000 + 1000 + 100 - 90) + 1 = 995024875621890547263682

        if (reverse == 0){
            amount_out = Math.floor(amount1_pre * amount * 1021 / ((amount0_pre + amount) * 1024));
        }else {
            amount_out = Math.floor(amount0_pre * amount * 1021 / ((amount1_pre + amount) * 1024));
        };
        total_old = new BN(amount0_pre + amount1_pre);
        total_new = total_old.add(new BN(amount - amount_out));
        rem = total_old.mul(initSharePriceKBN).mod(total_new);
        if (rem.eqn(0)){
            sharePriceK = total_old.mul(initSharePriceKBN).div(total_new);
        }else {
            sharePriceK = total_old.mul(initSharePriceKBN).div(total_new).add(new BN(1));
            rem = total_new.sub(rem);
        }
        //(reverse == 0) liq0 = 1000 + 100 = 1100
        if (reverse == 0) {
            liq0 = amount0_pre + amount;
        }else {
            liq0 = amount0_pre - amount_out;
        }
        //(reverse == 0) liq1 = 1000 - 90 = 910
        if (reverse == 0) {
            liq1 = amount1_pre - amount_out;
        }else {
            liq1 = amount1_pre + amount;
        }
        //(reverse == 0) token0Balance = 1500 - 100 = 1400
        if (reverse == 0) {
            token0Balance = depositToken0 - amount;
        }else {
            token0Balance = depositToken0 + amount_out;
        }
        //(reverse == 0) token1Balance = 1500 + 90 = 1590
        if (reverse == 0) {
            token1Balance = depositToken1 + amount_out;
        }else {
            token1Balance = depositToken1 - amount;
        }
        
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

        const nonce_check = await storage.getLeave(account.getAccountNonceIndex());
        const sharePriceK_check = await storage.getLeave(pool.getSharePriceKIndex());
        const accumulatedRem_check = await storage.getLeave(pool.getAccumulatedRemIndex());
        const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
        const token0Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenIndexAndLiq())[0]));
        const token1Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenIndexAndLiq())[1]));

        expect(nonce_check).toEqual(new Field(nonce + 1));
        expect(tokenIndex0_check.v.toString()).toEqual(`${tokenIndex0}`);
        expect(tokenIndex1_check.v.toString()).toEqual(`${tokenIndex1}`);
        expect(sharePriceK_check.v.toString()).toEqual(`${sharePriceK}`);
        expect(accumulatedRem_check.v.toString()).toEqual(`${rem}`);
        expect(liq0_check.v.toString()).toEqual(`${liq0}`);
        expect(liq1_check.v.toString()).toEqual(`${liq1}`);
        expect(token0Balance_check.v.toString()).toEqual(`${token0Balance}`);
        expect(token1Balance_check.v.toString()).toEqual(`${token1Balance}`);
    });

    test("swap 100 case multiple times & error control", async () => {
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
        const swap_times = 3;    //modify to check different swap times
        
        //Setup Pool
        const pool = new Pool(storage, new Field(poolIndex));
        await pool.initPoolForTest(new Field(tokenIndex0), new Field(tokenIndex1), new Field(0), new Field(0), new Field(initSharePriceKBN), new Field(0));
        //Setup Account
        const account = new Account(storage, new Field(accountIndex));
        //account2 deposit 1000 token0
        await account.getAndAddBalance(new Field(tokenIndex0), new Field(depositToken0));
        //account2 deposit 1000 token1
        await account.getAndAddBalance(new Field(tokenIndex1), new Field(depositToken1));
        //account2 supplied 1000 token0 and 1000 token2
        await pool.getAndUpdateLiqByAddition(new Field(amount0_pre),new Field(amount1_pre));

        //Setup Expect Results
        //1: First time swap 100
        //(reverse == 0) amount_out_1 = 1000 * 100 * 1021 / [(1000 + 100) * 1024] = 90.64 rounding down => 90
        //profit_1 = 100 - 90 = 10
        //total_profit = 0 + 10 = 10
        //(reverse == 0) Check: rem = [(1000 + 1000) * 10^24] % (1000 + 1000 + 10) = 1190
        //(reverse == 0) (rem != 0) sharePriceK_1 = (1000 + 1000) * 10^24 / (1000 + 1000 + 100 - 90) + 1 = 995024875621890547263682
        //(reverse == 0) liq0_1 = 1000 + 100 = 1100
        //(reverse == 0) liq1_1 = 1000 - 90 = 910
        //(reverse == 0) token0Balance_1 = 1500 - 100 = 1400
        //(reverse == 0) token1Balance_1 = 1500 + 90 = 1590

        //2: Second time swap 100
        //(reverse == 0) amount_out_2 = 910 * 100 * 1021 / [(1100 + 100) * 1024] = 75.61 rounding down => 75
        //profit_2 = 100 - 75 = 25
        //total_profit = 10 + 25 = 35
        //(reverse == 0) Check: rem = [(1000 + 1000) * 10^24] % (1000 + 1000 + 35) = 2000
        //(reverse == 0) (rem != 0) sharePriceK_2 = (1000 + 1000) * 10^24 / (1000 + 1000 + 35) + 1 = 982800982800982800982801
        //(reverse == 0) liq0_2 = 1100 + 100 = 1200
        //(reverse == 0) liq1_2 = 910 - 75 = 835
        //(reverse == 0) token0Balance_2 = 1400 - 100 = 1300
        //(reverse == 0) token1Balance_2 = 1590 + 75 = 1665

        //3: Third time swap 100
        //(reverse == 0) amount_out_3 = 835 * 100 * 1021 / [(1200 + 100) * 1024] = 64.04 rounding down => 64
        //profit_3 = 100 - 64 = 36
        //total_profit = 10 + 25 + 36 = 71
        //(reverse == 0) Check: rem = [(1000 + 1000) * 10^24] % (1000 + 1000 + 71) = 720
        //(reverse == 0) (rem != 0) sharePriceK_3 = (1000 + 1000) * 10^24 / (1000 + 1000 + 71) + 1 = 965717044905842588121681

        //(reverse == 0) liq0_3 = 1200 + 100 = 1300
        //(reverse == 0) liq1_3 = 835 - 64 = 771
        //(reverse == 0) token0Balance_3 = 1300 - 100 = 1200
        //(reverse == 0) token1Balance_3 = 1665 + 64 = 1729
        let total_profit = 0, sharePriceK = initSharePriceKBN, rem = new BN(0), liq0 = amount0_pre, liq1 = amount1_pre, token0Balance = depositToken0, token1Balance = depositToken1;
        let pool_total_old, pool_total_new, rem_new, share_new;
        for (let i = 0; i < swap_times; i++){
            const amount_out = Math.floor(liq1 * amount * 1021 / ((liq0 + amount) * 1024));
            total_profit = total_profit + amount - amount_out;
            pool_total_old = new BN(liq0 + liq1);
            pool_total_new = pool_total_old.add(new BN(amount - amount_out));
            share_new = pool_total_old.mul(sharePriceK).sub(rem).div(pool_total_new);
            rem_new = pool_total_old.mul(sharePriceK).sub(rem).mod(pool_total_new);
            if (rem_new.eqn(0)){
                sharePriceK = share_new;
                rem = rem_new;
            }else{
                sharePriceK = share_new.add(new BN(1));
                rem = pool_total_new.sub(rem_new);
            }
            liq0 = liq0 + amount;
            liq1 = liq1 - amount_out;
            token0Balance = token0Balance - amount;
            token1Balance = token1Balance + amount_out;
        }
        
        //run command `swap_times` times
        for (let i = 0; i < swap_times; i++){
            const swap_command = new SwapCommand(
                [
                    new Field(0),
                    new Field(0),
                    new Field(0),
                    new Field(nonce + i),
                    new Field(accountIndex),
                    new Field(poolIndex),
                    new Field(reverse),
                    new Field(amount),
                    new Field(0),
                    new Field(0)
                ]
            );
            await swap_command.run(storage);
        }

        const nonce_check = await storage.getLeave(account.getAccountNonceIndex());
        const sharePriceK_check = await storage.getLeave(pool.getSharePriceKIndex());
        const accumulatedRem_check = await storage.getLeave(pool.getAccumulatedRemIndex());
        const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
        const token0Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenIndexAndLiq())[0]));
        const token1Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenIndexAndLiq())[1]));

        expect(nonce_check).toEqual(new Field(nonce + swap_times));
        expect(tokenIndex0_check.v.toString()).toEqual(`${tokenIndex0}`);
        expect(tokenIndex1_check.v.toString()).toEqual(`${tokenIndex1}`);
        expect(sharePriceK_check.v.toString()).toEqual(`${sharePriceK}`);
        expect(accumulatedRem_check.v.toString()).toEqual(`${rem}`);
        expect(liq0_check.v.toString()).toEqual(`${liq0}`);
        expect(liq1_check.v.toString()).toEqual(`${liq1}`);
        expect(token0Balance_check.v.toString()).toEqual(`${token0Balance}`);
        expect(token1Balance_check.v.toString()).toEqual(`${token1Balance}`);
    });
}
);

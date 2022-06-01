import { Field } from "delphinus-curves/src/field";
import BN from "bn.js";
import { L2Storage } from "../../src/circom/address-space";
import { SwapCommand } from "../../src/circom/ops/swap";
import { Account } from "../../src/circom/address/account";
import { Pool } from "../../src/circom/address/pool";
import { AddressSpace, getSpaceIndex } from "../../src/circom/address/space";

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
        const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
        const token0Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[0][0]));
        const token1Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[1][0]));

        expect(nonce_check).toEqual(new Field(nonce + 1));
        expect(tokenIndex0_check.v.toString()).toEqual(`${tokenIndex0}`);
        expect(tokenIndex1_check.v.toString()).toEqual(`${tokenIndex1}`);
        if (reverse == 0){
            const amount_out_r0 = Math.floor(amount1_pre * amount * 1021 / ((amount0_pre + amount) * 1024));
            const rem = (amount0_pre + amount1_pre) * init_sharePriceK % (amount0_pre + amount1_pre + amount + amount_out_r0)
            let k_new_r0;
            if (rem == 0){
                k_new_r0 = Math.floor((amount0_pre + amount1_pre) * init_sharePriceK / (amount0_pre + amount1_pre + amount - amount_out_r0))
            }else {
                k_new_r0 = Math.floor((amount0_pre + amount1_pre) * init_sharePriceK / (amount0_pre + amount1_pre + amount - amount_out_r0)) + 1;
            }
            expect(sharePriceK_check.v.toString()).toEqual(`${k_new_r0}`);
            expect(liq0_check.v.toString()).toEqual(`${amount0_pre + amount}`);
            expect(liq1_check.v.toString()).toEqual(`${amount1_pre - amount_out_r0}`);
            expect(token0Balance_check.v.toString()).toEqual(`${depositToken0 - amount_out_r0}`);
            expect(token1Balance_check.v.toString()).toEqual(`${depositToken1 + amount}`);
        }else if (reverse == 1) {
            const amount_out_r1 = Math.floor(amount0_pre * amount * 1021 / ((amount1_pre + amount) * 1024));
            const rem = (amount0_pre + amount1_pre) * init_sharePriceK % (amount0_pre + amount1_pre + amount + amount_out_r1)
            let k_new_r1;
            if (rem == 0){
                k_new_r1 = Math.floor((amount0_pre + amount1_pre) * init_sharePriceK / (amount0_pre + amount1_pre + amount - amount_out_r1))
            }else {
                k_new_r1 = Math.floor((amount0_pre + amount1_pre) * init_sharePriceK / (amount0_pre + amount1_pre + amount - amount_out_r1)) + 1;
            }
            expect(sharePriceK_check.v.toString()).toEqual(`${k_new_r1}`);
            expect(liq0_check.v.toString()).toEqual(`${amount0_pre - amount_out_r1}`);
            expect(liq1_check.v.toString()).toEqual(`${amount1_pre + amount}`);
            expect(token0Balance_check.v.toString()).toEqual(`${depositToken0 + amount}`);
            expect(token1Balance_check.v.toString()).toEqual(`${depositToken1 - amount_out_r1}`);
        }
    })
}
);
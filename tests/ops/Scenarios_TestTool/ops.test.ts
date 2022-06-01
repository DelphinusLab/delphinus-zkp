import { Field } from "delphinus-curves/src/field";
import { BN } from "bn.js";
import { L2Storage } from "../../../src/circom/address-space";
import { SetKeyCommand } from "../../../src/circom/ops/setkey";
import { AddPoolCommand } from "../../../src/circom/ops/addpool";
import { DepositCommand } from "../../../src/circom/ops/deposit";
import { SupplyCommand } from "../../../src/circom/ops/supply";
import { RetrieveCommand } from "../../../src/circom/ops/retrieve";
import { SwapCommand } from "../../../src/circom/ops/swap";
import { Account } from "../../../src/circom/address/account";
import { Pool } from "../../../src/circom/address/pool";
import { AddressSpace, getSpaceIndex } from "../../../src/circom/address/space";
import fs from "fs-extra";
import { ShareCalcHelper } from "../../../src/circom/shareCalc_helper";

describe("test ops", () => {
    test("test Input json scenario", async () => {
        jest.setTimeout(120000);
        let storage: L2Storage = new L2Storage(true);

        //test scenario1
        const config = await fs.readJSONSync(`${__dirname}/examples/scenario1.json`);
        
        for (let i = 0; i < config.scenario.length; i++) {
            const account = new Account(storage, config.scenario[i].accountIndex);

            if(config.scenario[i].op_name == 'setkey'){
                const setkey_command = new SetKeyCommand(
                    [
                        new Field(0),
                        new Field(0),
                        new Field(0),
                        new Field(config.scenario[i].nonce),
                        new Field(config.scenario[i].accountIndex),
                        new Field(0),
                        new Field(config.scenario[i].ax),
                        new Field(config.scenario[i].ay),
                        new Field(0),
                        new Field(0)
                    ]
                );
                await setkey_command.run(storage);

                const leafValues_check = await storage.getLeaves(account.getAccountPublicKeyIndex());

                expect(leafValues_check).toEqual([new Field(config.scenario[i].ax), new Field(config.scenario[i].ay), new Field(config.scenario[i].nonce + 1), new Field(0)]);
            }else if(config.scenario[i].op_name == 'addpool'){
                const account = new Account(storage, config.scenario[i].callerAccountIndex);
                const pool = new Pool(storage, config.scenario[i].poolIndex);
                const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | config.scenario[i].poolIndex << 20;
                
                const addpool_command = new AddPoolCommand(
                    [
                        new Field(0),
                        new Field(0),
                        new Field(0),
                        new Field(config.scenario[i].nonce),
                        new Field(config.scenario[i].tokenIndex0),
                        new Field(config.scenario[i].tokenIndex1),
                        new Field(0),
                        new Field(0),
                        new Field(config.scenario[i].poolIndex),
                        new Field(config.scenario[i].callerAccountIndex)
                    ]
                );
                await addpool_command.run(storage);

                const nonce_check = await storage.getLeave(account.getAccountNonceIndex());
                const resetPool_check = await storage.getLeaves(poolInfo_Index);
                const initK_check = await storage.getLeave(pool.getSharePriceKIndex());
        
                expect(nonce_check).toEqual(new Field(config.scenario[i].nonce + 1));
                expect(resetPool_check).toEqual([new Field(config.scenario[i].tokenIndex0), new Field(config.scenario[i].tokenIndex1), new Field(0), new Field(0)]);
                expect(initK_check).toEqual(new Field(10 ** 12));
            }else if(config.scenario[i].op_name == 'deposit'){
                const caller = new Account(storage, config.scenario[i].callerAccountIndex);
                const account = new Account(storage, config.scenario[i].accountIndex);
                const balance = await storage.getLeave(account.getBalanceInfoIndex(config.scenario[i].tokenIndex));
                
                const deposit_command = new DepositCommand(
                    [
                        new Field(0),
                        new Field(0),
                        new Field(0),
                        new Field(config.scenario[i].nonce),
                        new Field(config.scenario[i].accountIndex),
                        new Field(config.scenario[i].tokenIndex),
                        new Field(config.scenario[i].amount),
                        new Field(0),
                        new Field(config.scenario[i].callerAccountIndex),
                        new Field(0)
                    ]
                );
                await deposit_command.run(storage);

                const nonce_check = await storage.getLeave(caller.getAccountNonceIndex());
                const balance_check = await storage.getLeave(account.getBalanceInfoIndex(config.scenario[i].tokenIndex));

                expect(nonce_check).toEqual(new Field(config.scenario[i].nonce + 1));
                expect(balance_check.v.toString()).toEqual(balance.v.add(new BN(config.scenario[i].amount)).toString());
            }else if(config.scenario[i].op_name == 'supply'){
                const pool = new Pool(storage, config.scenario[i].poolIndex);
                const account = new Account(storage, config.scenario[i].accountIndex);
                const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | config.scenario[i].poolIndex << 20;
                const [tokenIndex0,tokenIndex1,liq0,liq1] = await storage.getLeaves(poolInfo_Index);
                const share = await storage.getLeave(account.getShareInfoIndex(config.scenario[i].poolIndex));
                const token0Balance = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[0][0]));
                const token1Balance = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[1][0]));

                const supply_command = new SupplyCommand(
                    [
                        new Field(0),
                        new Field(0),
                        new Field(0),
                        new Field(config.scenario[i].nonce),
                        new Field(config.scenario[i].accountIndex),
                        new Field(config.scenario[i].poolIndex),
                        new Field(config.scenario[i].amount0),
                        new Field(config.scenario[i].amount1),
                        new Field(0),
                        new Field(0)
                    ]
                );
                await supply_command.run(storage);

                const nonce_check = await storage.getLeave(account.getAccountNonceIndex());
                const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
                const share_check = await storage.getLeave(account.getShareInfoIndex(config.scenario[i].poolIndex));
                const share_new = new BN(config.scenario[i].amount0).add(new BN(config.scenario[i].amount1)).mul((await pool.getSharePriceK()).sub(new Field(1)).v);
                const token0Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[0][0]));
                const token1Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[1][0]));

                expect(nonce_check).toEqual(new Field(config.scenario[i].nonce + 1));
                expect(tokenIndex0_check.v.toString()).toEqual(tokenIndex0.v.toString());
                expect(tokenIndex1_check.v.toString()).toEqual(tokenIndex1.v.toString());
                expect(liq0_check.v.toString()).toEqual(liq0.v.add(new BN(config.scenario[i].amount0)).toString());
                expect(liq1_check.v.toString()).toEqual(liq1.v.add(new BN(config.scenario[i].amount1)).toString());
                expect(share_check.v.toString()).toEqual(share.v.add(share_new).toString());
                expect(token0Balance_check.v.toString()).toEqual(token0Balance.v.sub(new BN(config.scenario[i].amount0)).toString());
                expect(token1Balance_check.v.toString()).toEqual(token1Balance.v.sub(new BN(config.scenario[i].amount1)).toString());
            }else if(config.scenario[i].op_name == 'retrieve'){
                const pool = new Pool(storage, config.scenario[i].poolIndex);
                const account = new Account(storage, config.scenario[i].accountIndex);
                const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | config.scenario[i].poolIndex << 20;
                const [tokenIndex0,tokenIndex1,liq0,liq1] = await storage.getLeaves(poolInfo_Index);
                const share = await storage.getLeave(account.getShareInfoIndex(config.scenario[i].poolIndex));
                const token0Balance = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[0][0]));
                const token1Balance = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[1][0]));

                const retrieve_command = new RetrieveCommand(
                    [
                        new Field(0),
                        new Field(0),
                        new Field(0),
                        new Field(config.scenario[i].nonce),
                        new Field(config.scenario[i].accountIndex),
                        new Field(config.scenario[i].poolIndex),
                        new Field(config.scenario[i].amount0),
                        new Field(config.scenario[i].amount1),
                        new Field(0),
                        new Field(0)
                    ]
                );
                await retrieve_command.run(storage);

                const nonce_check = await storage.getLeave(account.getAccountNonceIndex());
                const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
                const share_check = await storage.getLeave(account.getShareInfoIndex(config.scenario[i].poolIndex));
                const share_new = new BN(config.scenario[i].amount0).add(new BN(config.scenario[i].amount1)).mul((await pool.getSharePriceK()).v);
                const token0Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[0][0]));
                const token1Balance_check = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[1][0]));

                expect(nonce_check).toEqual(new Field(config.scenario[i].nonce + 1));
                expect(tokenIndex0_check.v.toString()).toEqual(tokenIndex0.v.toString());
                expect(tokenIndex1_check.v.toString()).toEqual(tokenIndex1.v.toString());
                expect(liq0_check.v.toString()).toEqual(liq0.v.sub(new BN(config.scenario[i].amount0)).toString());
                expect(liq1_check.v.toString()).toEqual(liq1.v.sub(new BN(config.scenario[i].amount1)).toString());
                expect(share_check.v.toString()).toEqual(share.v.sub(share_new).toString());
                expect(token0Balance_check.v.toString()).toEqual(token0Balance.v.add(new BN(config.scenario[i].amount0)).toString());
                expect(token1Balance_check.v.toString()).toEqual(token1Balance.v.add(new BN(config.scenario[i].amount1)).toString());
            }else if(config.scenario[i].op_name == 'swap'){
                const pool = new Pool(storage, config.scenario[i].poolIndex);
                const account = new Account(storage, config.scenario[i].accountIndex);
                const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | config.scenario[i].poolIndex << 20;
                const sharePriceK = await pool.getSharePriceK();
                const [tokenIndex0,tokenIndex1,liq0,liq1] = await storage.getLeaves(poolInfo_Index);
                const token0Balance = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[0][0]));
                const token1Balance = await storage.getLeave(account.getBalanceInfoIndex((await pool.getTokenInfo())[1][0]));

                const swap_command = new SwapCommand(
                    [
                        new Field(0),
                        new Field(0),
                        new Field(0),
                        new Field(config.scenario[i].nonce),
                        new Field(config.scenario[i].accountIndex),
                        new Field(config.scenario[i].poolIndex),
                        new Field(config.scenario[i].reverse),
                        new Field(config.scenario[i].amount),
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

                const shareCalc = new ShareCalcHelper;
                expect(nonce_check).toEqual(new Field(config.scenario[i].nonce + 1));
                expect(tokenIndex0_check.v.toString()).toEqual(tokenIndex0.v.toString());
                expect(tokenIndex1_check.v.toString()).toEqual(tokenIndex1.v.toString());
                if (config.scenario[i].reverse == 0){
                    const amount_out0 = shareCalc.calcAmountOut_AMM(new BN(config.scenario[i].amount),liq1.v,liq0.v);
                    const k0_new = shareCalc.calcK_new(liq0.v.add(liq1.v), liq0.v.add(liq1.v).add(new BN(config.scenario[i].amount)).sub(amount_out0.v), sharePriceK.v);
                    expect(k0_new.v.toString()).toEqual(sharePriceK_check.v.toString());
                    expect(liq0_check.v.toString()).toEqual(liq0.v.add(new BN(config.scenario[i].amount)).toString());
                    expect(liq1_check.v.toString()).toEqual(liq1.v.sub(amount_out0.v).toString());
                    expect(token0Balance_check.v.toString()).toEqual(token0Balance.v.sub(amount_out0.v).toString());
                    expect(token1Balance_check.v.toString()).toEqual(token1Balance.v.add(new BN(config.scenario[i].amount)).toString());
                }else if (config.scenario[i].reverse == 1) {
                    const amount_out1 = shareCalc.profit_AMM(new BN(config.scenario[i].amount),liq0.v,liq1.v);
                    const k1_new = shareCalc.calcK_new(liq0.v.add(liq1.v), liq0.v.add(liq1.v).add(new BN(config.scenario[i].amount).sub(amount_out1.v)), sharePriceK.v);
                    expect(k1_new.v.toString()).toEqual(sharePriceK_check.v.toString());
                    expect(liq0_check.v.toString()).toEqual(liq0.v.sub(amount_out1.v).toString());
                    expect(liq1_check.v.toString()).toEqual(liq1.v.add(new BN(config.scenario[i].amount)).toString());
                    expect(token0Balance_check.v.toString()).toEqual(token0Balance.v.add(new BN(config.scenario[i].amount)).toString());
                    expect(token1Balance_check.v.toString()).toEqual(token1Balance.v.sub(amount_out1.v).toString());
                }
            }
        }
    });
}
);
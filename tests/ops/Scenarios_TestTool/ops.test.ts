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

                const leafValues_check = await storage.getLeaves(account.getAccountPublicKeyAddress());

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

                const nonce_check = await storage.getLeave(account.getAccountNonceAddress());
                const resetPool_check = await storage.getLeaves(poolInfo_Index);
                const ShareTotal_check = await storage.getLeave(pool.getShareTotalAddress());
        
                expect(nonce_check).toEqual(new Field(config.scenario[i].nonce + 1));
                expect(resetPool_check).toEqual([new Field(config.scenario[i].tokenIndex0), new Field(config.scenario[i].tokenIndex1), new Field(0), new Field(0)]);
                expect(ShareTotal_check).toEqual(new Field(0));
            }else if(config.scenario[i].op_name == 'deposit'){
                const caller = new Account(storage, config.scenario[i].callerAccountIndex);
                const account = new Account(storage, config.scenario[i].accountIndex);
                const balance = await storage.getLeave(account.getBalanceInfoAddress(config.scenario[i].tokenIndex));
                
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

                const nonce_check = await storage.getLeave(caller.getAccountNonceAddress());
                const balance_check = await storage.getLeave(account.getBalanceInfoAddress(config.scenario[i].tokenIndex));

                expect(nonce_check).toEqual(new Field(config.scenario[i].nonce + 1));
                expect(balance_check.v.toString()).toEqual(balance.v.add(new BN(config.scenario[i].amount)).toString());
            }else if(config.scenario[i].op_name == 'supply'){
                const pool = new Pool(storage, config.scenario[i].poolIndex);
                const account = new Account(storage, config.scenario[i].accountIndex);
                const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | config.scenario[i].poolIndex << 20;
                const [tokenIndex0,tokenIndex1,liq0_old,liq1_old] = await storage.getLeaves(poolInfo_Index);
                const share_old = await storage.getLeave(account.getShareInfoAddress(config.scenario[i].poolIndex));
                const token0Balance_old = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[0]));
                const token1Balance_old = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[1]));
                const ShareTotal_old = await storage.getLeave(pool.getShareTotalAddress());

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

                const nonce_check = await storage.getLeave(account.getAccountNonceAddress());
                const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
                const share_check = await storage.getLeave(account.getShareInfoAddress(config.scenario[i].poolIndex));
                let share_new;
                if (ShareTotal_old.v.eqn(0)){
                    const amp = new BN(10 ** 15);
                    share_new = new BN(config.scenario[i].amount0).mul(amp);
                }else{
                    share_new = new BN(config.scenario[i].amount0).mul(ShareTotal_old.v).div(liq0_old.v);
                }
                const token0Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[0]));
                const token1Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[1]));
                const ShareTotal_check = await storage.getLeave(pool.getShareTotalAddress());

                expect(nonce_check).toEqual(new Field(config.scenario[i].nonce + 1));
                expect(tokenIndex0_check.v.toString()).toEqual(tokenIndex0.v.toString());
                expect(tokenIndex1_check.v.toString()).toEqual(tokenIndex1.v.toString());
                expect(liq0_check.v.toString()).toEqual(liq0_old.v.add(new BN(config.scenario[i].amount0)).toString());
                expect(liq1_check.v.toString()).toEqual(liq1_old.v.add(new BN(config.scenario[i].amount1)).toString());
                expect(share_check.v.toString()).toEqual(share_old.v.add(share_new).toString());
                expect(token0Balance_check.v.toString()).toEqual(token0Balance_old.v.sub(new BN(config.scenario[i].amount0)).toString());
                expect(token1Balance_check.v.toString()).toEqual(token1Balance_old.v.sub(new BN(config.scenario[i].amount1)).toString());
                expect(ShareTotal_check.v.toString()).toEqual(`${ShareTotal_old.v.add(share_new)}`);
            }else if(config.scenario[i].op_name == 'retrieve'){
                const pool = new Pool(storage, config.scenario[i].poolIndex);
                const account = new Account(storage, config.scenario[i].accountIndex);
                const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | config.scenario[i].poolIndex << 20;
                const [tokenIndex0,tokenIndex1,liq0_old,liq1_old] = await storage.getLeaves(poolInfo_Index);
                const share_old = await storage.getLeave(account.getShareInfoAddress(config.scenario[i].poolIndex));
                const token0Balance_old = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[0]));
                const token1Balance_old = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[1]));
                const ShareTotal_old = await storage.getLeave(pool.getShareTotalAddress());

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

                const nonce_check = await storage.getLeave(account.getAccountNonceAddress());
                const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
                const share_check = await storage.getLeave(account.getShareInfoAddress(config.scenario[i].poolIndex));
                const rem = new BN(config.scenario[i].amount0).mul(ShareTotal_old.v).mod(liq0_old.v);
                const share_new = new BN(config.scenario[i].amount0).mul(ShareTotal_old.v).div(liq0_old.v);
                const token0Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[0]));
                const token1Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[1]));
                const ShareTotal_check = await storage.getLeave(pool.getShareTotalAddress());

                expect(nonce_check).toEqual(new Field(config.scenario[i].nonce + 1));
                expect(tokenIndex0_check.v.toString()).toEqual(tokenIndex0.v.toString());
                expect(tokenIndex1_check.v.toString()).toEqual(tokenIndex1.v.toString());
                expect(liq0_check.v.toString()).toEqual(liq0_old.v.sub(new BN(config.scenario[i].amount0)).toString());
                expect(liq1_check.v.toString()).toEqual(liq1_old.v.sub(new BN(config.scenario[i].amount1)).toString());
                expect(share_check.v.toString()).toEqual(share_old.v.sub(share_new).toString());
                expect(token0Balance_check.v.toString()).toEqual(token0Balance_old.v.add(new BN(config.scenario[i].amount0)).toString());
                expect(token1Balance_check.v.toString()).toEqual(token1Balance_old.v.add(new BN(config.scenario[i].amount1)).toString());
                if (rem.eqn(0)){
                    expect(ShareTotal_check.v.toString()).toEqual(`${ShareTotal_old.v.sub(share_new)}`);
                }else{
                    expect(ShareTotal_check.v.toString()).toEqual(`${ShareTotal_old.v.sub(share_new).sub(new BN(1))}`);
                }
            }else if(config.scenario[i].op_name == 'swap'){
                const pool = new Pool(storage, config.scenario[i].poolIndex);
                const account = new Account(storage, config.scenario[i].accountIndex);
                const poolInfo_Index = getSpaceIndex(AddressSpace.Pool) | config.scenario[i].poolIndex << 20;
                const [tokenIndex0,tokenIndex1,liq0_old,liq1_old] = await storage.getLeaves(poolInfo_Index);
                const token0Balance_old = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[0]));
                const token1Balance_old = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[1]));

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

                const nonce_check = await storage.getLeave(account.getAccountNonceAddress());
                const [tokenIndex0_check,tokenIndex1_check,liq0_check,liq1_check] = await storage.getLeaves(poolInfo_Index);
                const token0Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[0]));
                const token1Balance_check = await storage.getLeave(account.getBalanceInfoAddress((await pool.getTokenIndexAndLiq())[1]));

                const shareCalc = new ShareCalcHelper;
                expect(nonce_check).toEqual(new Field(config.scenario[i].nonce + 1));
                expect(tokenIndex0_check.v.toString()).toEqual(tokenIndex0.v.toString());
                expect(tokenIndex1_check.v.toString()).toEqual(tokenIndex1.v.toString());
                if (config.scenario[i].reverse == 0){
                    const amount_out0 = shareCalc.calcAmountOut_AMM(new BN(config.scenario[i].amount),liq1_old.v,liq0_old.v);
                    expect(liq0_check.v.toString()).toEqual(liq0_old.v.add(new BN(config.scenario[i].amount)).toString());
                    expect(liq1_check.v.toString()).toEqual(liq1_old.v.sub(amount_out0.v).toString());
                    expect(token0Balance_check.v.toString()).toEqual(token0Balance_old.v.sub(new BN(config.scenario[i].amount)).toString());
                    expect(token1Balance_check.v.toString()).toEqual(token1Balance_old.v.add(amount_out0.v).toString());
                }else if (config.scenario[i].reverse == 1) {
                    const amount_out1 = shareCalc.profit_AMM(new BN(config.scenario[i].amount),liq0_old.v,liq1_old.v);
                    expect(liq0_check.v.toString()).toEqual(liq0_old.v.sub(amount_out1.v).toString());
                    expect(liq1_check.v.toString()).toEqual(liq1_old.v.add(new BN(config.scenario[i].amount)).toString());
                    expect(token0Balance_check.v.toString()).toEqual(token0Balance_old.v.add(amount_out1.v).toString());
                    expect(token1Balance_check.v.toString()).toEqual(token1Balance_old.v.sub(new BN(config.scenario[i].amount)).toString());
                }
            }
        }
    });
}
);
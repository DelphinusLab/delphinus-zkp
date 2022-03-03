import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../src/circom/address-space";
import { runZkp } from "../src/circom/main";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";
import { BN } from "bn.js";
import { SignatureHelper } from "./generateSignPubKey";
import { CryptoUtil } from "./generateSignPubKey";

const storage = new L2Storage(true);

//config:
const config = require("./config.json");

//generate keys:
let cryptoUtil: CryptoUtil;
let cryptoUtilPromise = import(
  __dirname + "/../../../crypto-rust/node/pkg/delphinus_crypto"
  ).then((module) => {
  cryptoUtil = module;
  return module;
});

async function getCryptoUtil() {
  if (cryptoUtil) {
    return cryptoUtil;
  }
  return await cryptoUtilPromise;
}

//Random keys:
let rx = new Field(0);
let ry = new Field(0);
let s = new Field(0);

//ops:
let deposit_nft = new Field(7);
let bid_nft = new Field(10);
let finalize_nft = new Field(11);
let transfer_nft = new Field(9);
let withdraw_nft = new Field(8);

//generate Input.json for all process
async function main() {
    await storage.startSnapshot("1");
    //pubKey:
    const util = await getCryptoUtil();
    const signatureHelper = new SignatureHelper("Bob", "/delphinus/nft", util);
    let [ax, ay] = signatureHelper.GenerateAXAYFromPublicKey(signatureHelper.publicKey);

    //set accounts
    interface nonce {
        [key: string]: any
    }
    var nonce_signer: nonce = {};

    for (let i = 0; i < config.Accounts.length; i++) {
        let nonce_count = 0;
        await runZkp(
            [[new Field(CommandOp.SetKey), [rx, ry, s, new Field(nonce_count), new Field(config.Accounts[i].accountIndex), new Field(0), ax, ay, new Field(0), new Field(0)]]],
            storage,
            `Setkey_for_accout_${config.Accounts[i].accountIndex}`
        );
        nonce_count++;
        
        //GerateSign for addpool:
        let [rx_a,ry_a,s_a] = signatureHelper.GetSignForAddPool(new BN(nonce_count),new BN(config.Accounts[i].tokenIndex0),new BN(config.Accounts[i].tokenIndex1));
        //GerateInput for addpool:
        await runZkp(
            [[new Field(CommandOp.AddPool), [rx_a, ry_a, s_a, new Field(nonce_count), new Field(config.Accounts[i].tokenIndex0), new Field(config.Accounts[i].tokenIndex1), new Field(0), new Field(0), new Field(config.Accounts[i].poolIndex), new Field(config.Accounts[i].accountIndex)]]],
            storage,
            `Addpool_for_account_${config.Accounts[i].accountIndex}`
        );
        nonce_count++;
        
        let [rx_d,ry_d,s_d] = signatureHelper.GenerateSignForDeposit(new BN(nonce_count),new BN(config.Accounts[i].accountIndex),new BN(config.Accounts[i].tokenIndex1), new BN(config.Accounts[i].tokenIndex1amount),new BN(0));
        await runZkp(
            [[new Field(CommandOp.Deposit), [rx_d, ry_d, s_d, new Field(nonce_count), new Field(config.Accounts[i].accountIndex), new Field(config.Accounts[i].tokenIndex1), new Field(config.Accounts[i].tokenIndex1amount), new Field(0), new Field(config.Accounts[i].accountIndex), new Field(0)]]],
            storage,
            `Deposit_for_account_${config.Accounts[i].accountIndex}`
        );
        nonce_count++;

        for (let j = 0; j < config.NFT.length; j++) {
            if (config.Accounts[i].accountIndex == config.NFT[j].owner) {
                await runZkp(
                    [[deposit_nft, [rx, ry, s, new Field(nonce_count), new Field(config.NFT[j].owner), new Field(0), new Field(0), new Field(config.NFT[j].nftIndex), new Field(config.Accounts[i].accountIndex), new Field(0)]]],
                    storage,
                    `Depositnft_owner${config.NFT[j].owner}`,
                )
                nonce_count++;
            }
        }
        nonce_signer[`${config.Accounts[i].accountIndex}`] = `${nonce_count}`;
    }

    //operations
    for (let i = 0; i < config.ops_select.length; i++) {
        let op = config.ops_select[i];
        for (let j = 0; j < config.Ops[op].length; j++) {
            let nonce_ops = nonce_signer[config.Ops[op][j].signer];
            if (config.Ops[op][j].op_name == "bid_nft") {
                await runZkp(
                    [[bid_nft, [rx, ry, s, new Field(nonce_ops), new Field(0), new Field(config.Ops[op][j].bidder), new Field(config.Ops[op][j].biddingAmount), new Field(config.Ops[op][j].nftIndex), new Field(config.Ops[op][j].signer), new Field(0)]]],
                    storage,
                    `Bid_NFTIndex${config.Ops[op][j].nftIndex}_Bidder${config.Ops[op][j].bidder}`,
                )
            }
            else if (config.Ops[op][j].op_name == "transfer_nft") {
                await runZkp(
                    [[transfer_nft, [rx, ry, s, new Field(nonce_ops), new Field(config.Ops[op][j].owner), new Field(0), new Field(0), new Field(config.Ops[op][j].nftIndex), new Field(config.Ops[op][j].signer), new Field(0)]]],
                    storage,
                    `TransferNFT_from_owner${config.Ops[op][j].signer}_to_owner${config.Ops[op][j].owner}`,
                )
            }
            else if (config.Ops[op][j].op_name == "finalize_nft") {
                await runZkp(
                    [[finalize_nft, [rx, ry, s, new Field(nonce_ops), new Field(0), new Field(0), new Field(0), new Field(config.Ops[op][j].nftIndex), new Field(config.Ops[op][j].signer), new Field(0)]]],
                    storage,
                    `Finalize_NFTIndex${config.Ops[op][j].nftIndex}_by_${config.Ops[op][j].signer}`,
                )
            }
            else if (config.Ops[op][j].op_name == "withdraw_nft") {
                await runZkp(
                    [[withdraw_nft, [rx, ry, s, new Field(nonce_ops), new Field(0), new Field(0), new Field(0), new Field(config.Ops[op][j].nftIndex), new Field(config.Ops[op][j].signer), new Field(0)]]],
                    storage,
                    `Withdraw_NFTIndex${config.Ops[op][j].nftIndex}_by_${config.Ops[op][j].signer}`,
                )
            }
            nonce_ops++;
        }
    }
    await storage.endSnapshot();
}
main();
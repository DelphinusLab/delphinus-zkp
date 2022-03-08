import { L2Storage } from "../src/circom/address-space";
import { GenerateInput } from "./generateInput";
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

//generate test Input
async function main() {
    await storage.startSnapshot("1");

    //nonce
    interface nonce {
        [key: string]: any
    }
    var nonce_signer: nonce = {};

    //crypto
    const util = await getCryptoUtil();

    //ops:
    for(let i = 0; i<config.Ops.length;i++){
        let input = [];
        for(var key in config.Ops[i]){
            input.push(config.Ops[i][key]);
        }
        if(config.Ops[i].op_name == "setkey"){
            nonce_signer[`${input[1]}`] = 0;
            console.log(`${nonce_signer[`${input[1]}`]}`)
        }
        await GenerateInput(input, nonce_signer[`${input[1]}`], storage, util);
        nonce_signer[`${input[1]}`]++;
    }

    await storage.endSnapshot();
}
main();
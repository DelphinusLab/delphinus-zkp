import { L2Storage } from "../../../src/circom/address-space";
import { GenerateInput } from "./generateInput";
import { CryptoUtil } from "./generateSignPubKey";
import fs from "fs-extra";
import { preTest, CreateResultFile } from "../../../src/circom/generate-jsonInput";

const storage = new L2Storage(true);
const config = fs.readJsonSync(process.argv[2]);

//generate keys:
let cryptoUtil: CryptoUtil;
let cryptoUtilPromise = import(
  __dirname + "/../../../../../crypto-rust/node/pkg/delphinus_crypto"
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
    const nonce_signer: nonce = {};

    //crypto
    const util = await getCryptoUtil();

    //pre-test
    console.log('Compiling Circom');
    await CreateResultFile();
    await preTest();
  
    //ops:
    for(let i = 0; i<config.Ops.length;i++){
      
      if(config.Ops[i].op_name == "setkey"){
          nonce_signer[`${config.Ops[i].calleraccountIndex}`] = 0;
      }
      await GenerateInput(config.Ops[i].op_name, config.Ops[i], nonce_signer[`${config.Ops[i].calleraccountIndex}`], storage, util);
      nonce_signer[`${config.Ops[i].calleraccountIndex}`]++;
    }

    await storage.endSnapshot();
}
main();
import path from "path";
import { L2Storage } from "../../../src/circom/address-space";
import { unitTestOps } from "./unitTestOps";
import { CryptoUtil } from "./generateSignPubKey";
import fs from "fs-extra";
import { preTest, CreateResultFile } from "./unitTestSingleOp";

const storage = new L2Storage(true);
const config = fs.readJsonSync(process.argv[2]);

let date = new Date();
let time = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
let unitTestRoot = path.join(__dirname, "..", "..", "..", "..", "circom", "unit_tests", `Unit_Test_at_${time}`);
const circomRoot = path.join(__dirname, "..", "..", "..", "..","circom", "unit_tests")

//generate keys:
let cryptoUtil: CryptoUtil;
let cryptoUtilPromise = import(
  __dirname + "/../../../../node_modules/delphinus-crypto/node/pkg/delphinus_crypto"
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

  console.log('Compiling Circom');
  // create an test_result.txt file to record test results and errors.
  await CreateResultFile(unitTestRoot, time);
  //compile circom, generate zkey & verification_key
  await preTest(circomRoot, unitTestRoot, time);

  //ops:
  for (let i = 0; i < config.Ops.length; i++) {
    if (config.Ops[i].op_name == "setkey") {
      nonce_signer[`${config.Ops[i].calleraccountIndex}`] = 0;
    }
    await unitTestOps(config.Ops[i].op_name, config.Ops[i], nonce_signer[`${config.Ops[i].calleraccountIndex}`], unitTestRoot, time, storage, util);
    nonce_signer[`${config.Ops[i].calleraccountIndex}`]++;
  }

  await storage.endSnapshot();
}
main();
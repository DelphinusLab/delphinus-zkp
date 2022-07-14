import path from "path";
import { L2Storage } from "../../../src/circom/address-space";
import { unitTestOps } from "./unitTestOps";
import { CryptoUtil } from "./generateSignPubKey";
import fs from "fs-extra";
import { preTest, CreateResultFile } from "./unitTestSingleOp";

const storage = new L2Storage(true);
const config = fs.readJsonSync(process.argv[2]);
const filename = process.argv[3];
export const option = process.argv[4];

const date = new Date();
const time = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
const unitTestRoot = path.join(__dirname, "..", "..", "..", "..", "circom", "unit_tests", `${filename}_test_at_${time}`);
const circomRoot = path.join(__dirname, "..", "..", "..", "..","circom")

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

  //msg and derive key
  interface keys {
    [key: string]: any
  }
  const msg_dkeys: keys = {};

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
      if(config.Ops[i].msg !== undefined && config.Ops[i].derive_key !== undefined){
        msg_dkeys[`${config.Ops[i].callerAccountIndex}`] = {"msg":config.Ops[i].msg, "derive_key":config.Ops[i].derive_key};
      }
    }
    await unitTestOps(config.Ops[i].op_name, config.Ops[i], msg_dkeys[`${config.Ops[i].callerAccountIndex}`], unitTestRoot, time, storage, util);
  }

  await storage.endSnapshot();
}
main();
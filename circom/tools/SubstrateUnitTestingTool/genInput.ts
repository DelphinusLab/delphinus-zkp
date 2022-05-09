import { L2Storage } from "../../../src/circom/address-space";
import fs from "fs-extra";
import { unitTestOps } from "./substrateUnitTestOps";
import { CryptoUtil } from "./generateSubstrateSignPubKey";

const storage = new L2Storage(true);
const paths = fs.readJsonSync(__dirname + "/../../../../circom/tools/SubstrateUnitTestingTool/input/paths.json");

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

async function genInput() {
  await storage.startSnapshot("1");

  //msg and derive key
  interface keys {
    [key: string]: any
  }

  let msg_dkeys: keys = {};

  //crypto
  const util = await getCryptoUtil();

  let filePath, config, fileList;

  //ops:
  for (let path in paths) {
    fileList = paths[path];

    for (let j = 0; j < fileList.length; j++) {
      filePath = path + fileList[j];
      config = fs.readJsonSync(__dirname + "/../../../../circom/tools/SubstrateUnitTestingTool/input/" + filePath + ".json");

      if(config.msg !== undefined && config.derive_key !== undefined){
        msg_dkeys[`${config.callerAccountIndex}`] = {"msg":config.msg, "derive_key":config.derive_key};
      }

      await unitTestOps(config.op_name, config, msg_dkeys[`${config.callerAccountIndex}`], storage, util, filePath);
    }
  }

  await storage.endSnapshot();
}

genInput();

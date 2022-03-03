import BN from "bn.js";
import path from "path";
import fs from "fs-extra";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";
import { Field } from "delphinus-curves/src/field";

export interface CryptoUtil {
  derive_private_key: (seed: Uint8Array, suffix: Uint8Array) => Uint8Array;
  get_public_key: (privKey: Uint8Array) => Uint8Array;
  generate_ax_from_pub_key: (pubKey: Uint8Array) => Uint8Array;
  generate_ay_from_pub_key: (pubKey: Uint8Array) => Uint8Array;
  generate_rx_from_sign: (sign: Uint8Array) => Uint8Array;
  generate_ry_from_sign: (sign: Uint8Array) => Uint8Array;
  generate_s_from_sign: (sign: Uint8Array) => Uint8Array;
  sign: (msg: Uint8Array, publicKey: Uint8Array) => Uint8Array;
}

export class SignatureHelper {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  cryptoUtil: CryptoUtil;

  constructor(
    msg: string,
    derive_key: string,
    cryptoUtil: CryptoUtil
  ) {
    this.cryptoUtil = cryptoUtil;
    this.privateKey = this.cryptoUtil.derive_private_key(
      new TextEncoder().encode(msg),
      new TextEncoder().encode(derive_key)
    );
    this.publicKey = this.cryptoUtil.get_public_key(this.privateKey);
  }  
  getPubKey() {
    return this.publicKey;
  }

  getAX() {
    const ax = this.cryptoUtil.generate_ax_from_pub_key(
      this.publicKey
    );
    
    return ax;
  }

  getAY() {
    const ay = this.cryptoUtil.generate_ay_from_pub_key(
      this.publicKey
    );
    
    return ay;
  }

  getRX(sign: Uint8Array) {
    const rx = this.cryptoUtil.generate_rx_from_sign(
      sign
    );
    
    return rx;
  }

  getRY(sign: Uint8Array) {
    const ry = this.cryptoUtil.generate_ry_from_sign(
      sign
    );
    
    return ry;
  }

  getS(sign: Uint8Array) {
    const s = this.cryptoUtil.generate_s_from_sign(
      sign
    );
    
    return s;
  }

  getPrivKey() {
    return this.privateKey;
  }

  GetSignForAddPool(
    nonce: BN,
    tokenIndex0: BN,
    tokenIndex1: BN,
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    // buf[0] = CommandOp.AddPool;
    buf.set(new BN(5).toArray("be",1),0);
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(tokenIndex0.toArray("be", 4), 9);
    buf.set(tokenIndex1.toArray("be", 4), 13);

    let [rxField, ryField, sField] = this.DoSignFromBuf(buf);

    return [rxField, ryField, sField]
    // this.PrintSignJSON("AddPool_sign.json", rxField, ryField, sField);
  }

  GenerateSignForDepositNFT(
    owner: BN,
    bidder: BN,
    biddingAmount: BN,
    nftIndex: BN,
    nonce: BN
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = 7; //deposit_nft
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(owner.toArray("be", 4), 9);
    buf.set(bidder.toArray("be", 4), 13);
    buf.set(biddingAmount.toArray("be", 32), 17);
    buf.set(nftIndex.toArray("be", 32), 49);

    let [rxField, ryField, sField] = this.DoSignFromBuf(buf);

    this.PrintSignJSON("DepositNFT_sign.json", rxField, ryField, sField);
  }

  DoSignFromBuf(buf: Uint8Array)
  {
    const sign = this.cryptoUtil.sign(buf, this.privateKey);
    console.log("sign: " + sign);

    const rx = this.getRX(sign);
    let rxBN = new BN(rx,10,"le");
    let rxField = new Field(rxBN);
    console.log("rx: " + rx);
    console.log("rxField: " + rxField.toString());
    const ry = this.getRY(sign);
    let ryBN = new BN(ry,10,"le");
    let ryField = new Field(ryBN);
    console.log("ry: " + ry);
    console.log("rxField: " + rxField.toString());
    const s = this.getS(sign);
    let sBN = new BN(s,10,"le");
    let sField = new Field(sBN);
    console.log("s: " + s);
    console.log("sField: " + sField.toString());

    return [rxField, ryField, sField];
  }

  PrintSignJSON(name:string, rx:Field, ry:Field, s:Field)
  {
    let json = {
      "Sign" : [rx.toString(), ry.toString(), s.toString()]
    };

    const circomRoot = path.join(__dirname);
    fs.writeJSON(path.join(circomRoot, name), json);
  }

  PrintPubKeyJSON(name:string, ax:Field, ay:Field)
  {
    let json = {
      "publicKey" : [ax.toString(), ay.toString()]
    };

    const circomRoot = path.join(__dirname);
    fs.writeJSON(path.join(circomRoot, name), json);
  }

  GenerateJSONFromPublicKey()
  {
    this.GenerateAXAYFromPublicKey(this.publicKey);
  }

  GenerateAXAYFromPublicKey(pubKey: Uint8Array)
  {
    console.log("privatekey:" + this.privateKey);
    console.log("public key: " + this.publicKey);
    const ax = this.getAX();
    let axBN = new BN(ax,10,"le");
    let axField = new Field(axBN);
    console.log("ax: " + ax);
    console.log("axField: " + axField.toString());
    const ay = this.getAY();
    let ayBN = new BN(ay,10,"le");
    let ayField = new Field(ayBN);
    console.log("ay: " + ay);
    console.log("ayField: " + ayField.toString());
    
    return [axField, ayField];
  }

}

// async function main() {
//   let cryptoUtil: CryptoUtil;
//   let cryptoUtilPromise = import(
//     __dirname + "/../../../crypto-rust/node/pkg/delphinus_crypto"
//     ).then((module) => {
//     cryptoUtil = module;
//     return module;
//   });

//   async function getCryptoUtil() {
//     if (cryptoUtil) {
//       return cryptoUtil;
//     }
//     return await cryptoUtilPromise;
//   }

//   const util = await getCryptoUtil();

//   const signatureHelper = new SignatureHelper("Bob", "/delphinus/nft", util);

//   //generate publicKey.json
//   signatureHelper.GenerateJSONFromPublicKey();

//   //generate sign json for Addpool
//   console.log("GetSignForAddPool");
//   let nonce = new BN(1);
//   const tokenIndex0 = new BN(0);
//   const tokenIndex1 = new BN(1);
//   signatureHelper.GetSignForAddPool(nonce, tokenIndex0, tokenIndex1);

//   //generate sign json for DepositNFT
//   /*console.log("GenerateSignForDepositNFT");
//   nonce = new BN(3);
//   const owner = new BN(1);
//   const bidder = new BN(0);
//   const biddingAmount = new BN(0);
//   const nftIndex = new BN(1);
  
//   signatureHelper.GenerateSignForDepositNFT(owner, bidder, biddingAmount, nftIndex, nonce);*/
// }

// main();
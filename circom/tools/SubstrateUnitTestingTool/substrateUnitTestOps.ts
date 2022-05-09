import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../../src/circom/address-space";
import { BN } from "bn.js";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";
import { NftCommandOp } from "../../../src/circom/command-factory";
import { SignatureHelper, CryptoUtil } from "./generateSubstrateSignPubKey";
import { genZKPInput } from "../../../src/circom/generate-zkinput";

async function runZkp(commands: [Field, Field[]][], storage: L2Storage) {
  await genZKPInput(commands, storage);
}

async function unitTestSetkey(
  args: any,
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  let ax, ay;

  if(args.ax == undefined && args.ay == undefined){
    let signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    [ax, ay] = await signatureHelper.GenerateAXAYFromPublicKey(signatureHelper.publicKey, filePath);
  }else{
    [ax, ay] = [new Field(new BN(args.ax)), new Field(new BN(args.ay))]
  }

  await runZkp(
    [
      [
        new Field(CommandOp.SetKey),
        [
          new Field(0),
          new Field(0),
          new Field(0),
          new Field(args.nonce),
          new Field(args.accountIndex),
          new Field(0),
          ax,
          ay,
          new Field(0),
          new Field(0)
        ]
      ]
    ],
    storage
  )
}

async function unitTestAddpool(
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }
    [rx, ry, s] = await signatureHelper.GetSignForAddPool(
      new BN(args.nonce),
      new BN(args.tokenIndex0),
      new BN(args.tokenIndex1),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(CommandOp.AddPool), 
        [
          rx, 
          ry,
          s, 
          new Field(args.nonce), 
          new Field(args.tokenIndex0), 
          new Field(args.tokenIndex1), 
          new Field(0), 
          new Field(0), 
          new Field(args.poolIndex),
          new Field(args.callerAccountIndex)
        ]
    ]
    ],
    storage
  )
}

async function unitTestDeposit(
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }

    [rx, ry, s] = await signatureHelper.GenerateSignForDeposit(
      new BN(args.nonce),
      new BN(args.accountIndex),
      new BN(args.tokenIndex),
      new BN(args.amount),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(CommandOp.Deposit),
        [
          rx,
          ry,
          s,
          new Field(args.nonce),
          new Field(args.accountIndex),
          new Field(args.tokenIndex),
          new Field(args.amount),
          new Field(0),
          new Field(args.callerAccountIndex),
          new Field(0)
        ]
      ]
    ],
    storage
  )
}

async function unitTestWithdraw(
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }

    [rx, ry, s] = await signatureHelper.GenerateSignForWithdraw(
      new BN(args.nonce),
      new BN(args.accountIndex),
      new BN(args.tokenIndex),
      new BN(args.amount),
      new BN(args.l1address),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(CommandOp.Withdraw),
          [
            rx,
            ry,
            s,
            new Field(args.nonce),
            new Field(args.accountIndex),
            new Field(args.tokenIndex),
            new Field(args.amount),
            new Field(args.l1address),
            new Field(0),
            new Field(0)
         ]
      ]
    ],
    storage
  )
}

async function unitTestSwap(
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }

    [rx, ry, s] = await signatureHelper.GenerateSignForSwap(
      new BN(args.nonce),
      new BN(args.accountIndex),
      new BN(args.poolIndex),
      new BN(args.reverse),
      new BN(args.amount),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(CommandOp.Swap),
        [
          rx,
          ry,
          s,
          new Field(args.nonce),
          new Field(args.accountIndex),
          new Field(args.poolIndex),
          new Field(args.reverse),
          new Field(args.amount),
          new Field(0),
          new Field(0)
        ]
      ]
    ],
    storage
  )
}

async function unitTestSupply(
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }

    [rx, ry, s] = await signatureHelper.GenerateSignForSupply(
      new BN(args.nonce),
      new BN(args.accountIndex),
      new BN(args.poolIndex),
      new BN(args.amount0),
      new BN(args.amount1),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(CommandOp.Supply),
        [
          rx,
          ry,
          s,
          new Field(args.nonce),
          new Field(args.accountIndex),
          new Field(args.poolIndex),
          new Field(args.amount0),
          new Field(args.amount1),
          new Field(0),
          new Field(0)
        ]
      ]
    ],
    storage
  )
}

async function unitTestRetrieve(
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }

    [rx, ry, s] = await signatureHelper.GenerateSignForRetrieve(
      new BN(args.nonce),
      new BN(args.accountIndex),
      new BN(args.poolIndex),
      new BN(args.amount0),
      new BN(args.amount1),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(CommandOp.Retrieve),
        [
          rx,
          ry,
          s,
          new Field(args.nonce),
          new Field(args.accountIndex),
          new Field(args.poolIndex),
          new Field(args.amount0),
          new Field(args.amount1),
          new Field(0),
          new Field(0)
        ]
      ]
    ],
    storage
  )
}

async function unitTestDepositNFT(
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }
    [rx, ry, s] = await signatureHelper.GenerateSignForDepositNFT(
      new BN(args.nonce),
      new BN(args.owner),
      new BN(args.nftIndex),
      new BN(args.l1_tx_hash),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(NftCommandOp.DepositNFT),
        [
          rx,
          ry,
          s,
          new Field(args.nonce),
          new Field(args.owner),
          new Field(args.nftIndex),
          new Field(args.l1_tx_hash),
          new Field(0),     //reserved
          new Field(args.callerAccountIndex),
          new Field(0)
        ]
      ]
    ],
    storage
  )
}

async function unitTestBidNFT(
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }

    [rx, ry, s] = await signatureHelper.GenerateSignForBidNFT(
      new BN(args.nonce),
      new BN(args.callerAccountIndex),
      new BN(args.nftIndex),
      new BN(args.biddingAmount),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(NftCommandOp.BidNFT),
        [
          rx,
          ry,
          s,
          new Field(args.nonce),
          new Field(args.bidder),
          new Field(args.nftIndex),
          new Field(args.biddingAmount),
          new Field(0),   //reserved
          new Field(0),
          new Field(0)
      ]
      ]
    ],
    storage
  )
}

async function unitTestTransferNFT(
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) { 
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }

    [rx, ry, s] = await signatureHelper.GenerateSignForTransferNFT(
      new BN(args.nonce),
      new BN(args.callerAccountIndex),
      new BN(args.nftIndex),
      new BN(args.owner),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(NftCommandOp.TransferNFT), 
        [
          rx, 
          ry, 
          s, 
          new Field(args.nonce),
          new Field(args.callerAccountIndex), 
          new Field(args.nftIndex), 
          new Field(args.owner), 
          new Field(0), //reserved
          new Field(0),
          new Field(0)
        ]
      ]
    ],
    storage
  )
}

async function unitTestFinalizeNFT(
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) { 
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }

    [rx, ry, s] = await signatureHelper.GenerateSignForFinalizeNFT(
      new BN(args.nonce),
      new BN(args.callerAccountIndex),
      new BN(args.nftIndex),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(NftCommandOp.FinalizeNFT), 
        [
          rx, 
          ry, 
          s, 
          new Field(args.nonce), 
          new Field(args.callerAccountIndex), 
          new Field(args.nftIndex), 
          new Field(0), //reserved
          new Field(0), //reserved
          new Field(0), 
          new Field(0)
        ]
      ]
    ],
    storage
  )
}

async function unitTestWithdrawNFT(
  args: any,
  msg_dkey: {
      msg: string,
      derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  let signatureHelper, rx, ry, s;
  if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
    if (args.msg == undefined || args.derive_key == undefined) {
      signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
    }else{
      signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
    }

    [rx, ry, s] = await signatureHelper.GenerateSignForWithdrawNFT(
      new BN(args.nonce),
      new BN(args.callerAccountIndex),
      new BN(args.nftIndex),
      new BN(args.l1account),
      filePath
    )
  }else{
    [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
  }

  await runZkp(
    [
      [
        new Field(NftCommandOp.WithdrawNFT), 
        [
          rx, 
          ry, 
          s, 
          new Field(args.nonce), 
          new Field(args.callerAccountIndex), 
          new Field(args.nftIndex),
          new Field(args.l1account),
          new Field(0),  //reserved
          new Field(0), 
          new Field(0)
        ]
      ]
    ],
    storage
  )
}

export function unitTestOps(
  op: string,
  args: any,
  msg_dkey: {
    msg: string,
    derive_key: string
  },
  storage: L2Storage,
  util: CryptoUtil,
  filePath: string
) {
  if (op == "setkey") {
    unitTestSetkey(args, storage, util, filePath)
  }
  else if (op == "addpool"){
    unitTestAddpool(args, msg_dkey, storage, util, filePath)
  }
  else if (op == "swap"){
    unitTestSwap(args, msg_dkey, storage, util, filePath)
  }
  else if (op == "supply"){
    unitTestSupply(args, msg_dkey, storage, util, filePath)
  }
  else if (op == "retrieve"){
    unitTestRetrieve(args, msg_dkey, storage, util, filePath)
  }
  else if (op == "deposit") {
    unitTestDeposit(args, msg_dkey, storage, util, filePath)
  }
  else if (op == "withdraw") {
    unitTestWithdraw(args, msg_dkey, storage, util, filePath)
  }
  else if (op == "deposit_nft") {
    unitTestDepositNFT(args, msg_dkey, storage, util, filePath)
  }
  else if (op == "bid_nft") {
    unitTestBidNFT(args, msg_dkey, storage, util, filePath)
  }
  else if (op == "transfer_nft") {
    unitTestTransferNFT(args, msg_dkey, storage, util, filePath)
  }
  else if (op == "finalize_nft") {
    unitTestFinalizeNFT(args, msg_dkey, storage, util, filePath)
  }
  else if (op == "withdraw_nft") {
    unitTestWithdrawNFT(args, msg_dkey, storage, util, filePath)
  }
}

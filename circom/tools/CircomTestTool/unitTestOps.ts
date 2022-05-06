import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../../src/circom/address-space";
import { BN } from "bn.js";
import { unitTestSingleOp } from "./unitTestSingleOp";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";
import { NftCommandOp } from "../../../src/circom/command-factory";
import { SignatureHelper } from "./generateSignPubKey";
import { CryptoUtil } from "./generateSignPubKey";

async function unitTestSetkey(
    args: any,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    let ax, ay;

    if(args.ax == undefined && args.ay == undefined){
        let signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        [ax, ay] = signatureHelper.GenerateAXAYFromPublicKey(signatureHelper.publicKey);
    }else{
        [ax, ay] = [new Field(new BN(args.ax)), new Field(new BN(args.ay))]
    }

    await unitTestSingleOp(
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
        storage,
        `Setkey_caller${args.callerAccountIndex}`,
        unitTestRoot,
        time
    )
}

async function unitTestAddpool(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }
        [rx, ry, s] = signatureHelper.GetSignForAddPool(
            new BN(args.nonce),
            new BN(args.tokenIndex0),
            new BN(args.tokenIndex1)
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `Addpool_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestDeposit(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }

        [rx, ry, s] = signatureHelper.GenerateSignForDeposit(
            new BN(args.nonce),
            new BN(args.accountIndex),
            new BN(args.tokenIndex),
            new BN(args.amount),
            new BN(args.l1_tx_hash)
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `Deposit_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestWithdraw(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }

        [rx, ry, s] = signatureHelper.GenerateSignForWithdraw(
            new BN(args.nonce),
            new BN(args.accountIndex),
            new BN(args.tokenIndex),
            new BN(args.amount),
            new BN(args.l1address)
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `Withdraw_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestSwap(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }

        [rx, ry, s] = signatureHelper.GenerateSignForSwap(
            new BN(args.nonce),
            new BN(args.accountIndex),
            new BN(args.poolIndex),
            new BN(args.reverse),
            new BN(args.amount)
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `Swap_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestSupply(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }

        [rx, ry, s] = signatureHelper.GenerateSignForSupply(
            new BN(args.nonce),
            new BN(args.accountIndex),
            new BN(args.poolIndex),
            new BN(args.amount0),
            new BN(args.amount1)
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `Supply_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestRetrieve(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }

        [rx, ry, s] = signatureHelper.GenerateSignForRetrieve(
            new BN(args.nonce),
            new BN(args.accountIndex),
            new BN(args.poolIndex),
            new BN(args.amount0),
            new BN(args.amount1)
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `Retrieve_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestDepositNFT(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }
        [rx, ry, s] = signatureHelper.GenerateSignForDepositNFT(
            new BN(args.nonce),
            new BN(args.owner),
            new BN(args.nftIndex),
            new BN(args.l1_tx_hash),
            new BN(0)   //reserved
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `DepoNFT_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestBidNFT(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }

        [rx, ry, s] = signatureHelper.GenerateSignForBidNFT(
            new BN(args.nonce),
            new BN(args.callerAccountIndex),
            new BN(args.nftIndex),
            new BN(args.biddingAmount),
            new BN(0)  //reserved
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `BidNFT_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestTransferNFT(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) { 
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }

        [rx, ry, s] = signatureHelper.GenerateSignForTransferNFT(
            new BN(args.nonce),
            new BN(args.callerAccountIndex),
            new BN(args.nftIndex),
            new BN(args.owner),
            new BN(0)   //reserved
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `TransNFT_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestFinalizeNFT(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) { 
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }

        [rx, ry, s] = signatureHelper.GenerateSignForFinalizeNFT(
            new BN(args.nonce),
            new BN(args.callerAccountIndex),
            new BN(args.nftIndex),
            new BN(0)
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `FinaliNFT_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestWithdrawNFT(
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    let signatureHelper, rx, ry, s;
    if (args.sign_rx == undefined && args.sign_ry == undefined && args.sign_s == undefined){
        if (args.msg == undefined || args.derive_key == undefined) {
            signatureHelper = new SignatureHelper(msg_dkey.msg, msg_dkey.derive_key, util);
        }else{
            signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);
        }

        [rx, ry, s] = signatureHelper.GenerateSignForWithdrawNFT(
            new BN(args.nonce),
            new BN(args.callerAccountIndex),
            new BN(args.nftIndex),
            new BN(args.l1account),
            new BN(0)    //reserved
        )
    }else{
        [rx, ry, s] = [new Field(new BN(args.sign_rx)), new Field(new BN(args.sign_ry)), new Field(new BN(args.sign_s))]
    }

    await unitTestSingleOp(
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
        storage,
        `WithdNFT_caller${args.callerAccountIndex}_nonce${args.nonce}`,
        unitTestRoot,
        time
    )
}

export async function unitTestOps(
    op: string,
    args: any,
    msg_dkey: {
        msg: string,
        derive_key: string
    },
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    if (op == "setkey") {
        await unitTestSetkey(args, unitTestRoot, time, storage, util)
    }
    else if (op == "addpool"){
        await unitTestAddpool(args, msg_dkey, unitTestRoot, time, storage, util)
    }
    else if (op == "swap"){
        await unitTestSwap(args, msg_dkey, unitTestRoot, time, storage, util)
    }
    else if (op == "supply"){
        await unitTestSupply(args, msg_dkey, unitTestRoot, time, storage, util)
    }
    else if (op == "retrieve"){
        await unitTestRetrieve(args, msg_dkey, unitTestRoot, time, storage, util)
    }
    else if (op == "deposit") {
        await unitTestDeposit(args, msg_dkey, unitTestRoot, time, storage, util)
    }
    else if (op == "withdraw") {
        await unitTestWithdraw(args, msg_dkey, unitTestRoot, time, storage, util)
    }
    else if (op == "deposit_nft") {
        await unitTestDepositNFT(args, msg_dkey, unitTestRoot, time, storage, util)
    }
    else if (op == "bid_nft") {
        await unitTestBidNFT(args, msg_dkey, unitTestRoot, time, storage, util)
    }
    else if (op == "transfer_nft") {
        await unitTestTransferNFT(args, msg_dkey, unitTestRoot, time, storage, util)
    }
    else if (op == "finalize_nft") {
        await unitTestFinalizeNFT(args, msg_dkey, unitTestRoot, time, storage, util)
    }
    else if (op == "withdraw_nft") {
        await unitTestWithdrawNFT(args, msg_dkey, unitTestRoot, time, storage, util)
    }
}
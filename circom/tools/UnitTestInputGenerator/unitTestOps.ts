import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../../src/circom/address-space";
import { BN } from "bn.js";
import { unitTestSingleOp } from "./unitTestSingleOp";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";
import { NftCommandOp } from "../../../src/circom/command-factory";
import { SignatureHelper } from "./generateSignPubKey";
import { CryptoUtil } from "./generateSignPubKey";

//ops:
// let deposit_nft = new Field(7);
// let bid_nft = new Field(10);
// let finalize_nft = new Field(11);
// let transfer_nft = new Field(9);
// let withdraw_nft = new Field(8);

async function unitTestSetkey(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [ax, ay] = signatureHelper.GenerateAXAYFromPublicKey(signatureHelper.publicKey);

    await unitTestSingleOp(
        [
            [
                new Field(CommandOp.SetKey),
                [
                    new Field(0),
                    new Field(0),
                    new Field(0),
                    new Field(nonce),
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
        `Setkey_caller${args.calleraccountIndex}`,
        unitTestRoot,
        time
    )
}

async function unitTestAddpool(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        tokenIndex0: number,
        tokenIndex1: number,
        poolIndex: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GetSignForAddPool(
        new BN(nonce),
        new BN(args.tokenIndex0),
        new BN(args.tokenIndex1)
    )

    await unitTestSingleOp(
        [
            [
                new Field(CommandOp.AddPool), 
                [
                    rx, 
                    ry, 
                    s, 
                    new Field(nonce), 
                    new Field(args.tokenIndex0), 
                    new Field(args.tokenIndex1), 
                    new Field(0), 
                    new Field(0), 
                    new Field(args.poolIndex), 
                    new Field(args.calleraccountIndex)
                ]
            ]
        ],
        storage,
        `Addpool_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestDeposit(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        tokenIndex: number,
        amount: number,
        l1_tx_hash: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GenerateSignForDeposit(
        new BN(nonce),
        new BN(args.accountIndex),
        new BN(args.tokenIndex),
        new BN(args.amount),
        new BN(args.l1_tx_hash)
    )

    await unitTestSingleOp(
        [
            [
                new Field(CommandOp.Deposit),
                [
                    rx,
                    ry,
                    s,
                    new Field(nonce),
                    new Field(args.accountIndex),
                    new Field(args.tokenIndex),
                    new Field(args.amount),
                    new Field(0),
                    new Field(args.calleraccountIndex),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Deposit_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestWithdraw(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        tokenIndex: number,
        amount: number,
        l1address: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GenerateSignForWithdraw(
        new BN(nonce),
        new BN(args.accountIndex),
        new BN(args.tokenIndex),
        new BN(args.amount),
        new BN(args.l1address)
    )

    await unitTestSingleOp(
        [
            [
                new Field(CommandOp.Withdraw),
                [
                    rx,
                    ry,
                    s,
                    new Field(nonce),
                    new Field(args.accountIndex),
                    new Field(args.tokenIndex),
                    new Field(args.amount),
                    new Field(1),
                    new Field(0),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Withdraw_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestSwap(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        poolIndex: number,
        reverse: number,
        amount: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GenerateSignForSwap(
        new BN(nonce),
        new BN(args.accountIndex),
        new BN(args.poolIndex),
        new BN(args.reverse),
        new BN(args.amount)
    )

    await unitTestSingleOp(
        [
            [
                new Field(CommandOp.Swap),
                [
                    rx,
                    ry,
                    s,
                    new Field(nonce),
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
        `Swap_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestSupply(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        poolIndex: number,
        amount0: number,
        amount1: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GenerateSignForSupply(
        new BN(nonce),
        new BN(args.accountIndex),
        new BN(args.poolIndex),
        new BN(args.amount0),
        new BN(args.amount1)
    )

    await unitTestSingleOp(
        [
            [
                new Field(CommandOp.Supply),
                [
                    rx,
                    ry,
                    s,
                    new Field(nonce),
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
        `Supply_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestRetrieve(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        poolIndex: number,
        amount0: number,
        amount1: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GenerateSignForRetrieve(
        new BN(nonce),
        new BN(args.accountIndex),
        new BN(args.poolIndex),
        new BN(args.amount0),
        new BN(args.amount1)
    )

    await unitTestSingleOp(
        [
            [
                new Field(CommandOp.Retrieve),
                [
                    rx,
                    ry,
                    s,
                    new Field(nonce),
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
        `Retrieve_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestDepositNFT(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        owner: number,
        nftIndex: number,
        l1_tx_hash: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GenerateSignForDepositNFT(
        new BN(nonce),
        new BN(args.owner),
        new BN(args.nftIndex),
        new BN(args.l1_tx_hash),
        new BN(0)   //reserved
    )
    await unitTestSingleOp(
        [
            [
                new Field(NftCommandOp.DepositNFT),
                [
                    rx,
                    ry,
                    s,
                    new Field(nonce),
                    new Field(args.owner),
                    new Field(args.nftIndex),
                    new Field(args.l1_tx_hash),
                    new Field(0),     //reserved
                    new Field(args.calleraccountIndex),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `DepoNFT_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestBidNFT(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        owner: number,
        bidder: number,
        biddingAmount: number,
        nftIndex: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GenerateSignForBidNFT(
        new BN(nonce),
        new BN(args.calleraccountIndex),
        new BN(args.nftIndex),
        new BN(args.biddingAmount),
        new BN(0)  //reserved
    )
    await unitTestSingleOp(
        [
            [
                new Field(NftCommandOp.BidNFT),
                [
                    rx,
                    ry,
                    s,
                    new Field(nonce),
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
        `BidNFT_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestTransferNFT(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        owner: number,
        nftIndex: number,
        msg: string,
        derive_key: string 
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) { 
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GenerateSignForTransferNFT(
        new BN(nonce),
        new BN(args.calleraccountIndex),
        new BN(args.nftIndex),
        new BN(args.owner),
        new BN(0)   //reserved
    )
    await unitTestSingleOp(
        [
            [
                new Field(NftCommandOp.TransferNFT), 
                [
                    rx, 
                    ry, 
                    s, 
                    new Field(nonce),
                    new Field(args.calleraccountIndex), 
                    new Field(args.nftIndex), 
                    new Field(args.owner), 
                    new Field(0), //reserved
                    new Field(0),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `TransNFT_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestFinalizeNFT(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        bidder: number,
        biddingAmount: number,
        nftIndex: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) { 
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GenerateSignForFinalizeNFT(
        new BN(nonce),
        new BN(args.calleraccountIndex),
        new BN(args.nftIndex),
        new BN(0)
    )
    await unitTestSingleOp(
        [
            [
                new Field(NftCommandOp.FinalizeNFT), 
                [
                    rx, 
                    ry, 
                    s, 
                    new Field(nonce), 
                    new Field(args.calleraccountIndex), 
                    new Field(args.nftIndex), 
                    new Field(0), //reserved
                    new Field(0), //reserved
                    new Field(0), 
                    new Field(0)
                ]
            ]
        ],
        storage,
        `FinaliNFT_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

async function unitTestWithdrawNFT(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        nftIndex: number,
        l1account: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GenerateSignForWithdrawNFT(
        new BN(nonce),
        new BN(args.calleraccountIndex),
        new BN(args.nftIndex),
        new BN(args.l1account),
        new BN(0)    //reserved
    )
    await unitTestSingleOp(
        [
            [
                new Field(NftCommandOp.WithdrawNFT), 
                [
                    rx, 
                    ry, 
                    s, 
                    new Field(nonce), 
                    new Field(args.calleraccountIndex), 
                    new Field(args.nftIndex),
                    new Field(args.l1account),
                    new Field(0),  //reserved
                    new Field(0), 
                    new Field(0)
                ]
            
            ]
        ],
        storage,
        `WithdNFT_caller${args.calleraccountIndex}_nonce${nonce}`,
        unitTestRoot,
        time
    )
}

export async function unitTestOps(
    op: string,
    args: any,
    nonce: number,
    unitTestRoot: string,
    time: string,
    storage: L2Storage,
    util: CryptoUtil
) {
    if (op == "setkey") {
        await unitTestSetkey(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "addpool"){
        await unitTestAddpool(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "swap"){
        await unitTestSwap(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "supply"){
        await unitTestSupply(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "retrieve"){
        await unitTestRetrieve(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "deposit") {
        await unitTestDeposit(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "withdraw") {
        await unitTestWithdraw(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "deposit_nft") {
        await unitTestDepositNFT(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "bid_nft") {
        await unitTestBidNFT(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "transfer_nft") {
        await unitTestTransferNFT(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "finalize_nft") {
        await unitTestFinalizeNFT(args, nonce, unitTestRoot, time, storage, util)
    }
    else if (op == "withdraw_nft") {
        await unitTestWithdrawNFT(args, nonce, unitTestRoot, time, storage, util)
    }
}
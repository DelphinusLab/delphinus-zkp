import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../../src/circom/address-space";
import { BN } from "bn.js";
import { runZkp } from "../../../src/circom/generate-jsonInput";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";
import { SignatureHelper } from "./generateSignPubKey";
import { CryptoUtil } from "./generateSignPubKey";

//ops:
let deposit_nft = new Field(7);
let bid_nft = new Field(10);
let finalize_nft = new Field(11);
let transfer_nft = new Field(9);
let withdraw_nft = new Field(8);

async function GenerateSetkeyInput(
    args: 
    {
        op_name: string,
        calleraccountIndex: number,
        accountIndex: number,
        msg: string,
        derive_key: string
    },
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [ax, ay] = signatureHelper.GenerateAXAYFromPublicKey(signatureHelper.publicKey);

    await runZkp(
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
        `Setkey_caller${args.calleraccountIndex}`
    )
}

async function GenerateAddpoolInput(
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
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args.msg, args.derive_key, util);

    let [rx, ry, s] = signatureHelper.GetSignForAddPool(
        new BN(nonce),
        new BN(args.tokenIndex0),
        new BN(args.tokenIndex1)
    )

    await runZkp(
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
        `Addpool_caller${args.calleraccountIndex}_nonce${nonce}`
    )
}

async function GenerateDepositInput(
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

    await runZkp(
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
        `Deposit_caller${args.calleraccountIndex}_nonce${nonce}`
    )
}

async function GenerateWithdrawInput(
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

    await runZkp(
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
        `Withdraw_caller${args.calleraccountIndex}_nonce${nonce}`
    )
}

async function GenerateSwapInput(
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

    await runZkp(
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
        `Swap_caller${args.calleraccountIndex}_nonce${nonce}`
    )
}

async function GenerateSupplyInput(
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

    await runZkp(
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
        `Supply_caller${args.calleraccountIndex}_nonce${nonce}`
    )
}

async function GenerateRetrieveInput(
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

    await runZkp(
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
        `Retrieve_caller${args.calleraccountIndex}_nonce${nonce}`
    )
}

async function GenerateDepositNFTInput(
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
    await runZkp(
        [
            [
                deposit_nft,
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
    )
}

async function GenerateBidNFTInput(
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
    await runZkp(
        [
            [
                bid_nft,
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
    )
}

async function GenerateTransferNFTInput(
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
    await runZkp(
        [
            [
                transfer_nft, 
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
    )
}

async function GenerateFinalizeNFTInput(
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
    await runZkp(
        [
            [
                finalize_nft, 
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
    )
}

async function GenerateWithdrawNFTInput(
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
    await runZkp(
        [
            [
                withdraw_nft, 
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
    )
}

export async function GenerateInput(
    op: string,
    args: any,
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    if (op == "setkey") {
        await GenerateSetkeyInput(args, nonce, storage, util)
    }
    else if (op == "addpool"){
        await GenerateAddpoolInput(args, nonce, storage, util)
    }
    else if (op == "swap"){
        await GenerateSwapInput(args, nonce, storage, util)
    }
    else if (op == "supply"){
        await GenerateSupplyInput(args, nonce, storage, util)
    }
    else if (op == "retrieve"){
        await GenerateRetrieveInput(args, nonce, storage, util)
    }
    else if (op == "deposit") {
        await GenerateDepositInput(args, nonce, storage, util)
    }
    else if (op == "withdraw") {
        await GenerateWithdrawInput(args, nonce, storage, util)
    }
    else if (op == "deposit_nft") {
        await GenerateDepositNFTInput(args, nonce, storage, util)
    }
    else if (op == "bid_nft") {
        await GenerateBidNFTInput(args, nonce, storage, util)
    }
    else if (op == "transfer_nft") {
        await GenerateTransferNFTInput(args, nonce, storage, util)
    }
    else if (op == "finalize_nft") {
        await GenerateFinalizeNFTInput(args, nonce, storage, util)
    }
    else if (op == "withdraw_nft") {
        await GenerateWithdrawNFTInput(args, nonce, storage, util)
    }
}
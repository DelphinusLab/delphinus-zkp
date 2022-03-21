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

// args[0]: op_name, args[1]:accountIndex, args[2]:msg, args[3]:derive_key
async function GenerateSetkeyInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args[2], args[3], util);

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
                    new Field(args[1]),
                    new Field(0),
                    ax,
                    ay,
                    new Field(0),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Setkey_caller${args[1]}`
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:tokenIndex0,
// args[3]: tokenIndex1, args[4]: poolIndex, args[5]:msg, args[6]:derive_key
async function GenerateAddpoolInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args[5], args[6], util);

    let [rx, ry, s] = signatureHelper.GetSignForAddPool(
        new BN(nonce),
        new BN(args[2]),
        new BN(args[3])
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
                    new Field(args[2]), 
                    new Field(args[3]), 
                    new Field(0), 
                    new Field(0), 
                    new Field(args[4]), 
                    new Field(args[1])
                ]
            ]
        ],
        storage,
        `Addpool_caller${args[1]}_nonce${nonce}`
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:tokenIndex,
// args[3]: amount, args[4]:msg, args[5]:derive_key
async function GenerateDepositInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args[4], args[5], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForDeposit(
        new BN(nonce),
        new BN(args[1]),
        new BN(args[2]),
        new BN(args[3]),
        new BN(0)
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
                    new Field(args[1]),
                    new Field(args[2]),
                    new Field(args[3]),
                    new Field(0),
                    new Field(args[1]),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Deposit_caller${args[1]}_nonce${nonce}`
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:tokenIndex,
// args[3]: amount, args[4]:msg, args[5]:derive_key
async function GenerateWithdrawInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args[4], args[5], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForWithdraw(
        new BN(nonce),
        new BN(args[1]),
        new BN(args[2]),
        new BN(args[3]),
        new BN(1)
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
                    new Field(args[1]),
                    new Field(args[2]),
                    new Field(args[3]),
                    new Field(1),
                    new Field(0),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Withdraw_caller${args[1]}_nonce${nonce}`
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:poolIndex,
// args[3]: reverse 1/0, args[4]: amount, args[5]:msg, args[6]:derive_key
async function GenerateSwapInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args[5], args[6], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForSwap(
        new BN(nonce),
        new BN(args[1]),
        new BN(args[2]),
        new BN(args[3]),
        new BN(args[4])
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
                    new Field(args[1]),
                    new Field(args[2]),
                    new Field(args[3]),
                    new Field(args[4]),
                    new Field(0),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Swap_caller${args[1]}_nonce${nonce}`
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:poolIndex,
// args[3]: amount0, args[4]: amount1, args[5]:msg, args[6]:derive_key
async function GenerateSupplyInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args[5], args[6], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForSupply(
        new BN(nonce),
        new BN(args[1]),
        new BN(args[2]),
        new BN(args[3]),
        new BN(args[4])
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
                    new Field(args[1]),
                    new Field(args[2]),
                    new Field(args[3]),
                    new Field(args[4]),
                    new Field(0),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Supply_caller${args[1]}_nonce${nonce}`
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:poolIndex,
// args[3]: amount0, args[4]: amount1, args[5]:msg, args[6]:derive_key
async function GenerateRetrieveInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args[5], args[6], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForRetrieve(
        new BN(nonce),
        new BN(args[1]),
        new BN(args[2]),
        new BN(args[3]),
        new BN(args[4])
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
                    new Field(args[1]),
                    new Field(args[2]),
                    new Field(args[3]),
                    new Field(args[4]),
                    new Field(0),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Retrieve_caller${args[1]}_nonce${nonce}`
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:owner,
// args[3]: nftIndex, args[4]:msg, args[5]:derive_key
async function GenerateDepositNFTInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args[4], args[5], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForDepositNFT(
        new BN(nonce),
        new BN(args[2]),
        new BN(0),
        new BN(0),
        new BN(args[3])
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
                    new Field(args[2]),
                    new Field(0), 
                    new Field(0),
                    new Field(args[3]),
                    new Field(args[1]),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `DepoNFT_caller${args[1]}_nonce${nonce}`,
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:bidder,
// args[3]: biddingAmount, args[4]: nftIndex, args[5]:msg, args[6]:derive_key
async function GenerateBidNFTInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args[5], args[6], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForBidNFT(
        new BN(nonce),
        new BN(0),
        new BN(args[2]),
        new BN(args[3]),
        new BN(args[4])
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
                    new Field(0),
                    new Field(args[2]),
                    new Field(args[3]),
                    new Field(args[4]),
                    new Field(args[1]),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `BidNFT_caller${args[1]}_nonce${nonce}`,
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:owner,
// args[3]: nftIndex, args[4]:msg, args[5]:derive_key
async function GenerateTransferNFTInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) { 
    const signatureHelper = new SignatureHelper(args[4], args[5], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForTransferNFT(
        new BN(nonce),
        new BN(args[2]),
        new BN(0),
        new BN(0),
        new BN(args[3])
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
                    new Field(args[2]), 
                    new Field(0), 
                    new Field(0), 
                    new Field(args[3]), 
                    new Field(args[1]), 
                    new Field(0)]]],
        storage,
        `TransNFT_caller${args[1]}_nonce${nonce}`,
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:nftIndex,
// args[3]:msg, args[4]:derive_key
async function GenerateFinalizeNFTInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) { 
    const signatureHelper = new SignatureHelper(args[3], args[4], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForFinalizeNFT(
        new BN(nonce),
        new BN(0),
        new BN(0),
        new BN(0),
        new BN(args[2])
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
                    new Field(0), 
                    new Field(0), 
                    new Field(0), 
                    new Field(args[2]), 
                    new Field(args[1]), 
                    new Field(0)
                ]
            ]
        ],
        storage,
        `FinaliNFT_caller${args[1]}_nonce${nonce}`,
    )
}

// args[0]: op_name, args[1]:accountIndex, args[2]:nftIndex,
// args[3]:msg, args[4]:derive_key
async function GenerateWithdrawNFTInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(args[3], args[4], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForWithdrawNFT(
        new BN(nonce),
        new BN(0),
        new BN(0),
        new BN(0),
        new BN(args[2])
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
                    new Field(0), 
                    new Field(0), 
                    new Field(0), 
                    new Field(args[2]), 
                    new Field(args[1]), 
                    new Field(0)
                ]
            
            ]
        ],
        storage,
        `WithdNFT_caller${args[1]}_nonce${nonce}`,
    )
}

export async function GenerateInput(
    args: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    if (args[0] == "setkey") {
        await GenerateSetkeyInput(args, nonce, storage, util)
    }
    else if (args[0] == "addpool"){
        await GenerateAddpoolInput(args, nonce, storage, util)
    }
    else if (args[0] == "swap"){
        await GenerateSwapInput(args, nonce, storage, util)
    }
    else if (args[0] == "supply"){
        await GenerateSupplyInput(args, nonce, storage, util)
    }
    else if (args[0] == "retrieve"){
        await GenerateRetrieveInput(args, nonce, storage, util)
    }
    else if (args[0] == "deposit") {
        await GenerateDepositInput(args, nonce, storage, util)
    }
    else if (args[0] == "withdraw") {
        await GenerateWithdrawInput(args, nonce, storage, util)
    }
    else if (args[0] == "deposit_nft") {
        await GenerateDepositNFTInput(args, nonce, storage, util)
    }
    else if (args[0] == "bid_nft") {
        await GenerateBidNFTInput(args, nonce, storage, util)
    }
    else if (args[0] == "transfer_nft") {
        await GenerateTransferNFTInput(args, nonce, storage, util)
    }
    else if (args[0] == "finalize_nft") {
        await GenerateFinalizeNFTInput(args, nonce, storage, util)
    }
    else if (args[0] == "withdraw_nft") {
        await GenerateWithdrawNFTInput(args, nonce, storage, util)
    }
}
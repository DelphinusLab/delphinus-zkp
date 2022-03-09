import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../../src/circom/address-space";
import { BN } from "bn.js";
import { runZkp } from "../../../src/circom/main";
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
    op: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(op[2], op[3], util);

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
                    new Field(op[1]),
                    new Field(0),
                    ax,
                    ay,
                    new Field(0),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Setkey_for_accout_${op[1]}`
    )
}

async function GenerateAddpoolInput(
    op: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(op[5], op[6], util);

    let [rx, ry, s] = signatureHelper.GetSignForAddPool(
        new BN(nonce),
        new BN(op[2]),
        new BN(op[3])
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
                    new Field(op[2]), 
                    new Field(op[3]), 
                    new Field(0), 
                    new Field(0), 
                    new Field(op[4]), 
                    new Field(op[1])
                ]
            ]
        ],
        storage,
        `Addpool_by_signer_${op[1]}`
    )
}

async function GenerateDepositInput(
    op: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(op[4], op[5], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForDeposit(
        new BN(nonce),
        new BN(op[1]),
        new BN(op[2]),
        new BN(op[3]),
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
                    new Field(op[1]),
                    new Field(op[2]),
                    new Field(op[3]),
                    new Field(0),
                    new Field(op[1]),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Deposit_for_account_${op[1]}`
    )
}

async function GenerateDepositNFTInput(
    op: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(op[4], op[5], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForDepositNFT(
        new BN(nonce),
        new BN(op[2]),
        new BN(0),
        new BN(0),
        new BN(op[3])
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
                    new Field(op[2]),
                    new Field(0), 
                    new Field(0),
                    new Field(op[3]),
                    new Field(op[1]),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Depositnft_owner${op[2]}`,
    )
}

async function GenerateBidNFTInput(
    op: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(op[5], op[6], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForBidNFT(
        new BN(nonce),
        new BN(0),
        new BN(op[2]),
        new BN(op[3]),
        new BN(op[4])
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
                    new Field(op[2]),
                    new Field(op[3]),
                    new Field(op[4]),
                    new Field(op[1]),
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Bid_NFTIndex${op[4]}_Bidder${op[2]}`,
    )
}

async function GenerateTransferNFTInput(
    op: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) { 
    const signatureHelper = new SignatureHelper(op[4], op[5], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForTransferNFT(
        new BN(nonce),
        new BN(op[2]),
        new BN(0),
        new BN(0),
        new BN(op[3])
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
                    new Field(op[2]), 
                    new Field(0), 
                    new Field(0), 
                    new Field(op[3]), 
                    new Field(op[1]), 
                    new Field(0)]]],
        storage,
        `TransferNFT_from_owner${op[1]}_to_owner${op[2]}`,
    )
}

async function GenerateFinalizeNFTInput(
    op: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) { 
    const signatureHelper = new SignatureHelper(op[3], op[4], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForFinalizeNFT(
        new BN(nonce),
        new BN(0),
        new BN(0),
        new BN(0),
        new BN(op[2])
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
                    new Field(op[2]), 
                    new Field(op[1]), 
                    new Field(0)
                ]
            ]
        ],
        storage,
        `Finalize_NFTIndex${op[2]}_by_${op[1]}`,
    )
}

async function GenerateWithdrawNFTInput(
    op: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    const signatureHelper = new SignatureHelper(op[3], op[4], util);

    let [rx, ry, s] = signatureHelper.GenerateSignForWithdrawNFT(
        new BN(nonce),
        new BN(0),
        new BN(0),
        new BN(0),
        new BN(op[2])
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
                    new Field(op[2]), 
                    new Field(op[1]), 
                    new Field(0)
                ]
            
            ]
        ],
        storage,
        `Withdraw_NFTIndex${op[2]}_by_${op[1]}`,
    )
}

export async function GenerateInput(
    op: any[],
    nonce: number,
    storage: L2Storage,
    util: CryptoUtil
) {
    if (op[0] == "setkey") {
        await GenerateSetkeyInput(op, nonce, storage, util)
    }
    if (op[0] == "addpool"){
        await GenerateAddpoolInput(op, nonce, storage, util)
    }
    else if (op[0] == "deposit") {
        await GenerateDepositInput(op, nonce, storage, util)
    }
    else if (op[0] == "deposit_nft") {
        await GenerateDepositNFTInput(op, nonce, storage, util)
    }
    else if (op[0] == "bid_nft") {
        await GenerateBidNFTInput(op, nonce, storage, util)
    }
    else if (op[0] == "transfer_nft") {
        await GenerateTransferNFTInput(op, nonce, storage, util)
    }
    else if (op[0] == "finalize_nft") {
        await GenerateFinalizeNFTInput(op, nonce, storage, util)
    }
    else if (op[0] == "withdraw_nft") {
        await GenerateWithdrawNFTInput(op, nonce, storage, util)
    }
}
pragma circom 2.0.2;

include "../utils/swap_aux.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

template DepositNFT() {
    var MaxStep = 5;
    var IndexOffset = 0;
    var LeaveStartOffset = 61;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal input signer;
    signal input signed;
    signal output newDataPath[MaxStep][MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(8);
    var andmanyOffset = 0;

    var nonce = args[1];
    var owner = args[2];
    var bidder = args[3];
    var biddingAmount = args[4];

    // check if bidder, biddingAmount and args[5] are 0s
    component bidderIs0 = IsZero();
    component biddingAmountIs0 = IsZero();
    component args5Is0 = IsZero();
    bidderIs0.in <== bidder;
    biddingAmountIs0.in <== biddingAmount;
    args5Is0.in <== args[5];
    andmany.in[andmanyOffset] <== bidderIs0.out * biddingAmountIs0.out * args5Is0.out;
    andmanyOffset++;

    // check owner < 2 ^ 20
    component rangecheck = Check2PowerRangeFE(20);
    rangecheck.in <== owner;
    andmany.in[andmanyOffset] <== rangecheck.out;
    andmanyOffset++;

    // check owner != 0
    component ownerIs0 = IsZero();
    ownerIs0.in <== owner;
    andmany.in[andmanyOffset] <== 1 - ownerIs0.out;
    andmanyOffset++;

    // check if dataPath[61]-dataPath[64] is 0
    component leaf1Is0 = IsZero();
    component leaf2Is0 = IsZero();
    component leaf3Is0 = IsZero();
    component leaf4Is0 = IsZero();
    leaf1Is0.in <== dataPath[1][LeaveStartOffset];
    leaf2Is0.in <== dataPath[1][LeaveStartOffset+1];
    leaf3Is0.in <== dataPath[1][LeaveStartOffset+2];
    leaf4Is0.in <== dataPath[1][LeaveStartOffset+3];
    andmany.in[andmanyOffset] <== leaf1Is0.out * leaf2Is0.out * leaf3Is0.out * leaf4s0.out;
    andmanyOffset++;

    // STEP1: udpate nonce
    component checkNonce = CheckAndUpdateNonceFE();
    checkNonce.nonce <== nonce;
    checkNonce.caller <== signer;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        checkNonce.dataPath[i] <== dataPath[0][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[0][i] <== checkNonce.newDataPath[i];
    }
    andmany.in[andmanyOffset] <== checkNonce.out;
    andmanyOffset++;

    // circuits: check caller permission and signer
    component perm = CheckPermission(1);
    perm.caller <== checkNonce.caller;
    andmany.in[andmanyOffset] <== perm.out;
    andmanyOffset++;

    andmany.in[andmanyOffset] <== signed;
    andmanyOffset++;

    // STEP2: udpate nft info
    component nftIndex = CheckNFTInfoIndexFE();
    nftIndex.index <== dataPath[1][IndexOffset];
    andmany.in[andmanyOffset] <== nftIndex.out;
    andmanyOffset++;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if (i == LeaveStartOffset) {
            newDataPath[1][i] <== owner;
        } else {
            newDataPath[1][i] <== dataPath[1][i];
        }
    }

    for (var i = 2; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

//b11 NFT: (20bits) nft index + (4bits) MetaType(1) + (6bits) info data (owner, bidder, biddingAmount, reserved)
template CheckNFTInfoIndexFE() {
    signal input index;
    signal output out;
    signal output caller;

    // Find 20 bits as value `a` in BE, check (3 << 30) + (a << 10) + (1 << 6) + OFFSET == index
    component n2bNFT = Num2Bits(20);
    n2bNFT.in <-- (index >> 10) & ((1 << 20) - 1);

    component n2bOffset = Num2Bits(2);
    n2bOffset.in <-- index & 3;

    component eq = IsEqual();
    eq.in[0] <== n2bNFT.in * (1 << 10) + (3 << 30) + (1 << 6) + n2bOffset.in;
    eq.in[1] <== index;

    out <== eq.out;
    caller <== n2bNFT.in;
}
}
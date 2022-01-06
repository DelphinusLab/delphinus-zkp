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

    component andmany = AndMany(5);   //Check All

    var andmanyOffset = 0;

    var nonce = args[1];
    var owner = args[2];
    var bidder = args[3];
    var biddingAmount = args[4];

    // check if bidder, biddingAmount, args[5], dataPath[61]--dataPath[64] are 0s and owner != 0
    component bidderIs0 = IsZero();
    component biddingAmountIs0 = IsZero();
    component args5Is0 = IsZero();
    component leaf1Is0 = IsZero();
    component leaf2Is0 = IsZero();
    component leaf3Is0 = IsZero();
    component leaf4Is0 = IsZero();
    component ownerIs0 = IsZero();

    component check0s = AndMany(8);   //Check all 0s

    bidderIs0.in <== bidder;
    biddingAmountIs0.in <== biddingAmount;
    args5Is0.in <== args[5];
    leaf1Is0.in <== dataPath[1][LeaveStartOffset];
    leaf2Is0.in <== dataPath[1][LeaveStartOffset+1];
    leaf3Is0.in <== dataPath[1][LeaveStartOffset+2];
    leaf4Is0.in <== dataPath[1][LeaveStartOffset+3];
    ownerIs0.in <== owner;

    check0s.in[0] <== bidderIs0.out;
    check0s.in[1] <== biddingAmountIs0.out;
    check0s.in[2] <== args5Is0.out;
    check0s.in[3] <== leaf1Is0.out;
    check0s.in[4] <== leaf2Is0.out;
    check0s.in[5] <== leaf3Is0.out;
    check0s.in[6] <== leaf4Is0.out;
    check0s.in[7] <== 1 - ownerIs0.out;

    andmany.in[andmanyOffset] <== check0s.out;
    andmanyOffset++;

    // check owner < 2 ^ 20
    component rangecheck = Check2PowerRangeFE(20);
    rangecheck.in <== owner;
    andmany.in[andmanyOffset] <== rangecheck.out;
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
    andmany.in[andmanyOffset] <== perm.out * signed;
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
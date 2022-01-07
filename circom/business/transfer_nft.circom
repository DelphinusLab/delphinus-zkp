pragma circom 2.0.2;

include "../utils/swap_aux.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

template TransferNFT() {
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

    component andmany = AndMany(7); // Check All

    var andmanyOffset = 0;

    var nonce = args[1];
    var owner = args[2];
    var bidder = args[3];
    var biddingAmount = args[4];

    // Check if owner !=0, bidder, biddingAmount，args[5]，dataPath[62] -- dataPath[64] are 0s and dataPath[61] != 0
    component ownerIs0 = IsZero();
    component bidderIs0 = IsZero();
    component biddingAmountIs0 = IsZero();
    component args5Is0 = IsZero();
    component leaf1Is0 = IsZero();
    component leaf2Is0 = IsZero();
    component leaf3Is0 = IsZero();
    component leaf4Is0 = IsZero();

    component check0s = AndMany(8);   //Check all 0s

    ownerIs0.in <== owner;
    bidderIs0.in <== bidder;
    biddingAmountIs0.in <== biddingAmount;
    args5Is0.in <== args[5];
    leaf1Is0.in <== dataPath[1][LeaveStartOffset];
    leaf2Is0.in <== dataPath[1][LeaveStartOffset+1];
    leaf3Is0.in <== dataPath[1][LeaveStartOffset+2];
    leaf4Is0.in <== dataPath[1][LeaveStartOffset+3];

    check0s.in[0] <== 1 - ownerIs0.out;
    check0s.in[1] <== bidderIs0.out;
    check0s.in[2] <== biddingAmountIs0.out;
    check0s.in[3] <== args5Is0.out;
    check0s.in[4] <== 1 - leaf1Is0.out;
    check0s.in[5] <== leaf2Is0.out;
    check0s.in[6] <== leaf3Is0.out;
    check0s.in[7] <== leaf4Is0.out;

    andmany.in[andmanyOffset] <== check0s.out;
    andmanyOffset++;

    // check owner < 2 ^ 20 and dataPath[61] < 2 ^ 20
    component rangecheck = AndMany(2);
    component ownerRange = Check2PowerRangeFE(20);
    component leaf1Range = Check2PowerRangeFE(20);

    ownerRange.in <== owner;
    leaf1Range.in <== dataPath[1][LeaveStartOffset];

    rangecheck.in[0] <== ownerRange.out;
    rangecheck.in[1] <== leaf1Range.out;

    andmany.in[andmanyOffset] <== rangecheck.out;
    andmanyOffset++;

    // Check dataPath[61] != owner
    component leaf1IsOwner = IsEqual();
    leaf1IsOwner.in[0] <== dataPath[1][LeaveStartOffset];
    leaf1IsOwner.in[1] <== owner;
    andmany.in[andmanyOffset] <== 1 - leaf1IsOwner.out;
    andmanyOffset++;

    // Check if sender is current owner
    component senderIsOwner = IsEqual();
    senderIsOwner.in[0] <== signer;
    senderIsOwner.in[1] <== owner;
    andmany.in[andmanyOffset] <== senderIsOwner.out;
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
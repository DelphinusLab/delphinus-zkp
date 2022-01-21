pragma circom 2.0.2;

include "../utils/swap_aux.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

template DepositNFT() {
    var MaxStep = 5;
    var IndexOffset = 0;
    var LeaveStartOffset = 61;
    // In general, OwnerOffset = LeaveStartOffset + the last two bits of nftIndex (Only in this case, 00)
    // OwnerOffset = LeaveStartOffset + 00 which is equivalent to OwnerOffset = LeaveStartOffset
    var OwnerOffset = LeaveStartOffset;
    var BidderOffset = OwnerOffset + 1;
    var BiddingAmountOffset = OwnerOffset + 2;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal input signer;
    signal input signed;
    signal output newDataPath[MaxStep][MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(6);
    var andmanyOffset = 0;

    var nonce = args[1];
    var owner = args[2];
    var nftIndex = args[5];

    // circuits: check nftIndex < 2 ^ 20 & nftIndex != 0
    component nftIndexRangeCheck = Check2PowerRangeFE(20);
    nftIndexRangeCheck.in <== dataPath[1][IndexOffset];
    component nftIndexIsZero = IsZero();
    nftIndexIsZero.in <== dataPath[1][IndexOffset];
    andmany.in[andmanyOffset] <== nftIndexRangeCheck.out * (1 - nftIndexIsZero.out);
    andmanyOffset++;

    // circuits: check nftIndex == CheckNFTIndexFE's output nftIndex
    component nftIndexcheck = IsEqual();
    component nftIndexFromTreePath = CheckAndGetNFTIndexFromPath();
    nftIndexFromTreePath.index <== dataPath[1][IndexOffset];
    nftIndexcheck.in[0] <== nftIndexFromTreePath.nftIndex;
    nftIndexcheck.in[1] <== nftIndex;
    andmany.in[andmanyOffset] <== nftIndexFromTreePath.out * nftIndexcheck.out;
    andmanyOffset++;

    // circuits: check owner < 2 ^ 20 & owner != 0
    component ownerRangeCheck = Check2PowerRangeFE(20);
    ownerRangeCheck.in <== owner;
    component ownerIsZero = IsZero();
    ownerIsZero.in <== owner;
    andmany.in[andmanyOffset] <== ownerRangeCheck.out * (1 - ownerIsZero.out);
    andmanyOffset++;

    // circuits: check dataPath[1][66]'s leafValues[0]-leafValues[2] are 0s
    component nftleaf0IsZero = IsZero();
    nftleaf0IsZero.in <== dataPath[1][OwnerOffset];
    component nftleaf1IsZero = IsZero();
    nftleaf1IsZero.in <== dataPath[1][BidderOffset];
    component nftleaf2IsZero = IsZero();
    nftleaf2IsZero.in <== dataPath[1][BiddingAmountOffset];

    component nftleavescheck = AndMany(3);
    nftleavescheck.in[0] <== nftleaf0IsZero.out;
    nftleavescheck.in[1] <== nftleaf1IsZero.out;
    nftleavescheck.in[2] <== nftleaf2IsZero.out;
    andmany.in[andmanyOffset] <== nftleavescheck.out;
    andmanyOffset++;

    // STEP1: udpate nonce
    // circuits: check nonce
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

    // STEP2: update nft info with new owner
    component addOwner = SetValueFromTreePath();
    addOwner.value <== owner;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        addOwner.treeData[i] <== dataPath[1][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[1][i] <== addOwner.newTreeData[i];
    }

    for (var i = 2; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

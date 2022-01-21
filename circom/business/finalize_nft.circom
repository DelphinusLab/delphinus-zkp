pragma circom 2.0.2;
// dataPath[0]-nonce, dataPath[1]-last owner's balance, dataPath[2]-nft

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

template FinalizeNFT() {
    var TokenIndex = 1;
    var MaxStep = 5;
    var IndexOffset = 0;
    var LeaveStartOffset = 61;
    var OwnerOffset = LeaveStartOffset;
    var BidderOffset = LeaveStartOffset + 1;
    var BiddingAmountOffset = LeaveStartOffset + 2;
    var ReservedOffset = LeaveStartOffset + 3;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal input signer;
    signal input signed;
    signal output newDataPath[MaxStep][MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(16);
    var andmanyOffset = 0;

    var nonce = args[1];
    var owner = args[2];
    var bidder = args[3];
    var biddingAmount = args[4];

    // circuits: check dataPath[61] != 0
    component zero0 = IsZero();
    zero0.in <== dataPath[2][OwnerOffset];
    andmany.in[andmanyOffset] <== 1 - zero0.out;
    andmanyOffset++;

    // circuits: dataPath[61] < 2 ^ 20
    component rangecheck0 = Check2PowerRangeFE(20);
    rangecheck0.in <== dataPath[2][OwnerOffset];
    andmany.in[andmanyOffset] <== rangecheck0.out;
    andmanyOffset++;
    
    // circuits: check dataPath[62] != 0
    component zero1 = IsZero();
    zero1.in <== dataPath[2][BidderOffset];
    andmany.in[andmanyOffset] <== 1 - zero1.out;
    andmanyOffset++;

    // circuits: dataPath[62] < 2 ^ 20
    component rangecheck1 = Check2PowerRangeFE(20);
    rangecheck1.in <== dataPath[2][BidderOffset];
    andmany.in[andmanyOffset] <== rangecheck1.out;
    andmanyOffset++;
    
    // circuits: check dataPath[63] != 0
    component zero2 = IsZero();
    zero2.in <== dataPath[2][BiddingAmountOffset];
    andmany.in[andmanyOffset] <== 1 - zero2.out;
    andmanyOffset++;

    // circuits: dataPath[63] < 2 ^ 250
    component rangecheck2 = Check2PowerRangeFE(250);
    rangecheck2.in <== dataPath[2][BiddingAmountOffset];
    andmany.in[andmanyOffset] <== rangecheck2.out;
    andmanyOffset++;
    
    // circuits: check dataPath[64] == 0
    component zero3 = IsZero();
    zero3.in <== dataPath[2][ReservedOffset];
    andmany.in[andmanyOffset] <== zero3.out;
    andmanyOffset++;
    
    // circuits: check if args[5] is 0
    component zero4 = IsZero();
    zero4.in <== args[5];
    andmany.in[andmanyOffset] <== zero4.out;
    andmanyOffset++;

    // circuits: check owner is equal to leafValues[1]
    component ownerEq = IsEqual();
    ownerEq.in[0] <== dataPath[2][BidderOffset];
    ownerEq.in[1] <== owner;
    andmany.in[andmanyOffset] <== ownerEq.out;
    andmanyOffset++;

    // circuits: check bidder and biddingAmount is equal to 0
    component zero5 = IsZero();
    zero5.in <== bidder;
    component zero6 = IsZero();
    zero6.in <== biddingAmount;
    andmany.in[andmanyOffset] <== zero5.out * zero6.out;
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

    // STEP2: update balance of last owner
    component balanceIndex = CheckBalanceIndex();
    balanceIndex.account <== dataPath[2][OwnerOffset];
    balanceIndex.token <== TokenIndex;
    balanceIndex.index <== dataPath[1][IndexOffset];
    andmany.in[andmanyOffset] <== balanceIndex.out;
    andmanyOffset++;

    component change = ChangeValueFromTreePath();
    change.diff <== dataPath[2][BiddingAmountOffset];
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        change.treeData[i] <== dataPath[1][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[1][i] <== change.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== change.out;
    andmanyOffset++;
    
    // STEP3: udpate nft info
    component nftIndex = CheckAndGetNFTIndexFromPath();
    nftIndex.index <== dataPath[2][IndexOffset];
    andmany.in[andmanyOffset] <== nftIndex.out;
    andmanyOffset++;
    
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if (i == OwnerOffset) {
            newDataPath[2][i] <== owner;
        } else if(i == BidderOffset) {
            newDataPath[2][i] <== bidder;
        } else if(i == BiddingAmountOffset) {
            newDataPath[2][i] <== biddingAmount;
        } else {
            newDataPath[2][i] <== dataPath[2][i];
        }
    }

    for (var i = 3; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

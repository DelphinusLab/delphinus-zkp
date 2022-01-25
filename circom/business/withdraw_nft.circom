pragma circom 2.0.2;

include "../utils/swap_aux.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

template WithdrawNFT() {
    var TokenIndex = 1;
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

    component andmany = AndMany(11);
    var andmanyOffset = 0;

    var nonce = args[1];
    var nftIndex = args[5];

    // circuits: check dataPath[2][66]'s leafValues[0] != 0 & leafValues[0] < 2 ^ 20
    component nftleaf0RangeCheck = Check2PowerRangeFE(20);
    nftleaf0RangeCheck.in <== dataPath[2][OwnerOffset];
    component nftleaf0IsZero = IsZero();
    nftleaf0IsZero.in <== dataPath[2][OwnerOffset];

    andmany.in[andmanyOffset] <== nftleaf0RangeCheck.out * (1 - nftleaf0IsZero.out);
    andmanyOffset++;

    // circuits: check dataPath[2]'s leafValues[1] < 2 ^ 20
    component nftleaf1RangeCheck = Check2PowerRangeFE(20);
    nftleaf1RangeCheck.in <== dataPath[2][BidderOffset];

    andmany.in[andmanyOffset] <== nftleaf1RangeCheck.out;
    andmanyOffset++;

    // circuits: check dataPath[2]'s leafValues[2] < 2 ^ 250
    component nftleaf2RangeCheck = Check2PowerRangeFE(250);
    nftleaf2RangeCheck.in <== dataPath[2][BiddingAmountOffset];

    andmany.in[andmanyOffset] <== nftleaf2RangeCheck.out;
    andmanyOffset++;

    // circuits: check signer == dataPath[2]'s leafValues[0]
    component nftleaf0IsSigner = IsEqual();
    nftleaf0IsSigner.in[0] <== dataPath[2][OwnerOffset];
    nftleaf0IsSigner.in[1] <== signer;

    andmany.in[andmanyOffset] <== nftleaf0IsSigner.out;
    andmanyOffset++;

    // circuits: check nftIndex < 2 ^ 20 & nftIndex != 0
    component nftIndexRangeCheck = Check2PowerRangeFE(20);
    nftIndexRangeCheck.in <== nftIndex;
    component nftIndexIsZero = IsZero();
    nftIndexIsZero.in <== nftIndex;
    andmany.in[andmanyOffset] <== nftIndexRangeCheck.out * (1 - nftIndexIsZero.out);
    andmanyOffset++;

    // circuits: check nftIndex == CheckNFTIndexFE's output nftIndex
    component nftIndexcheck = IsEqual();
    component nftIndexFromTreePath = CheckAndGetNFTIndexFromPath();
    nftIndexFromTreePath.address <== dataPath[2][IndexOffset];
    nftIndexcheck.in[0] <== nftIndexFromTreePath.nftIndex;
    nftIndexcheck.in[1] <== nftIndex;
    andmany.in[andmanyOffset] <== nftIndexFromTreePath.out * nftIndexcheck.out;
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

    // STEP2: if dataPath[2]'s leafValues[1] != 0, check bidder's balance Index
    component nftleaf1IsZero = IsZero();
    nftleaf1IsZero.in <== dataPath[2][BidderOffset];
    component nftBidderIndexCheck = CheckBalanceIndex();
    nftBidderIndexCheck.account <== dataPath[2][BidderOffset];
    nftBidderIndexCheck.token <== TokenIndex;
    nftBidderIndexCheck.index <== dataPath[1][IndexOffset];

    component nftBidderExist = BiSelect();

    nftBidderExist.in[0] <== nftBidderIndexCheck.out;
    nftBidderExist.in[1] <== nftleaf1IsZero.out;
    nftBidderExist.cond <== nftleaf1IsZero.out;

    andmany.in[andmanyOffset] <== nftBidderExist.out;
    andmanyOffset++;
    
    // Return nft_biddingAmount to nft_bidder's balance
    // circuits: check balance of nft_bidder's balance dosen't overflow(< 2 ^ 250)
    component changeNftBidderbalance = ChangeValueFromTreePath();
    changeNftBidderbalance.diff <== dataPath[2][BiddingAmountOffset];
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        changeNftBidderbalance.treeData[i] <== dataPath[1][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[1][i] <== changeNftBidderbalance.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== changeNftBidderbalance.out;
    andmanyOffset++;

    // STEP3: update nft with new owner, bidder and, biddingAmount
    // circuits : check align
    component nftCheckAlign = CheckAlign();
    nftCheckAlign.address <== dataPath[2][IndexOffset];
    andmany.in[andmanyOffset] <== nftCheckAlign.out;
    andmanyOffset++;   

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if(i == OwnerOffset) {
            newDataPath[2][i] <== 0;
        } else if (i == BidderOffset) {
            newDataPath[2][i] <== 0;
        } else if (i == BiddingAmountOffset) {
            newDataPath[2][i] <== 0;
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

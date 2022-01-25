pragma circom 2.0.2;

include "../utils/swap_aux.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

template BidNFT() {
    var TokenIndex = 1;
    var MaxStep = 5;
    var IndexOffset = 0;
    var LeaveStartOffset = 61;
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

    component andmany = AndMany(15);
    var andmanyOffset = 0;

    var nonce = args[1];
    var bidder = args[3];
    var biddingAmount = args[4];
    var nftIndex = args[5];

    // circuits: check dataPath[3]'s leafValues[0] < 2 ^ 20 & leafValues[0] != 0
    component nftleaf0RangeCheck = Check2PowerRangeFE(20);
    nftleaf0RangeCheck.in <== dataPath[3][OwnerOffset];
    component nftleaf0IsZero = IsZero();
    nftleaf0IsZero.in <== dataPath[3][OwnerOffset];

    andmany.in[andmanyOffset] <== nftleaf0RangeCheck.out * (1 - nftleaf0IsZero.out);
    andmanyOffset++;

    // circuits: check dataPath[3]'s leafValues[1] < 2 ^ 20
    component nftleaf1RangeCheck = Check2PowerRangeFE(20);
    nftleaf1RangeCheck.in <== dataPath[3][OwnerOffset];

    andmany.in[andmanyOffset] <== nftleaf1RangeCheck.out;
    andmanyOffset++;

    // circuits: check dataPath[3]'s leafValues[2] < 2 ^ 250
    component nftleaf2RangeCheck = Check2PowerRangeFE(250);
    nftleaf2RangeCheck.in <== dataPath[3][OwnerOffset];

    andmany.in[andmanyOffset] <== nftleaf2RangeCheck.out;
    andmanyOffset++;

    // circuits: check bidder < 2 ^ 20 & bidder != 0
    component bidderRangeCheck = Check2PowerRangeFE(20);
    bidderRangeCheck.in <== bidder;
    component bidderIsZero = IsZero();
    bidderIsZero.in <== bidder;

    andmany.in[andmanyOffset] <== bidderRangeCheck.out * (1 - bidderIsZero.out);
    andmanyOffset++;

    // circuits: check biddingAmount < 2 ^ 250 & biddingAmount > dataPath[3]'s leafValues[2]
    component biddingAmountRangeCheck = Check2PowerRangeFE(250);
    biddingAmountRangeCheck.in <== biddingAmount;
    component lessthan = LessThan(250);
    lessthan.in[0] <== dataPath[3][BiddingAmountOffset];
    lessthan.in[1] <== biddingAmount;
    andmany.in[andmanyOffset] <== lessthan.out * biddingAmountRangeCheck.out;
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
    nftIndexFromTreePath.address <== dataPath[3][IndexOffset];
    nftIndexcheck.in[0] <== nftIndexFromTreePath.nftIndex;
    nftIndexcheck.in[1] <== nftIndex;
    andmany.in[andmanyOffset] <== nftIndexFromTreePath.out * nftIndexcheck.out;
    andmanyOffset++;

    // circuits: check signer == bidder
    component signerIsBidder = IsEqual();
    signerIsBidder.in[0] <== signer;
    signerIsBidder.in[1] <== bidder;
    andmany.in[andmanyOffset] <== signerIsBidder.out;
    andmanyOffset++;
    
    // check bidder's balance index
    // check bidder has enough balance(>= biddingAmount)
    component bidderBalanceIndexCheck = CheckBalanceIndex();
    bidderBalanceIndexCheck.account <== bidder;
    bidderBalanceIndexCheck.token <== TokenIndex;
    bidderBalanceIndexCheck.index <== dataPath[3][IndexOffset];

    component getBalance = GetValueFromTreePath();
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        getBalance.treeData[i] <== dataPath[2][i];
    }
    var balance = getBalance.out;

    component enoughBalance = GreaterEqThan(250);
    enoughBalance.in[0] <== balance;
    enoughBalance.in[1] <== biddingAmount;
    andmany.in[andmanyOffset] <== bidderBalanceIndexCheck.out * enoughBalance.out;
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
    
    // STEP2: if dataPath[3]'s leafValues[1] != 0, check nft_bidder's balance Index
    component nftleaf1IsZero = IsZero();
    nftleaf1IsZero.in <== dataPath[3][BidderOffset];
    component nftBidderIndexCheck = CheckBalanceIndex();
    nftBidderIndexCheck.account <== dataPath[3][BidderOffset];
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
    component changeNftBidderBalance = ChangeValueFromTreePath();
    changeNftBidderBalance.diff <== dataPath[3][BiddingAmountOffset];
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        changeNftBidderBalance.treeData[i] <== dataPath[1][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[1][i] <== changeNftBidderBalance.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== changeNftBidderBalance.out;
    andmanyOffset++;

    // STEP3: update balance of bidder
    component changeBidderBalance = ChangeValueFromTreePath();
    changeBidderBalance.diff <== -biddingAmount;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        changeBidderBalance.treeData[i] <== dataPath[2][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[2][i] <== changeBidderBalance.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== changeBidderBalance.out;
    andmanyOffset++;

    // STEP4: update nft info with new bidder and biddingAmount
    // circuits : check align
    component nftCheckAlign = CheckAlign();
    nftCheckAlign.address <== dataPath[3][IndexOffset];
    andmany.in[andmanyOffset] <== nftCheckAlign.out;
    andmanyOffset++;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if(i == OwnerOffset) {
            newDataPath[3][i] <== dataPath[3][OwnerOffset];
        } else if (i == BidderOffset) {
            newDataPath[3][i] <== bidder;
        } else if (i == BiddingAmountOffset) {
            newDataPath[3][i] <== biddingAmount;
        } else {
            newDataPath[3][i] <== dataPath[3][i];
        }
    }

    for (var i = 4; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

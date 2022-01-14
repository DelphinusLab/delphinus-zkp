pragma circom 2.0.2;

include "../utils/swap_aux.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

template BidNFT() {
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

    // circuits: check owner != 0
    // circuits: check reserved value is 0
    // circuits: check if args[5] is 0
    // circuits: check bidder != 0
    component leaf1Is0 = IsZero();
    component leaf4Is0 = IsZero();
    component args5Is0 = IsZero();
    component bidderIs0 = IsZero();

    leaf1Is0.in <== dataPath[3][OwnerOffset];
    leaf4Is0.in <== dataPath[3][ReservedOffset];
    args5Is0.in <== args[5];
    bidderIs0.in <== bidder;

    component check0s = AndMany(4);

    check0s.in[0] <== 1 - leaf1Is0.out;
    check0s.in[1] <== leaf4Is0.out;
    check0s.in[2] <== args5Is0.out;
    check0s.in[3] <== 1 - bidderIs0.out;

    andmany.in[andmanyOffset] <== check0s.out;
    andmanyOffset++;

    // circuits: check Owner < 2 ^ 20
    component ownercheck = Check2PowerRangeFE(20);
    ownercheck.in <== dataPath[3][OwnerOffset];
    andmany.in[andmanyOffset] <== ownercheck.out;
    andmanyOffset++;

    // circuits: check Bidder < 2 ^ 20
    component biddercheck = Check2PowerRangeFE(20);
    biddercheck.in <== bidder;
    andmany.in[andmanyOffset] <== biddercheck.out;
    andmanyOffset++;

    // circuits: check BiddingAmount < 2 ^ 250
    component biddingAmountCheck = Check2PowerRangeFE(250);
    biddingAmountCheck.in <== biddingAmount;
    andmany.in[andmanyOffset] <== biddingAmountCheck.out;
    andmanyOffset++;

    // circuits: check Owner == leaf1
    component ownerIsleaf1 = IsEqual();
    ownerIsleaf1.in[0] <== dataPath[3][OwnerOffset];
    ownerIsleaf1.in[1] <== owner;
    andmany.in[andmanyOffset] <== ownerIsleaf1.out;
    andmanyOffset++;

    // circuits: check Previous bidder < 2 ^ 20
    component prevBiddercheck = Check2PowerRangeFE(20);
    prevBiddercheck.in <== dataPath[3][BidderOffset];
    andmany.in[andmanyOffset] <== prevBiddercheck.out;
    andmanyOffset++;

    // circuits: check Previous bidding amount < 2 ^ 250
    component prevBiddingAmountCheck = Check2PowerRangeFE(250);
    prevBiddingAmountCheck.in <== dataPath[3][BiddingAmountOffset];
    andmany.in[andmanyOffset] <== prevBiddingAmountCheck.out;
    andmanyOffset++;

    // circuits: check biddingAmount > Previous bidding amount
    component biddingAmountIsLarger = GreaterThan(250);
    biddingAmountIsLarger.in[0] <== biddingAmount;
    biddingAmountIsLarger.in[1] <== dataPath[3][BiddingAmountOffset];
    andmany.in[andmanyOffset] <==  biddingAmountIsLarger.out;
    andmanyOffset++;

    // check if bidder has enough balance (balance >= biddingAmount)
    component bidderBalanceCheck = CheckBalanceIndex();
    bidderBalanceCheck.account <== bidder;
    bidderBalanceCheck.token <== TokenIndex;
    bidderBalanceCheck.index <== dataPath[2][IndexOffset];
    andmany.in[andmanyOffset] <== bidderBalanceCheck.out;
    andmanyOffset++;

    component getBalance = GetValueFromTreePath();
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        getBalance.treeData[i] <== dataPath[2][i];
    }
    var balance = getBalance.out;

    component enoughMoney = GreaterEqThan(250);
    enoughMoney.in[0] <== balance;
    enoughMoney.in[1] <== biddingAmount;
    andmany.in[andmanyOffset] <== enoughMoney.out;
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

    // STEP2: if Previous bidder !=0 exist
    // Check balance index if previous bidder exist, don't check if not
    component prevBidderIs0 = IsZero();
    prevBidderIs0.in <== dataPath[3][BidderOffset];

    component prevBidderIndexCheck = CheckBalanceIndex();
    prevBidderIndexCheck.account <== dataPath[3][BidderOffset];
    prevBidderIndexCheck.token <== TokenIndex;
    prevBidderIndexCheck.index <== dataPath[1][IndexOffset];

    component prevBidderExist = BiSelect();

    prevBidderExist.in[0] <== prevBidderIndexCheck.out;
    prevBidderExist.in[1] <== prevBidderIs0.out;
    prevBidderExist.cond <== prevBidderIs0.out;

    andmany.in[andmanyOffset] <== prevBidderExist.out;
    andmanyOffset++;

    // Give back previous biddingAmount into previous bidder's balance
    component changePrevBidderbalance = ChangeValueFromTreePath();
    changePrevBidderbalance.diff <== dataPath[3][BiddingAmountOffset];
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        changePrevBidderbalance.treeData[i] <== dataPath[1][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[1][i] <== changePrevBidderbalance.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== changePrevBidderbalance.out;
    andmanyOffset++;

    // STEP3: update balance of bidder
    component changeBidderbalance = ChangeValueFromTreePath();
    changeBidderbalance.diff <== -biddingAmount;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        changeBidderbalance.treeData[i] <== dataPath[2][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[2][i] <== changeBidderbalance.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== changeBidderbalance.out;
    andmanyOffset++;

    // circuits: check caller permission and signer
    component perm = CheckPermission(1);
    perm.caller <== checkNonce.caller;
    andmany.in[andmanyOffset] <== perm.out * signed;
    andmanyOffset++;

    // STEP4: udpate nft info
    component nftIndex = CheckNFTInfoIndexFE();
    nftIndex.index <== dataPath[1][IndexOffset];
    andmany.in[andmanyOffset] <== nftIndex.out;
    andmanyOffset++;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if(i == BidderOffset) {
            newDataPath[3][i] <== bidder;
        } else if (i == BiddingAmountOffset) {
            newDataPath[3][i] <== biddingAmount;
        } else {
            newDataPath[3][i] <== dataPath[3][i];
        }
    }

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[4][i] <== dataPath[4][i];
    }

    out <== andmany.out;
}
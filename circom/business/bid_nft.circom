pragma circom 2.0.2;
// dataPath[0]-nonce, dataPath[1]-last bidder's balance, dataPath[2]-bidder's balance, dataPath[3]-nft

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

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

    component andmany = AndMany(20);
    var andmanyOffset = 0;

    var nonce = args[1];
    var owner = args[2];
    var bidder = args[3];
    var biddingAmount = args[4];

    // circuits: check dataPath[61] < 2 ^ 20
    component rangecheck0 = Check2PowerRangeFE(20);
    rangecheck0.in <== dataPath[3][OwnerOffset];
    andmany.in[andmanyOffset] <== rangecheck0.out;
    andmanyOffset++;
    
    // circuits: check dataPath[61] != 0
    component zero0 = IsZero();
    zero0.in <== dataPath[3][OwnerOffset];
    andmany.in[andmanyOffset] <== 1 - zero0.out;
    andmanyOffset++;

    // circuits: check dataPath[62] < 2 ^ 20
    component rangecheck1 = Check2PowerRangeFE(20);
    rangecheck1.in <== dataPath[3][BidderOffset];
    andmany.in[andmanyOffset] <== rangecheck1.out;
    andmanyOffset++;

    // circuits: check dataPath[63] < 2 ^ 250
    component rangecheck2 = Check2PowerRangeFE(250);
    rangecheck2.in <== dataPath[3][BiddingAmountOffset];
    andmany.in[andmanyOffset] <== rangecheck2.out;
    andmanyOffset++;

    // circuits: check dataPath[64] is 0
    component zero1 = IsZero();
    zero1.in <== dataPath[3][ReservedOffset];
    andmany.in[andmanyOffset] <== zero1.out;
    andmanyOffset++;
    
    // circuits: check if args[5] is 0
    component zero2 = IsZero();
    zero2.in <== args[5];
    andmany.in[andmanyOffset] <== zero2.out;
    andmanyOffset++;

    // circuits: check if owner is equal to dataPath[61]
    component ownerEq = IsEqual();
    ownerEq.in[0] <== dataPath[3][OwnerOffset];
    ownerEq.in[1] <== owner;
    andmany.in[andmanyOffset] <== ownerEq.out;
    andmanyOffset++;

    // circuits: check bidder < 2 ^ 20
    component rangecheck3 = Check2PowerRangeFE(20);
    rangecheck3.in <== bidder;
    andmany.in[andmanyOffset] <== rangecheck3.out;
    andmanyOffset++;
    
    // circuits: check bidder != 0
    component zero3 = IsZero();
    zero3.in <== bidder;
    andmany.in[andmanyOffset] <== 1 - zero3.out;
    andmanyOffset++;

    // circuits: check biddingAmount < 2 ^ 250
    component rangecheck4 = Check2PowerRangeFE(250);
    rangecheck4.in <== biddingAmount;
    andmany.in[andmanyOffset] <== rangecheck4.out;
    andmanyOffset++;

    // circuits: check biddingAmount > dataPath[63]
    component lessthan = LessThan(250);
    lessthan.in[0] <== dataPath[3][BiddingAmountOffset];
    lessthan.in[1] <== biddingAmount;
    andmany.in[andmanyOffset] <==  lessthan.out;
    andmanyOffset++;
    
    // check if bidder has enough balance(balance >= biddingAmount)
    component balanceIndex0 = CheckBalanceIndex();
    balanceIndex0.account <== bidder;
    balanceIndex0.token <== TokenIndex;
    balanceIndex0.index <== dataPath[2][IndexOffset];
    andmany.in[andmanyOffset] <== balanceIndex0.out;
    andmanyOffset++;

    component getValue = GetValueFromTreePath();
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        getValue.treeData[i] <== dataPath[2][i];
    }
    var balance = getValue.out;

    component gethan = GreaterEqThan(250);
    gethan.in[0] <== balance;
    gethan.in[1] <== biddingAmount;
    andmany.in[andmanyOffset] <== gethan.out;
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
    
    // STEP2: if dataPath[62] !=0, update balance of last bidder(if there is no last bidder, biddingAmount is 0)
    // give back last biddingAmount into last Biddder's balance
    component balanceIndex1 = CheckBalanceIndex();
    balanceIndex1.account <== dataPath[3][BidderOffset];
    balanceIndex1.token <== TokenIndex;
    balanceIndex1.index <== dataPath[1][IndexOffset];
    andmany.in[andmanyOffset] <== balanceIndex1.out;
    andmanyOffset++;

    component change0 = ChangeValueFromTreePath();
    change0.diff <== dataPath[3][BiddingAmountOffset];
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        change0.treeData[i] <== dataPath[1][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[1][i] <== change0.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== change0.out;
    andmanyOffset++;

    // STEP3: update balance of bidder
    component change1 = ChangeValueFromTreePath();
    change1.diff <== -biddingAmount;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        change1.treeData[i] <== dataPath[2][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[2][i] <== change1.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== change1.out;
    andmanyOffset++;

    // STEP4: udpate nft info
    component nftIndex = CheckNFTIndex();
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

    for (var i = 4; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

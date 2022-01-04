pragma circom 2.0.2;

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

template WithdrawNFT() {
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

    component andmany = AndMany(8);
    var andmanyOffset = 0;

    var nonce = args[1];
    var owner = args[2];
    var bidder = args[3];
    var biddingAmount = args[4];

    // check if owner, bidder, biddingAmount and args[5] is 0
    component zero0 = IsZero();
    zero0.in <== owner;
    component zero1 = IsZero();
    zero1.in <== bidder;
    component zero2 = IsZero();
    zero2.in <== biddingAmount;
    component zero3 = IsZero();
    zero3.in <== args[5];

    signal zerocheck0;
    signal mul0;
    signal mul1;
    mul0 <== zero0.out * zero1.out;
    mul1 <== zero2.out * zero3.out;
    zerocheck0 <== mul0 * mul1;
    andmany.in[andmanyOffset] <== zerocheck0;
    andmanyOffset++;

    // circuits: check dataPath[61] != 0
    component zero4 = IsZero();
    zero4.in <== dataPath[1][OwnerOffset];
    andmany.in[andmanyOffset] <== 1 - zero4.out;
    andmanyOffset++;

    // circuits: dataPath[61] < 2 ^ 20
    component rangecheck = Check2PowerRangeFE(20);
    rangecheck.in <== dataPath[1][OwnerOffset];
    andmany.in[andmanyOffset] <== rangecheck.out;
    andmanyOffset++;
    
    // check if dataPath[62]-dataPath[64] is 0
    component zero5 = IsZero();
    zero5.in <== dataPath[1][BidderOffset];
    component zero6 = IsZero();
    zero6.in <== dataPath[1][BiddingAmountOffset];
    component zero7 = IsZero();
    zero7.in <== dataPath[1][ReservedOffset];

    signal zerocheck1;
    signal mul2;
    mul2 <== zero5.out * zero6.out;
    zerocheck1 <== mul2 * zero7.out;
    andmany.in[andmanyOffset] <== zerocheck1;
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
    component nftIndex = CheckNFTIndex();
    nftIndex.index <== dataPath[1][IndexOffset];
    andmany.in[andmanyOffset] <== nftIndex.out;
    andmanyOffset++;
    
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if (i == OwnerOffset) {
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

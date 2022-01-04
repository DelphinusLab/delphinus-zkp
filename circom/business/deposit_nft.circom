pragma circom 2.0.2;

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

template DepositNFT() {
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

    // check if bidder, biddingAmount and args[5] is 0
    component zero0 = IsZero();
    zero0.in <== bidder;
    component zero1 = IsZero();
    zero1.in <== biddingAmount;
    component zero2 = IsZero();
    zero2.in <== args[5];

    signal zerocheck0;
    signal mul0;
    mul0 <== zero0.out * zero1.out;
    zerocheck0 <== mul0 * zero2.out;
    andmany.in[andmanyOffset] <== zerocheck0;
    andmanyOffset++;

    // check owner < 2 ^ 20
    component rangecheck = Check2PowerRangeFE(20);
    rangecheck.in <== owner;
    andmany.in[andmanyOffset] <== rangecheck.out;
    andmanyOffset++;
    
    // check owner != 0
    component zero3 = IsZero();
    zero3.in <== owner;
    andmany.in[andmanyOffset] <== 1 - zero3.out;
    andmanyOffset++;
    
    // check if dataPath[61]-dataPath[64] is 0
    component zero4 = IsZero();
    zero4.in <== dataPath[1][OwnerOffset];
    component zero5 = IsZero();
    zero5.in <== dataPath[1][BidderOffset];
    component zero6 = IsZero();
    zero6.in <== dataPath[1][BiddingAmountOffset];
    component zero7 = IsZero();
    zero7.in <== dataPath[1][ReservedOffset];

    signal zerocheck1;
    signal mul1;
    signal mul2;
    mul1 <== zero4.out * zero5.out;
    mul2 <== zero6.out * zero7.out;
    zerocheck1 <== mul1 * mul2;
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

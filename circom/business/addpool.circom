pragma circom 2.0.2;

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

template InitPoolInfoFE() {
    var IndexOffset = 0;
    var LeafStartOffset = 61;
    var MaxTreeDataIndex = 66;

    signal input tokenIndex0;
    signal input tokenIndex1;
    signal input dataPath[MaxTreeDataIndex];

    signal output newDataPath[MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(3);
    var andmanyOffset = 0;

    component c = CheckPoolInfoIndexAnonymousFE();
    c.index <== dataPath[IndexOffset];
    andmany.in[andmanyOffset] <== c.out;
    andmanyOffset++;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if (i == LeafStartOffset) {
            newDataPath[i] <== tokenIndex0;
        } else if (i == LeafStartOffset + 1) {
            newDataPath[i] <== tokenIndex1;
        } else {
            newDataPath[i] <== dataPath[i];
        }
    }

    component zero0 = IsZero();
    zero0.in <== dataPath[LeafStartOffset];
    andmany.in[andmanyOffset] <== zero0.out;
    andmanyOffset++;

    component zero1 = IsZero();
    zero1.in <== dataPath[LeafStartOffset + 1];
    andmany.in[andmanyOffset] <== zero1.out;
    andmanyOffset++;

    out <== andmany.out;
}

template InitTotalShare() {
    var IndexOffset = 0;
    var LeafStartOffset = 61;
    var MaxTreeDataIndex = 66;
    var TotalShare = 0;
    var SwapRem = 0;

    signal input dataPath[MaxTreeDataIndex];
    signal output newDataPath[MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(2);
    var andmanyOffset = 0;

    component c = CheckSharePriceKIndexAnonymousFE();
    c.index <== dataPath[IndexOffset];
    andmany.in[andmanyOffset] <== c.out;
    andmanyOffset++;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if(i == LeafStartOffset) {
            newDataPath[i] <== TotalShare;
        } else {
            newDataPath[i] <== dataPath[i];
        }
    }

    component zero0 = IsZero();
    zero0.in <== dataPath[LeafStartOffset];
    andmany.in[andmanyOffset] <== zero0.out;
    andmanyOffset++;

    out <== andmany.out;
}

template AddPool() {
    var MaxStep = 6;
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
    var tokenIndex0 = args[2];
    var tokenIndex1 = args[3];

    // circuits: check tokenIndex0 < 2 ^ 10
    component rangecheck0 = Check2PowerRangeFE(10);
    rangecheck0.in <== tokenIndex0;
    andmany.in[andmanyOffset] <== rangecheck0.out;
    andmanyOffset++;

    // circuits: check tokenIndex1 < 2 ^ 10
    component rangecheck1 = Check2PowerRangeFE(10);
    rangecheck1.in <== tokenIndex1;
    andmany.in[andmanyOffset] <== rangecheck1.out;
    andmanyOffset++;

    // circuits: check tokenIndex0 != tokenIndex1
    component tokenEq = IsEqual();
    tokenEq.in[0] <== tokenIndex0;
    tokenEq.in[1] <== tokenIndex1;
    andmany.in[andmanyOffset] <== 1 - tokenEq.out;
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

    // STEP2: init pool info
    // circuits: check index of pool
    // circuits: check leafValues[0] and leafValues[1] equal to 0
    component init = InitPoolInfoFE();
    init.tokenIndex0 <== tokenIndex0;
    init.tokenIndex1 <== tokenIndex1;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        init.dataPath[i] <== dataPath[1][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[1][i] <== init.newDataPath[i];
    }
    andmany.in[andmanyOffset] <== init.out;
    andmanyOffset++;

    //STEP3: init TotalShare in Pool
    // circuits: check index of TotalShare
    // circuits: check leafValues[0] equal to 0
    component init_share = InitTotalShare();
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        init_share.dataPath[i] <== dataPath[2][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[2][i] <== init_share.newDataPath[i];
    }
    andmany.in[andmanyOffset] <== init_share.out;
    andmanyOffset++;

    for (var i = 3; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

pragma circom 2.0.2;

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

template InitPoolInfoFE() {
    var IndexOffset = 0;
    var LeafStartOffset = 61;
    var MaxTreeDataIndex = 66;
    // SharePriceK = (1 / sharePrice) * 10 ^ 12, initial value is 10 ^ 12
    var SharePriceK = 10 ** 12;
    var SharePriceKOffset = 58;

    signal input tokenIndex0;
    signal input tokenIndex1;
    signal input dataPath[MaxTreeDataIndex];

    signal output newDataPath[MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(4);
    var andmanyOffset = 0;

    component c = CheckPoolInfoIndexAnonymousFE();
    c.index <== dataPath[IndexOffset];
    andmany.in[andmanyOffset] <== c.out;
    andmanyOffset++;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if(i == SharePriceKOffset) {
            newDataPath[i] <== SharePriceK;
        } else if (i == LeafStartOffset) {
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
    andmany.in[andmanyOffset] <== zero0.out;
    andmanyOffset++;

    component zero2 = IsZero();
    zero2.in <== dataPath[SharePriceKOffset];
    andmany.in[andmanyOffset] <== zero0.out;
    andmanyOffset++;

    out <== andmany.out;
}

template AddPool() {
    var MaxStep = 5;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal input signer;
    signal input signed;
    signal output newDataPath[MaxStep][MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(7);
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
    // Init share Price K
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

    for (var i = 2; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

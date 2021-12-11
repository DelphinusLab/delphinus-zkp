pragma circom 2.0.2;

include "../utils/bit.circom";

/*
 * FE - False Negative.
 *      If out is 1, then it must be correct.
 *      But if out is 0, it is unknown (because prover can give bad witness).
 * In some case, the condition is in a branch so we can not put an assert into circuits.
 * However, we can use FE because the proofer want to prove that the out is 1 to pass the verifier.
 * Use these templates carefully.
 */

// b01 Pool: (10bits) pool index + (18bits) 0 + (2bits) poolinfo (token0index, token1index, amount0, amount1)
template CheckPoolInfoIndexFE() {
    signal input index;
    signal output out;

    // Find 10 bits as value `a` in BE, check (1 << 30) + (a << 20) == index
    component n2b = Num2Bits(10);
    n2b.in <-- (index >> 20) & ((1 << 10) - 1);

    component eq = IsEqual();
    eq.in[0] <== n2b.in * (1 << 20) + (1 << 30);
    eq.in[1] <== index;

    out <== eq.out;
}

template Check2PowerRangeFE(N) {
    signal input in;
    signal output out;

    component n2b = Num2Bits(N);
    n2b.in <-- in & ((1 << N) - 1);

    component eq = IsEqual();
    eq.in[0] <== n2b.in;
    eq.in[1] <== in;

    out <== eq.out;
}

template AndMany(N) {
    signal input in[N];
    signal output out;

    signal t[N - 1];

    t[0] <== in[0] * in[1];
    for (var i = 2; i < N; i++) {
        t[i - 1] <== t[i - 2] * in[i];
    }

    out <== t[N - 2];
}

// b11 Account: (20bits) account index + (10bits) info data, (0 & 1 - public key, 2 - nonce, other -reserved)
template CheckAccountInfoIndexFE(OFFSET) {
    signal input index;
    signal output out;
    signal output caller;

    // Find 20 bits as value `a` in BE, check (3 << 30) + (a << 10) + OFFSET == index
    component n2b = Num2Bits(20);
    n2b.in <-- (index >> 10) & ((1 << 20) - 1);

    component eq = IsEqual();
    eq.in[0] <== n2b.in * (1 << 10) + (3 << 30) + OFFSET;
    eq.in[1] <== index;

    out <== eq.out;
    caller <== n2b.in;
}

template CheckAndUpdateNonceAnonymousFE() {
    var IndexOffset = 0;
    var LeafStartOffset = 61;
    var NonceOffsetInLeaves = 2;
    var NonceOffset = LeafStartOffset + NonceOffsetInLeaves;
    var MaxTreeDataIndex = 66;
    signal input nonce;
    signal input dataPath[MaxTreeDataIndex];

    signal output newDataPath[MaxTreeDataIndex];
    signal output out;
    signal output caller;

    component c = CheckAccountInfoIndexFE(NonceOffsetInLeaves);
    c.index <== dataPath[IndexOffset];
    var out0 = c.out;

    component eq = IsEqual();
    eq.in[0] <== nonce;
    eq.in[1] <== dataPath[NonceOffset];
    var out1 = eq.out;

    out <== out0 * out1;
    caller <== c.caller;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if (i == NonceOffset) {
            newDataPath[i] <== dataPath[i] + 1;
        } else {
            newDataPath[i] <== dataPath[i];
        }
    }
}

template CheckAndUpdateNonceFE() {
    var MaxTreeDataIndex = 66;

    signal input caller;
    signal input nonce;
    signal input dataPath[MaxTreeDataIndex];

    signal output newDataPath[MaxTreeDataIndex];
    signal output out;

    component c = CheckAndUpdateNonceAnonymousFE();
    c.nonce <== nonce;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        c.dataPath[i] <== dataPath[i];
    }

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[i] <== c.newDataPath[i];
    }

    component eq = IsEqual();
    eq.in[0] <== caller;
    eq.in[1] <== c.caller;

    out <== eq.out * c.out;
}

template InitPoolInfoFE() {
    var IndexOffset = 0;
    var LeafStartOffset = 61;
    var MaxTreeDataIndex = 66;

    signal input tokenIndex0;
    signal input tokenIndex1;
    signal input dataPath[MaxTreeDataIndex];

    signal output newDataPath[MaxTreeDataIndex];
    signal output out;

    component c = CheckPoolInfoIndexFE();
    c.index <== dataPath[IndexOffset];
    var out0 = c.out;

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
    component zero1 = IsZero();
    zero1.in <== dataPath[LeafStartOffset + 1];

    signal zerocheck;
    zerocheck <== zero0.out * zero1.out;
    out <== out0 * zerocheck;
}

template CheckPermission(privilege) {
    signal input caller;
    signal output out;

    // TODO: fill privilege decision.

    out <== 1;
}

template AddPool() {
    var MaxStep = 5;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal output newDataPath[MaxStep][MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(8);

    var nonce = args[1];
    var tokenIndex0 = args[2];
    var tokenIndex1 = args[3];

    var andmanyOffset = 0;

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

    // check if the other part of args is 0
    component zeroarg[CommandArgs - 4];
    var offset = 0;
    for (var i = 4; i < CommandArgs; i++) {
        zeroarg[offset] = IsZero();
        zeroarg[offset].in <== args[i];
        andmany.in[andmanyOffset] <== zeroarg[offset].out;
        andmanyOffset++;
        offset++;
    }

    // STEP1: udpate nonce
    component checkNonce = CheckAndUpdateNonceAnonymousFE();
    checkNonce.nonce <== nonce;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        checkNonce.dataPath[i] <== dataPath[0][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[0][i] <== checkNonce.newDataPath[i];
    }
    andmany.in[andmanyOffset] <== checkNonce.out;
    andmanyOffset++;

    // circuits: check caller permission
    component perm = CheckPermission(1);
    perm.caller <== checkNonce.caller;
    andmany.in[andmanyOffset] <== perm.out;
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

    for (var i = 2; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

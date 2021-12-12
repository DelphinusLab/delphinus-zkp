pragma circom 2.0.2;

include "./bit.circom";

/*
 * FE - False Negative.
 *      If out is 1, then it must be correct.
 *      But if out is 0, it is unknown (because prover can give bad witness).
 * In some case, the condition is in a branch so we can not put an assert into circuits.
 * However, we can use FE because the proofer want to prove that the out is 1 to pass the verifier.
 * Use these templates carefully.
 */

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

    signal t[N];

    var acc = 1;
    for (var i = 0; i < N; i++) {
        t[i] <== acc * in[i];
        acc = t[i];
    }

    out <== acc;
}

template GetValueFromTreePath() {
    var IndexOffset = 0;
    var NodesPerLevel = 4;
    var LeafStartOffset = 61;
    var MaxTreeDataIndex = 66;

    signal input treeData[MaxTreeDataIndex];
    signal output out;

    component c = Num2Bits(32);
    c.in <== treeData[IndexOffset];

    var offset = c.out[0] + 2 * c.out[1];

    component select = NSelect(NodesPerLevel);
    select.cond = offset;
    for (var i = 0; i < NodesPerLevel; i++) {
        select.in[i] <== treeData[i + LeafStartOffset];
    }

    out <== select.out;
}

template SetValueFromTreePath() {
    var IndexOffset = 0;
    var NodesPerLevel = 4;
    var LeafStartOffset = 61;
    var MaxTreeDataIndex = 66;

    signal input value;
    signal input treeData[MaxTreeDataIndex];
    signal output newTreeData[MaxTreeDataIndex];

    component c = Num2Bits(32);
    c.in <== treeData[IndexOffset];

    var offset = c.out[0] + 2 * c.out[1];

    component select[NodesPerLevel];
    for (var i = 0; i < NodesPerLevel; i++) {
        select[i] = BiSelect();
        select[i].in[0] <== value;
        select[i].in[1] <== treeData[i + LeafStartOffset];
        select[i].cond <== offset - i;
        newTreeData[i + LeafStartOffset] = select[i].out;
    }

    for (var i = 0; i < LeafStartOffset; i++) {
        newTreeData[i] <== treeData[i];
    }

    for (var i = LeafStartOffset + NodesPerLevel; i < MaxTreeDataIndex; i++) {
        newTreeData[i] <== treeData[i];
    }
}

template ChangeValueFromTreePath() {
    var MaxTreeDataIndex;

    signal input treeData[MaxTreeDataIndex];
    signal input diff;
    signal output newTreeData[MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(8);
    var andmanyOffset = 0;

    component getValue = GetValueFromTreePath();
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        getValue.treeData[i] <== treeData[i];
    }
    var oldValue = getValue.out;

    component rangecheck0 = Check2PowerRangeFE(250);
    rangecheck0.in <== oldValue;
    var out0 = rangecheck0.out;

    var newValue = oldValue + diff;

    component rangecheck1 = Check2PowerRangeFE(250);
    rangecheck1.in <== newValue;
    var out1 = rangecheck1.out;

    component update = SetValueFromTreePath();
    update.value <== newValue;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        update.treeData[i] <== treeData[i];
    }

    out <== out0 * out1;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newTreeData[i] <== update.newTreeData[i];
    }
}

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

// b00 Balance: (20bits) account index + (10bits) token index
template CheckBalanceIndex() {
    signal input account;
    signal input token;
    signal input index;
    signal output out;

    component eq = IsEqual();
    eq.in[0] <== account * (1 << 10) + token;
    eq.in[1] <== index;

    out <== eq.out;
}

// b11 Account: (20bits) account index + (10bits) info data, (0 & 1 - public key, 2 - nonce, other - reserved)
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

template CheckPermission(privilege) {
    signal input caller;
    signal output out;

    // TODO: fill privilege decision.

    out <== 1;
}

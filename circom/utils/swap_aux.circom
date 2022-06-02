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
    /*
     * N must be less than 254 bits
     * Each check by such code:
     *   component a= Check2PowerRangeFE(254);
     *   a.in <== 10;
     *   a.out === 1;
     * It will pop up error as it will exceed field size.
     */
    assert(N <= 253);
    signal input in;
    signal output out;

    component n2b = Num2Bits(N);
    n2b.in <-- in & ((1 << N) - 1);

    component eq = IsEqual();
    eq.in[0] <== n2b.in;
    eq.in[1] <== in;

    out <== eq.out;
}

template LessThanFE(N) {
    signal input in[2];
    signal output out;

    var diff = in[1] - in[0] - 1;

    component checkDiff = Check2PowerRangeFE(N);
    checkDiff.in <== diff;
    out <== checkDiff.out;
}

template GreaterEqThanFE(N) {
    signal input in[2];
    signal output out;

    var diff = in[0] - in[1];

    component checkDiff = Check2PowerRangeFE(N);
    checkDiff.in <== diff;
    out <== checkDiff.out;
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
    select.cond <== offset;
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
        newTreeData[i + LeafStartOffset] <== select[i].out;
    }

    for (var i = 0; i < LeafStartOffset; i++) {
        newTreeData[i] <== treeData[i];
    }

    for (var i = LeafStartOffset + NodesPerLevel; i < MaxTreeDataIndex; i++) {
        newTreeData[i] <== treeData[i];
    }
}

template ChangeValueFromTreePath() {
    var MaxTreeDataIndex = 66;

    signal input treeData[MaxTreeDataIndex];
    signal input diff;
    signal output newTreeData[MaxTreeDataIndex];
    signal output out;

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
template CheckPoolInfoIndexAnonymousFE() {
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

template CheckPoolInfoIndexFE() {
    signal input pool;
    signal input index;
    signal output out;

    component eq = IsEqual();
    eq.in[0] <== pool * (1 << 20) + (1 << 30);
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

// b10 Share: (20bits) account index + (10bits) pool index
template CheckShareIndex() {
    signal input account;
    signal input pool;
    signal input index;
    signal output out;

    component eq = IsEqual();
    eq.in[0] <== account * (1 << 10) + pool + (2 << 30);
    eq.in[1] <== index;

    out <== eq.out;
}


// b11 Account: (20bits) account index + (10bits) info data, (0 & 1 - public key, 2 - nonce, other - reserved)
template CheckAccountInfoIndexFE() {
    signal input index;
    signal output out;
    signal output caller;

    // Find 20 bits as value `a` in BE, check (3 << 30) + (a << 10) + OFFSET == index
    component n2bAccount = Num2Bits(20);
    n2bAccount.in <-- (index >> 10) & ((1 << 20) - 1);

    component n2bOffset = Num2Bits(2);
    n2bOffset.in <-- index & 3;

    component eq = IsEqual();
    eq.in[0] <== n2bAccount.in * (1 << 10) + (3 << 30) + n2bOffset.in;
    eq.in[1] <== index;

    out <== eq.out;
    caller <== n2bAccount.in;
}

// b11 NFT: (20bits) nft index + (4bits) MetaType(1) + (6bits) info data (owner, bidder, biddingAmount, reserved)
template CheckAndGetNFTIndexFromPath() {
    signal input address;
    signal output out;
    signal output nftIndex;
    signal accountIndex;
    signal offset;

    // Find 20 bits as value `a` in BE, check (3 << 30) + (a << 10) + (1 << 6) + OFFSET == index
    accountIndex <-- (address >> 10) & ((1 << 20) - 1);
    offset <-- address & 3;

    component eq = IsEqual();
    eq.in[0] <== accountIndex * (1 << 10) + (3 << 30) + (1 << 6) + offset;
    eq.in[1] <== address;

    out <== eq.out;
    nftIndex <== accountIndex;
}

template CheckAlign() {
    signal input address;
    signal output out;
    signal offset;

    offset <-- address & 3;

    component isAlign = IsZero();
    isAlign.in <== offset;

    out <== isAlign.out;
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

    component c = CheckAccountInfoIndexFE();
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

// calculate new liquidity for swap with amm model
template CalculateSwapNewLiq() {
    signal input token0liq;
    signal input token1liq;
    signal input amount;
    signal input reverse;
    signal output newtoken0liq;
    signal output newtoken1liq;
    signal output resultAmount;
    signal output out;
    signal amount_input;
    signal amount_output;
    signal dividend;
    signal divisor;
    signal remainder;

    component andmany = AndMany(4);
    var andmanyOffset = 0;

    // reverse: 0 -> amount_input == token0liq, 1 -> amount_input == token1liq
    component getAmountInput = BiSelect();
    getAmountInput.in[0] <== token0liq;
    getAmountInput.in[1] <== token1liq;
    getAmountInput.cond <== reverse;
    amount_input <== getAmountInput.out;

    // reverse: 0 -> amount_output == token1liq, 1 -> amount_output == token0liq
    component getAmountOutput = BiSelect();
    getAmountOutput.in[0] <== token1liq;
    getAmountOutput.in[1] <== token0liq;
    getAmountOutput.cond <== reverse;
    amount_output <== getAmountOutput.out;

    component amountInputIsZero = IsZero();
    amountInputIsZero.in <== amount_input;
    andmany.in[andmanyOffset] <== 1 - amountInputIsZero.out;
    andmanyOffset++;

    component token0liqcheck = Check2PowerRangeFE(125);
    token0liqcheck.in <== amount_input;
    andmany.in[andmanyOffset] <== token0liqcheck.out;
    andmanyOffset++;

    component token1liqcheck = Check2PowerRangeFE(125);
    token1liqcheck.in <== amount_output;
    andmany.in[andmanyOffset] <== token1liqcheck.out;
    andmanyOffset++;

    // swap rate is almost equal to 0.3%(1021/1024 for convenience in circom)
    dividend <== amount_output * amount * 1021;
    divisor <== (amount_input + amount) * 1024;
    resultAmount <-- dividend \ divisor;
    remainder <-- dividend - resultAmount * divisor;
    dividend === resultAmount * divisor + remainder;
    component lessthan = LessThanFE(250);
    lessthan.in[0] <== remainder;
    lessthan.in[1] <== divisor;
    andmany.in[andmanyOffset] <== lessthan.out;
    andmanyOffset++;

    // reverse: 0 -> newtoken0liq = token0liq + amount, 1 -> newtoken0liq = token0liq - resultAmount
    component getNewToken0Liq = BiSelect();
    getNewToken0Liq.in[0] <== token0liq + amount;
    getNewToken0Liq.in[1] <== token0liq - resultAmount;
    getNewToken0Liq.cond <== reverse;
    newtoken0liq <== getNewToken0Liq.out;

    // reverse: 0 -> newtoken1liq = token0liq + amount, 1 -> newtoken1liq = token0liq - resultAmount
    component getNewToken1Liq = BiSelect();
    getNewToken1Liq.in[0] <== token1liq - resultAmount;
    getNewToken1Liq.in[1] <== token1liq + amount;
    getNewToken1Liq.cond <== reverse;
    newtoken1liq <== getNewToken1Liq.out;

    out <== andmany.out;
}

// swap will change K which is (1 / sharePrice) * (10 ^ 12)
template CalculateNewSharePriceK() {
    signal input token0liq;
    signal input token1liq;
    signal input amount;
    signal input sharePriceK;
    signal output newSharePriceK;
    signal output out;
    signal dividend;
    signal quotient;
    signal remainder;

    var total_old = token0liq + token1liq;
    var total_new = total_old + amount;
    dividend <== total_old * sharePriceK;
    quotient <-- dividend \ total_new;
    remainder <-- dividend - total_new * quotient;
    dividend === total_new * quotient + remainder;
    component lessthan = LessThanFE(250);
    lessthan.in[0] <== remainder;
    lessthan.in[1] <== total_new;
    out <== lessthan.out;

    component getNewSharePriceK = BiSelect();
    getNewSharePriceK.in[0] <== quotient;
    getNewSharePriceK.in[1] <== quotient + 1;
    getNewSharePriceK.cond <== remainder;

    newSharePriceK <== getNewSharePriceK.out;
}

// update liquidity for supply and retrieve
template CheckAndUpdateLiqFE(N) {
    var MaxTreeDataIndex = 66;
    var IndexOffset = 0;
    var LeaveStartOffset = 61;
    var Token0Offset = LeaveStartOffset;
    var Token1Offset = LeaveStartOffset + 1;
    var Token0LiqOffset = LeaveStartOffset + 2;
    var Token1LiqOffset = LeaveStartOffset + 3;

    signal input pool;
    signal input amount0;
    signal input amount1;
    signal input dataPath[MaxTreeDataIndex];
    signal output newDataPath[MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(8);
    var andmanyOffset = 0;

    component poolIndex = CheckPoolInfoIndexFE();
    poolIndex.pool <== pool;
    poolIndex.index <== dataPath[IndexOffset];
    andmany.in[andmanyOffset] <== poolIndex.out;
    andmanyOffset++;

    var token0 = dataPath[Token0Offset];
    var token1 = dataPath[Token1Offset];
    var token0liq = dataPath[Token0LiqOffset];
    var token1liq = dataPath[Token1LiqOffset];

    component token0check = Check2PowerRangeFE(10);
    token0check.in <== token0;
    andmany.in[andmanyOffset] <== token0check.out;
    andmanyOffset++;

    component token1check = Check2PowerRangeFE(10);
    token1check.in <== token1;
    andmany.in[andmanyOffset] <== token1check.out;
    andmanyOffset++;

    component tokenEq = IsEqual();
    tokenEq.in[0] <== token0;
    tokenEq.in[1] <== token1;
    andmany.in[andmanyOffset] <== 1 - tokenEq.out;
    andmanyOffset++;

    component token0liqcheck = Check2PowerRangeFE(250);
    token0liqcheck.in <== token0liq;
    andmany.in[andmanyOffset] <== token0liqcheck.out;
    andmanyOffset++;

    component token1lliqcheck = Check2PowerRangeFE(250);
    token1lliqcheck.in <== token1liq;
    andmany.in[andmanyOffset] <== token1lliqcheck.out;
    andmanyOffset++;

    var newtoken0liq;
    var newtoken1liq;

    // N: 0 -> supply, 1 -> retrieve
    if(N == 0) {
      newtoken0liq = token0liq + amount0;
      newtoken1liq = token1liq + amount1;
    } else if(N == 1) {
      newtoken0liq = token0liq - amount0;
      newtoken1liq = token1liq - amount1;
    }

    component newtoken0liqcheck = Check2PowerRangeFE(250);
    newtoken0liqcheck.in <== newtoken0liq;
    andmany.in[andmanyOffset] <== newtoken0liqcheck.out;
    andmanyOffset++;

    component newtoken1lliqcheck = Check2PowerRangeFE(250);
    newtoken1lliqcheck.in <== newtoken1liq;
    andmany.in[andmanyOffset] <== newtoken1lliqcheck.out;
    andmanyOffset++;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if (i == Token0LiqOffset) {
            newDataPath[i] <== newtoken0liq;
        } else if (i == Token1LiqOffset) {
            newDataPath[i] <== newtoken1liq;
        } else {
            newDataPath[i] <== dataPath[i];
        }
    }

    out <== andmany.out;
}

// update liquidity for swap
template CheckAndUpdateSwapLiqFE() {
    var MaxTreeDataIndex = 66;
    var SharePriceKOffset = 58;
    var IndexOffset = 0;
    var LeaveStartOffset = 61;
    var Token0Offset = LeaveStartOffset;
    var Token1Offset = LeaveStartOffset + 1;
    var Token0LiqOffset = LeaveStartOffset + 2;
    var Token1LiqOffset = LeaveStartOffset + 3;

    signal input pool;
    signal input amount;
    signal input reverse;
    signal input dataPath[MaxTreeDataIndex];
    signal output newDataPath[MaxTreeDataIndex];
    signal output resultAmount;
    signal output out;

    component andmany = AndMany(10);
    var andmanyOffset = 0;

    component poolIndex = CheckPoolInfoIndexFE();
    poolIndex.pool <== pool;
    poolIndex.index <== dataPath[IndexOffset];
    andmany.in[andmanyOffset] <== poolIndex.out;
    andmanyOffset++;

    var token0 = dataPath[Token0Offset];
    var token1 = dataPath[Token1Offset];
    var token0liq = dataPath[Token0LiqOffset];
    var token1liq = dataPath[Token1LiqOffset];

    component token0check = Check2PowerRangeFE(10);
    token0check.in <== token0;
    andmany.in[andmanyOffset] <== token0check.out;
    andmanyOffset++;

    component token1check = Check2PowerRangeFE(10);
    token1check.in <== token1;
    andmany.in[andmanyOffset] <== token1check.out;
    andmanyOffset++;

    component tokenEq = IsEqual();
    tokenEq.in[0] <== token0;
    tokenEq.in[1] <== token1;
    andmany.in[andmanyOffset] <== 1 - tokenEq.out;
    andmanyOffset++;

    component token0liqcheck = Check2PowerRangeFE(250);
    token0liqcheck.in <== token0liq;
    andmany.in[andmanyOffset] <== token0liqcheck.out;
    andmanyOffset++;

    component token1lliqcheck = Check2PowerRangeFE(250);
    token1lliqcheck.in <== token1liq;
    andmany.in[andmanyOffset] <== token1lliqcheck.out;
    andmanyOffset++;

    component getNewLiq = CalculateSwapNewLiq();
    getNewLiq.token0liq <== token0liq;
    getNewLiq.token1liq <== token1liq;
    getNewLiq.amount <== amount;
    getNewLiq.reverse <== reverse;
    var newtoken0liq = getNewLiq.newtoken0liq;
    var newtoken1liq = getNewLiq.newtoken1liq;
    resultAmount <-- getNewLiq.resultAmount;
    andmany.in[andmanyOffset] <== getNewLiq.out;
    andmanyOffset++;

    component newtoken0liqcheck = Check2PowerRangeFE(250);
    newtoken0liqcheck.in <== newtoken0liq;
    andmany.in[andmanyOffset] <== newtoken0liqcheck.out;
    andmanyOffset++;

    component newtoken1lliqcheck = Check2PowerRangeFE(250);
    newtoken1lliqcheck.in <== newtoken1liq;
    andmany.in[andmanyOffset] <== newtoken1lliqcheck.out;
    andmanyOffset++;

    component calculateNewSharePriceK = CalculateNewSharePriceK();
    calculateNewSharePriceK.token0liq <== token0liq;
    calculateNewSharePriceK.token1liq <== token1liq;
    calculateNewSharePriceK.amount <== amount - resultAmount;
    calculateNewSharePriceK.sharePriceK <== dataPath[SharePriceKOffset];
    andmany.in[andmanyOffset] <== calculateNewSharePriceK.out;
    andmanyOffset++;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if(i == SharePriceKOffset) {
            newDataPath[i] <== calculateNewSharePriceK.newSharePriceK;
        } else if (i == Token0LiqOffset) {
            newDataPath[i] <== newtoken0liq;
        } else if (i == Token1LiqOffset) {
            newDataPath[i] <== newtoken1liq;
        } else {
            newDataPath[i] <== dataPath[i];
        }
    }

    out <== andmany.out;
}

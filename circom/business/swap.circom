pragma circom 2.0.2;

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

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
    signal poolLiqIn;
    signal poolLiqOut;

    component andmany = AndMany(4);
    var andmanyOffset = 0;

    // reverse: 0 -> poolLiqIn == token0liq, 1 -> poolLiqIn == token1liq
    component getAmountInput = BiSelect();
    getAmountInput.in[0] <== token0liq;
    getAmountInput.in[1] <== token1liq;
    getAmountInput.cond <== reverse;
    poolLiqIn <== getAmountInput.out;

    // reverse: 0 -> poolLiqOut == token1liq, 1 -> poolLiqOut == token0liq
    component getAmountOutput = BiSelect();
    getAmountOutput.in[0] <== token1liq;
    getAmountOutput.in[1] <== token0liq;
    getAmountOutput.cond <== reverse;
    poolLiqOut <== getAmountOutput.out;

    component amountOutputIsZero = IsZero();
    amountOutputIsZero.in <== poolLiqOut;
    andmany.in[andmanyOffset] <== 1 - amountOutputIsZero.out;
    andmanyOffset++;

    component token0liqcheck = Check2PowerRangeFE(99);
    token0liqcheck.in <== poolLiqIn;
    andmany.in[andmanyOffset] <== token0liqcheck.out;
    andmanyOffset++;

    component token1liqcheck = Check2PowerRangeFE(99);
    token1liqcheck.in <== poolLiqOut;
    andmany.in[andmanyOffset] <== token1liqcheck.out;
    andmanyOffset++;

    // swap rate is almost equal to 0.3%(1021/1024 for convenience in circom)
    component amountOut = Divide();
    amountOut.numerator <== poolLiqOut * amount * 1021;
    amountOut.denominator <== (poolLiqIn + amount) * 1024;
    resultAmount <== amountOut.result;
    andmany.in[andmanyOffset] <== amountOut.out;
    andmanyOffset++;

    // reverse: 0 -> newtoken0liq = token0liq + amount, 1 -> newtoken0liq = token0liq - resultAmount
    component getNewToken0Liq = BiSelect();
    getNewToken0Liq.in[0] <== token0liq + amount;
    getNewToken0Liq.in[1] <== token0liq - amountOut.result;
    getNewToken0Liq.cond <== reverse;
    newtoken0liq <== getNewToken0Liq.out;

    // reverse: 0 -> newtoken1liq = token0liq + amount, 1 -> newtoken1liq = token0liq - resultAmount
    component getNewToken1Liq = BiSelect();
    getNewToken1Liq.in[0] <== token1liq - amountOut.result;
    getNewToken1Liq.in[1] <== token1liq + amount;
    getNewToken1Liq.cond <== reverse;
    newtoken1liq <== getNewToken1Liq.out;

    out <== andmany.out;
}

// update liquidity for swap
template CheckAndUpdateSwapLiqFE() {
    var MaxTreeDataIndex = 66;
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

    component andmany = AndMany(9);
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
    resultAmount <== getNewLiq.resultAmount;
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

template CalculateNewSharePriceK() {
    signal input token0liq;
    signal input token1liq;
    signal input amount;
    signal input sharePriceK;
    signal input swapRem;
    signal output newSharePriceK;
    signal output newSwapRem;
    signal output out;

    var totalOld = token0liq + token1liq;
    var totalNew = totalOld + amount;
    component k_new = Divide();
    k_new.numerator <== totalOld * sharePriceK - swapRem;
    k_new.denominator <== totalNew;
    out <== k_new.out;

    component getNewSharePriceK = BiSelect();
    getNewSharePriceK.in[0] <== k_new.result;
    getNewSharePriceK.in[1] <== k_new.result + 1;
    getNewSharePriceK.cond <== k_new.remainder;

    component getNewSwapRem = BiSelect();
    getNewSwapRem.in[0] <== k_new.remainder;
    getNewSwapRem.in[1] <== totalNew - k_new.remainder;
    getNewSwapRem.cond <== k_new.remainder;

    newSharePriceK <== getNewSharePriceK.out;
    newSwapRem <== getNewSwapRem.out;
}

template Swap() {
    var MaxStep = 6;
    var IndexOffset = 0;
    var LeaveStartOffset = 61;
    var Token0Offset = LeaveStartOffset;
    var Token1Offset = LeaveStartOffset + 1;
    var Token0LiqOffset = LeaveStartOffset + 2;
    var Token1LiqOffset = LeaveStartOffset + 3;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal input signer;
    signal input signed;
    signal output newDataPath[MaxStep][MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(13);
    var andmanyOffset = 0;

    var nonce = args[1];
    var account = args[2];
    var pool = args[3];
    var reverse = args[4];
    var amount = args[5];

    // circuits: check accountIndex < 2 ^ 20
    component rangecheck0 = Check2PowerRangeFE(20);
    rangecheck0.in <== account;
    andmany.in[andmanyOffset] <== rangecheck0.out;
    andmanyOffset++;

    // circuits: check poolIndex < 2 ^ 10
    component rangecheck1 = Check2PowerRangeFE(10);
    rangecheck1.in <== pool;
    andmany.in[andmanyOffset] <== rangecheck1.out;
    andmanyOffset++;

    // circuits: check amount != 0
    component amountIsZero = IsZero();
    amountIsZero.in <== amount;
    andmany.in[andmanyOffset] <== 1 - amountIsZero.out;
    andmanyOffset++;

    // circuits: check amount < 2 ^ 99
    component rangecheck3 = Check2PowerRangeFE(99);
    rangecheck3.in <== amount;
    andmany.in[andmanyOffset] <== rangecheck3.out;
    andmanyOffset++;

    // circuits: normalize reverse (!!reverse)
    component iszero = IsZero();
    iszero.in <== reverse;
    reverse = 1 - iszero.out;

    // circuits: check signer is account
    component signerEq = IsEqual();
    signerEq.in[0] <== signer;
    signerEq.in[1] <== account;
    andmany.in[andmanyOffset] <== signerEq.out;
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
    component perm = CheckPermission(0);
    perm.caller <== checkNonce.caller;
    andmany.in[andmanyOffset] <== perm.out;
    andmanyOffset++;

    andmany.in[andmanyOffset] <== signed;
    andmanyOffset++;

    // STEP2: udpate liq
    component checkLiq = CheckAndUpdateSwapLiqFE();
    checkLiq.pool <== pool;
    checkLiq.amount <== amount;
    checkLiq.reverse <== reverse;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        checkLiq.dataPath[i] <== dataPath[1][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[1][i] <== checkLiq.newDataPath[i];
    }
    andmany.in[andmanyOffset] <== checkLiq.out;
    andmanyOffset++;

    // STEP3: udpate balance0
    component balance0Index = CheckBalanceIndex();
    balance0Index.account <== account;
    balance0Index.token <== dataPath[1][Token0Offset];
    balance0Index.index <== dataPath[2][IndexOffset];
    andmany.in[andmanyOffset] <== balance0Index.out;
    andmanyOffset++;

    component change0 = ChangeValueFromTreePath();
    // reverse: 0 -> diff == -amount, 1 -> diff == resultAmount
    component getDiff0 = BiSelect();
    getDiff0.in[0] <== -amount;
    getDiff0.in[1] <== checkLiq.resultAmount;
    getDiff0.cond <== reverse;
    change0.diff <== getDiff0.out;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        change0.treeData[i] <== dataPath[2][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[2][i] <== change0.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== change0.out;
    andmanyOffset++;

    // STEP4: udpate balance1
    component balance1Index = CheckBalanceIndex();
    balance1Index.account <== account;
    balance1Index.token <== dataPath[1][Token1Offset];
    balance1Index.index <== dataPath[3][IndexOffset];
    andmany.in[andmanyOffset] <== balance1Index.out;
    andmanyOffset++;

    component change1 = ChangeValueFromTreePath();
    // reverse: 0 -> diff == checkLiq.resultAmount, 1 -> diff == -amount
    component getDiff1 = BiSelect();
    getDiff1.in[0] <== checkLiq.resultAmount;
    getDiff1.in[1] <== -amount;
    getDiff1.cond <== reverse;
    change1.diff <== getDiff1.out;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        change1.treeData[i] <== dataPath[3][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[3][i] <== change1.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== change1.out;
    andmanyOffset++;

    for (var i = 4; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }
    
    out <== andmany.out;
}

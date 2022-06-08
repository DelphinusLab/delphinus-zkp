pragma circom 2.0.2;

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

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

    component andmany = AndMany(14);
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

    // circuits: check amount < 2 ^ 125
    component rangecheck3 = Check2PowerRangeFE(125);
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

    // STEP5: update SharePriceK and SwapRem
    component updateKandRem = UpdateSharePriceKandSwapRem();
    updateKandRem.token0liq <== dataPath[1][Token0LiqOffset];
    updateKandRem.token1liq <== dataPath[1][Token1LiqOffset];
    updateKandRem.amount <== amount;
    updateKandRem.amountOut <== checkLiq.resultAmount;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        updateKandRem.dataPath[i] <== dataPath[4][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[4][i] <== updateKandRem.newDataPath[i];
    }
    andmany.in[andmanyOffset] <== updateKandRem.out;
    andmanyOffset++;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[5][i] <== dataPath[5][i];
    }
    out <== andmany.out;
}

pragma circom 2.0.2;

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

template Retrieve() {
    var MaxStep = 6;
    var IndexOffset = 0;
    var LeaveStartOffset = 61;
    var Token0Offset = LeaveStartOffset;
    var Token1Offset = LeaveStartOffset + 1;
    var Token0LiqOffset = LeaveStartOffset + 2;
    var Token1LiqOffset = LeaveStartOffset + 3;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;
    var precisionFactor = 10 ** 15;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal input signer;
    signal input signed;
    signal output newDataPath[MaxStep][MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(20);
    var andmanyOffset = 0;

    var nonce = args[1];
    var account = args[2];
    var pool = args[3];
    var amount0 = args[4];
    var allowedMinAmount1 = args[5];

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

    // circuits: check amount0 < 2 ^ 99
    component rangecheck2 = Check2PowerRangeFE(99);
    rangecheck2.in <== amount0;
    andmany.in[andmanyOffset] <== rangecheck2.out;
    andmanyOffset++;

    // circuits: check allowedMinAmount1 < 2 ^ 99
    component rangecheck3 = Check2PowerRangeFE(99);
    rangecheck3.in <== allowedMinAmount1;
    andmany.in[andmanyOffset] <== rangecheck3.out;
    andmanyOffset++;

    // calc y_delta: rounding down result
    component YDelta = CalcTokenAmountY();
    YDelta.amountX <== amount0;
    YDelta.poolX <== dataPath[1][Token0LiqOffset];
    YDelta.poolY <== dataPath[1][Token1LiqOffset];
    andmany.in[andmanyOffset] <== YDelta.out;
    andmanyOffset++;

    //check x * pool.Y - y * pool.X >= 0
    component amount1Check = GreaterEqThanFE(250);
    amount1Check.in[0] <== amount0 * dataPath[1][Token1LiqOffset];
    amount1Check.in[1] <== allowedMinAmount1 * dataPath[1][Token0LiqOffset];
    andmany.in[andmanyOffset] <== amount1Check.out;
    andmanyOffset++;

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
    component checkLiq = CheckAndUpdateLiqFE(1);
    checkLiq.pool <== pool;
    checkLiq.amount0 <== amount0;
    checkLiq.amount1 <== YDelta.result;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        checkLiq.dataPath[i] <== dataPath[1][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[1][i] <== checkLiq.newDataPath[i];
    }
    andmany.in[andmanyOffset] <== checkLiq.out;
    andmanyOffset++;

    // STEP3: udpate user's share
    component shareIndex = CheckShareIndex();
    shareIndex.account <== account;
    shareIndex.pool <== pool;
    shareIndex.index <== dataPath[2][IndexOffset];
    andmany.in[andmanyOffset] <== shareIndex.out;
    andmanyOffset++;

    var token0Liq = dataPath[1][Token0LiqOffset];
    
    // share_delta = x * pool.share / pool.x
    component deltaShare = Divide();
    deltaShare.numerator <== amount0 * dataPath[5][LeaveStartOffset];
    deltaShare.denominator <== token0Liq;
    andmany.in[andmanyOffset] <== deltaShare.out;
    andmanyOffset++;

    // if (share_rem > 0) : share_delta += 1
    component shareDiff = BiSelect();
    shareDiff.cond <== deltaShare.remainder;
    shareDiff.in[0] <== deltaShare.result;
    shareDiff.in[1] <== deltaShare.result + 1;

    // check shareDiff <= user.share
    component getUserShare = GetValueFromTreePath();
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        getUserShare.treeData[i] <== dataPath[2][i];
    }
    var userShare = getUserShare.out;
    component shareAmountCheck = LessThanFE(250);
    shareAmountCheck.in[0] <== shareDiff.out;
    shareAmountCheck.in[1] <== userShare + 1;
    andmany.in[andmanyOffset] <== shareAmountCheck.out;
    andmanyOffset++;

    component shareDiffRange = Check2PowerRangeFE(250);
    shareDiffRange.in <== shareDiff.out;
    andmany.in[andmanyOffset] <== shareDiffRange.out;
    andmanyOffset++;

    component shareChange = ChangeValueFromTreePath();
    shareChange.diff <== -shareDiff.out;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        shareChange.treeData[i] <== dataPath[2][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[2][i] <== shareChange.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== shareChange.out;
    andmanyOffset++;

    // STEP4: udpate balance0
    component balance0Index = CheckBalanceIndex();
    balance0Index.account <== account;
    balance0Index.token <== dataPath[1][Token0Offset];
    balance0Index.index <== dataPath[3][IndexOffset];
    andmany.in[andmanyOffset] <== balance0Index.out;
    andmanyOffset++;

    component change0 = ChangeValueFromTreePath();
    change0.diff <== amount0;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        change0.treeData[i] <== dataPath[3][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[3][i] <== change0.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== change0.out;
    andmanyOffset++;

    // STEP5: udpate balance1
    component balance1Index = CheckBalanceIndex();
    balance1Index.account <== account;
    balance1Index.token <== dataPath[1][Token1Offset];
    balance1Index.index <== dataPath[4][IndexOffset];
    andmany.in[andmanyOffset] <== balance1Index.out;
    andmanyOffset++;

    component change1 = ChangeValueFromTreePath();
    change1.diff <== YDelta.result;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        change1.treeData[i] <== dataPath[4][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[4][i] <== change1.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== change1.out;
    andmanyOffset++;

    // STEP6: update pool's total share
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if (i == LeaveStartOffset) {
            newDataPath[5][i] <== dataPath[5][i] - shareDiff.out;
        } else {
            newDataPath[5][i] <== dataPath[5][i];
        }
    }
    
    out <== andmany.out;
}

pragma circom 2.0.2;

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

template Swap() {
    var MaxStep = 5;
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

    component andmany = AndMany(18);
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

    // circuits: check amount < 2 ^ 250
    component rangecheck3 = Check2PowerRangeFE(250);
    rangecheck3.in <== amount;
    andmany.in[andmanyOffset] <== rangecheck3.out;
    andmanyOffset++;

    // circuits: normalize reverse (!!reverse)
    component iszero = IsZero();
    iszero.in <== reverse;
    reverse = 1 - iszero.out;

    // similar to supply
    signal amount0;
    amount0 <== (1 - 2 * reverse) * amount; // reverse: 0 -> amount, 1 -> -amount;
    signal amount1;
    amount1 <== (2 * reverse - 1) * amount; // reverse: 0 -> -amount, 1 -> amount;

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
    component poolIndex = CheckPoolInfoIndexFE();
    poolIndex.pool <== pool;
    poolIndex.index <== dataPath[1][IndexOffset];
    andmany.in[andmanyOffset] <== poolIndex.out;
    andmanyOffset++;

    var token0 = dataPath[1][Token0Offset];
    var token1 = dataPath[1][Token1Offset];
    var token0liq = dataPath[1][Token0LiqOffset];
    var token1liq = dataPath[1][Token1LiqOffset];
    var newtoken0liq = token0liq + amount0;
    var newtoken1liq = token1liq + amount1;
    component token0check = Check2PowerRangeFE(10);
    token0check.in <== token0;
    andmany.in[andmanyOffset] <== token0check.out;
    andmanyOffset++;
    component token1check = Check2PowerRangeFE(10);
    token1check.in <== token1;
    andmany.in[andmanyOffset] <== token1check.out;
    andmanyOffset++;
    component token0liqcheck = Check2PowerRangeFE(250);
    token0liqcheck.in <== token0liq;
    andmany.in[andmanyOffset] <== token0liqcheck.out;
    andmanyOffset++;
    component token1lliqcheck = Check2PowerRangeFE(250);
    token1lliqcheck.in <== token1liq;
    andmany.in[andmanyOffset] <== token1lliqcheck.out;
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
            newDataPath[1][i] <== newtoken0liq;
        } else if (i == Token1LiqOffset) {
            newDataPath[1][i] <== newtoken1liq;
        } else {
            newDataPath[1][i] <== dataPath[1][i];
        }
    }

    // STEP4: udpate balance0
    component balance0Index = CheckBalanceIndex();
    balance0Index.account <== account;
    balance0Index.token <== token0;
    balance0Index.index <== dataPath[2][IndexOffset];
    andmany.in[andmanyOffset] <== balance0Index.out;
    andmanyOffset++;

    component change0 = ChangeValueFromTreePath();
    change0.diff <== -amount0;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        change0.treeData[i] <== dataPath[2][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[2][i] <== change0.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== change0.out;
    andmanyOffset++;

    // STEP5: udpate balance1
    component balance1Index = CheckBalanceIndex();
    balance1Index.account <== account;
    balance1Index.token <== token1;
    balance1Index.index <== dataPath[3][IndexOffset];
    andmany.in[andmanyOffset] <== balance1Index.out;
    andmanyOffset++;

    component change1 = ChangeValueFromTreePath();
    change1.diff <== -amount1;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        change1.treeData[i] <== dataPath[3][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[3][i] <== change1.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== change1.out;
    andmanyOffset++;

    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[4][i] <== dataPath[4][i];
    }

    out <== andmany.out;
}

pragma circom 2.0.2;

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

template Deposit() {
    var MaxStep = 6;
    var IndexOffset = 0;
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
    var account = args[2];
    var token = args[3];
    var amount = args[4];

    // circuits: check accountIndex < 2 ^ 20
    component rangecheck0 = Check2PowerRangeFE(20);
    rangecheck0.in <== account;
    andmany.in[andmanyOffset] <== rangecheck0.out;
    andmanyOffset++;

    // circuits: check tokenIndex < 2 ^ 10
    component rangecheck1 = Check2PowerRangeFE(10);
    rangecheck1.in <== token;
    andmany.in[andmanyOffset] <== rangecheck1.out;
    andmanyOffset++;

    // circuits: check amount < 2 ^ 250
    component rangecheck2 = Check2PowerRangeFE(250);
    rangecheck2.in <== amount;
    andmany.in[andmanyOffset] <== rangecheck2.out;
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

    // STEP2: udpate balance
    component balanceIndex = CheckBalanceIndex();
    balanceIndex.account <== account;
    balanceIndex.token <== token;
    balanceIndex.index <== dataPath[1][IndexOffset];
    andmany.in[andmanyOffset] <== balanceIndex.out;
    andmanyOffset++;

    component change = ChangeValueFromTreePath();
    change.diff <== amount;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        change.treeData[i] <== dataPath[1][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[1][i] <== change.newTreeData[i];
    }
    andmany.in[andmanyOffset] <== change.out;
    andmanyOffset++;

    for (var i = 2; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

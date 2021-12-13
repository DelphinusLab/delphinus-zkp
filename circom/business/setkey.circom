pragma circom 2.0.2;

include "../utils/bit.circom";
include "../utils/swap_aux.circom";

template SetKey() {
    var MaxStep = 5;
    var LeafStartOffset = 61;
    var AxOffset = LeafStartOffset + 0;
    var AyOffset = LeafStartOffset + 1;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal input signer;
    signal input signed;
    signal output newDataPath[MaxStep][MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(4);
    var andmanyOffset = 0;

    var nonce = args[1];
    var account = args[2];
    var ax = args[4];
    var ay = args[5];

    // circuits: check accountIndex < 2 ^ 20
    component rangecheck0 = Check2PowerRangeFE(20);
    rangecheck0.in <== account;
    andmany.in[andmanyOffset] <== rangecheck0.out;
    andmanyOffset++;

    // circuits: check (x, y) is a valid point
    component pointCheck = PointCheck();
    pointCheck.x <== ax;
    pointCheck.y <== ay;
    andmany.in[andmanyOffset] <== pointCheck.out;
    andmanyOffset++;

    // STEP1: init nonce and key
    component checkNonce = CheckAndUpdateNonceFE();
    checkNonce.nonce <== nonce;
    checkNonce.caller <== account;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        checkNonce.dataPath[i] <== dataPath[0][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        if (i == AxOffset) {
            newDataPath[0][i] <== ax;
        } else if (i == AyOffset) {
            newDataPath[0][i] <== ay;
        } else {
            newDataPath[0][i] <== checkNonce.newDataPath[i];
        }
    }
    andmany.in[andmanyOffset] <== checkNonce.out;
    andmanyOffset++;

    // circuits: check caller permission and signer
    component perm = CheckPermission(0);
    perm.caller <== checkNonce.caller;
    andmany.in[andmanyOffset] <== perm.out;
    andmanyOffset++;

    for (var i = 1; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

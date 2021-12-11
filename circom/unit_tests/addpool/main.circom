pragma circom 2.0.2;

include "../../business/addpool.circom";
include "../../utils/merkle_tree.circom";

template TestAddPool() {
    var MaxStep = 5;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];

    component c =  AddPool();
    for (var i = 0; i < CommandArgs; i++) {
        c.args[i] <== args[i];
    }
    for (var i = 0; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            c.dataPath[i][j] <== dataPath[i][j];
        }
    }

    c.out === 1;

    component root[MaxStep - 1];
    for (var i = 0; i < MaxStep - 1; i++) {
        root[i] = CheckTreeRootHash(1);
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            root[i].treeData[j] <== c.newDataPath[i][j];
        }
        root[i].newRootHash === dataPath[i + 1][MaxTreeDataIndex - 1];
    }
}

component main = TestAddPool();

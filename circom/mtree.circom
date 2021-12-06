pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./utils/select.circom";

/*
    Input: treeData: field[66]
        0: index (field store information about path of 15 levels m-tree oldNodes, 2 bits for each level)
        1 - 60: path digests (hash values before applying new leaf values, 4 fields for each m-tree level, 15 level total)
        61 - 64: new leaf values
        65 - new root hash (Root hash value which had applied new leaf values)

    What template do:
        1. check all inputs of 15 levels old m-tree hashes are valid.
        2. check input new root hash is correct.

*/
template CheckTreeRootHash(update) {
    var MaxTreeDataIndex = 66;
    var PathLevel = 16;
    var NodesPerLevel = 4;
    var BitsPerLevel = 2;
    var PathIndexStart = 1;

    signal input treeData[MaxTreeDataIndex];
    signal indexBits[PathLevel * BitsPerLevel];
    signal output newRootHash;

    /* Use var to make the code clear. */
    var index = treeData[0];
    var root = treeData[65];
    var oldNodes[PathLevel][NodesPerLevel]; // direction: from leaves to the root.
    var newNodes[PathLevel][NodesPerLevel]; // direction: from leaves to the root.

    {
        /* Because we calculate the hash from leaves, we reverse the path. */
        var offset = PathIndexStart;
        for (var i = PathLevel - 1; i >= 0; i--) {
            for (var j = 0; j < NodesPerLevel; j++) {
                oldNodes[i][j] = treeData[offset];
                offset++;
            }
        }
    }

    /* Calculate the selector, use var to reduce constraints. */
    // TODO: replace it with Num2Bits.
    var selector[PathLevel];
    {
        var offset = 0;
        var carry = 0;
        for (var i = 0; i < PathLevel; i++) {
            selector[i] = 0;
            for (var j = 0; j < BitsPerLevel; j++) {
                indexBits[offset] <-- (index >> offset) & 1;
                carry += indexBits[offset] * (1 << offset);
                selector[i] += indexBits[offset] * (1 << j);
                offset++;
            }
        }

        carry === index;
    }

    component hash[PathLevel];
    component selcond[(PathLevel - 1) * NodesPerLevel];

    for (var i = 0; i < PathLevel; i++) {
        hash[i] = Poseidon(4);
    }

    for (var i = 0; i < (PathLevel - 1) * NodesPerLevel; i++) {
        selcond[i] = BiSelect();
    }

    var offset = 0;
    for (var i = 0; i < PathLevel; i++) {
        for (var j = 0; j < NodesPerLevel; j++) {
            if (i == 0) {
                // We skip the selector on leaves.
                newNodes[i][j] = oldNodes[i][j];
            } else {
                selcond[offset].in[0] <== hash[i - 1].out;
                selcond[offset].in[1] <== oldNodes[i][j];
                selcond[offset].cond <== j - selector[i];
                newNodes[i][j] = selcond[offset].out;
                offset++;

                if (update == 0) {
                    oldNodes[i][j] === newNodes[i][j];
                }
            }
            hash[i].inputs[j] <== newNodes[i][j];
        }
    }

    newRootHash <== hash[PathLevel - 1].out;

    if (update == 0) {
        newRootHash === root;
    }
}

component main = CheckTreeRootHash(0);

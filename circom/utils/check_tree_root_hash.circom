pragma circom 2.0.0;

/*
    Input: 
        treeData: field[66]
            0: index 
                The format of index is: 
                    The last (most right side) 2 bits of index means the path of leaves so it is useless.
                    The 3rd, 4th bits from right side means the path of level which just above leaves, and so on.
            1 - 60: path digests (hash values before applying new leaf values, 4 fields for each m-tree level, 15 level total)
            61 - 64: leaf values
            65 - root hash

        update: 
            0: leaf values are not changed.
            1: leaf values had been changed.
    
    Output: root has after re-calculation.

    What template do:
        1. if update is 0, it will check the input m-tree hashes on the path are valid and root hash is valid.
        2. if update is not 0, it will calculate the new m-tree root hash based on input new leaf values and output.

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

    /*
    Direction: from leaves to the root.
    Example:
        oldNodes[0][0] - oldNodes[0][3] are the four leaves.
        oldNodes[1][0] - oldNodes[1][3] are the m-tree level which just above leaves
        ...
        oldNodes[15][0] - oldNodes[15][0] are the m-tree level just under root hash
    */
    var oldNodes[PathLevel][NodesPerLevel]; 
    var newNodes[PathLevel][NodesPerLevel]; 
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

    /* 
        The format of index (treeData[0]) is: 
            The last (most right side) 2 bits of index refers to the path of leaves so it is useless.
            The 4th, 3rd bits from right side means the path of level which just above leaves, and so on.
    */
    // Calculate the selector, use var to reduce constraints. 
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

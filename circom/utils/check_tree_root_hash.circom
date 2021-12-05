pragma circom 2.0.0;

/*
    Input: treeData: field[66]
        0: index (field store information about path of 15 levels m-tree nodes, 2 bits for each level)
        1 - 60: path digests (hash values before applying new leaf values, 4 fields for each m-tree level, 15 level total)
        61 - 64: new leaf values
        65 - new root hash (Root hash value which had applied new leaf values)

    What template do:
        1. check all inputs of 15 levels old m-tree hashes are valid.
        2. check input new root hash is correct.

*/
template CheckTreeRootHash() {
    var MaxTreeDataIndex = 66;
    var PathLevel = 15;
    var PathIndexStart = 1;

    signal selector[PathLevel];
    signal cs[PathLevel];
    signal cs2[PathLevel];

    signal input treeData[MaxTreeDataIndex];
    //signal verifyTreeData[MaxTreeDataIndex];
    signal newTreeData[MaxTreeDataIndex];

    // TODO: calculate the root hash, and constraint the result to the root hash

     /* We using 2bit for each selector thus we decompose the path into path
     * selectors. Moreover we make sure that each selector are within the range of
     * [0,1,2,3]
     */
    var verifyPath = 0;
    var carry = 1;

    // hash for verifying old merkley tree hash
    //component hash[PathLevel + 1] = Poseidon(4);

    // hash for verifying new merkley tree hash
    component new_hash[PathLevel + 1];
    for (var i=0; i<= PathLevel; i++) {
        new_hash[i] = Poseidon(4);
    }

    component selcond[PathLevel * 4];
    for (var i=0; i< PathLevel * 4; i++) {
        selcond[i] = BiSelect();
    }

    for (var i=0; i<PathLevel; i++) {
        selector[i] <-- (treeData[0] >> (i * 2)) & 3; // [0, 3]
        cs[i] <== selector[i] * (selector[i] - 1);
        cs2[i] <== (selector[i] - 2) * (selector[i] - 3);
        cs2[i] * cs[i] === 0;

        verifyPath += selector[i] * carry;
        carry *= 4;
    }
    verifyPath === treeData[0];

    new_hash[0].inputs[0] <== treeData[61];
    new_hash[0].inputs[1] <== treeData[62];
    new_hash[0].inputs[2] <== treeData[63];
    new_hash[0].inputs[3] <== treeData[64];
    // Generate new m-tree has values

    for (var level = 0; level < PathLevel; level++) {
        for(var i = 0; i < 4; i++) {
            var idx = level*4 + i;
            selcond[idx].in[0] <== treeData[idx + PathIndexStart];
            selcond[idx].in[1] <== new_hash[level].out;
            selcond[idx].cond <== i - selector[i];
            newTreeData[idx + PathIndexStart] <== selcond[idx].out;
            new_hash[level+1].inputs[i] <== newTreeData[idx + PathIndexStart];
        }
    }

    // Verfiy New Root
    new_hash[PathLevel].out === treeData[65];
}

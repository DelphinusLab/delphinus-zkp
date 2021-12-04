pragma circom 2.0.0;
// TreeData: field[66], 0: index, 1 - 60: path digests, 61 - 64: leaf value, 65 - root hash
// Command: field[6], 0: op, 1: nonce, 2 - 3: 32bits args, 4 - 5: 252 bits args

include "../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "utils/command.circom";
include "utils/bit.circom";
include "utils/select.circom";


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

    // Verify input m-tree path hash values are valid.
    // We assuming level 0 is the lowest level which just above leaf values, level 14 is the highest level which just under root hash
    // and select[i] is the level i path. (which indicate treeData[0]'s last 2 bits are for level 0 path, etc)
    /*
    for (var level = 1; level < PathLevel; level++) {
        treeData[level*4 + selector[level] + PathIndexStart] === HASH(treeData[(level - 1) * 4 + PathIndexStart], treeData[(level - 1) * 4 + 1 + PathIndexStart], treeData[(level - 1) * 4 + 2 + PathIndexStart], treeData[(level - 1) * 4 + 3 + PathIndexStart]);
    }
    */

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

template CheckSign() {
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input startRootHash;
    signal input sign[3];
    signal input keyPath[MaxTreeDataIndex];
    signal input commands[CommandArgs];

    // TODO:
    // The keyPath's is a path of the merkle tree that store the public key of account index,
    // 1. check the keyPath's validation
    // 2. check the public key's validation
    // 3. check the path index's validation
    // 4. check the sign
}

template RunCommand() {
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;
    var MaxStep = 5;

    signal input startRootHash;
    signal input commands[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal output endRootHash;

    // Check the merkle tree path is valid
    component checkTreeRootHashComp[5];
    for (var i = 0; i < MaxStep; i++) {
      checkTreeRootHashComp[i] = CheckTreeRootHash();
      for (var j = 0; j < MaxTreeDataIndex; j++) {
        checkTreeRootHashComp[i].treeData[j] <== dataPath[i][j];
      }
    }

    // TODO:
    // 1. dispatch the command, each command return it's merkle-tree's modification path
}

template CheckCommandsRun(N) {
    var RootHashIndex = 65;
    var MaxTreeDataIndex = 66;
    var MaxStep = 5;
    var CommandArgs = 6;

    signal input commandHash[2];
    signal input startRootHash;
    signal input sign[N][3];
    signal input commands[N][CommandArgs];
    signal input dataPath[N][MaxStep][MaxTreeDataIndex];
    signal input keyPath[N][MaxTreeDataIndex];
    signal input endRootHash;

    /* Check command hash */
    component checkCommandHashComp;
    checkCommandHashComp = CheckCommandHash(N);
    checkCommandHashComp.commandHash[0] <== commandHash[0];
    checkCommandHashComp.commandHash[1] <== commandHash[1];

    for (var i = 0; i < N; i++) {
        for (var j = 0; j < CommandArgs; j++) {
            checkCommandHashComp.commands[i][j] <== commands[i][j];
        }
    }

    /* Check sign */
    component checkSignComp[N];
    for (var i = 0; i < N; i++) {
        checkSignComp[i] = CheckSign();
        for (var j = 0; j < CommandArgs; j++) {
            checkSignComp[i].commands[j] <== commands[i][j];
        }
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            checkSignComp[i].keyPath[j] <== keyPath[i][j];
        }
        for (var j = 0; j < 3; j++) {
            checkSignComp[i].sign[j] <== sign[i][j];
        }

        /* constrain root hash */
        keyPath[i][RootHashIndex] === dataPath[i][0][RootHashIndex];
    }

    /* Check run */
    component runCommandComp[N];
    for (var i = 0; i < N; i++) {
        runCommandComp[i] = RunCommand();
        runCommandComp[i].startRootHash <== startRootHash;
        for (var j = 0; j < MaxStep; j++) {
            for (var k = 0; k < MaxTreeDataIndex; k++) {
                runCommandComp[i].dataPath[j][k] <== dataPath[i][j][k];
            }
        }
        for (var j = 0; j < CommandArgs; j++) {
            runCommandComp[i].commands[j] <== commands[i][j];
        }
    }

    /* Check that command's end root hash equals to next command's start root hash */
    dataPath[0][0][RootHashIndex] === startRootHash;
    for (var i = 0; i < N - 1; i++) {
        runCommandComp[i].endRootHash === dataPath[i + 1][0][RootHashIndex];
    }
    runCommandComp[N - 1].endRootHash === endRootHash;
}

component main {public [commandHash, startRootHash, endRootHash]}= CheckCommandsRun(1);

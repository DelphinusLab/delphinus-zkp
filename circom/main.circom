pragma circom 2.0.0;
// TreeData: field[66], 0: index, 1 - 60: path digests, 61 - 64: leaf value, 65 - root hash
// Command: field[6], 0: op, 1: nonce, 2 - 3: 32bits args, 4 - 5: 252 bits args

include "../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "utils/command.circom";
include "utils/bit.circom";
include "utils/select.circom";
include "utils/check_tree_root_hash.circom";

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

template CheckArgRange(N) {
    signal input in;
    signal output out;

    // TODO: use bit2num to limit the range

    out <== 1;
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
      checkTreeRootHashComp[i] = CheckTreeRootHash(0);
      for (var j = 0; j < MaxTreeDataIndex; j++) {
        checkTreeRootHashComp[i].treeData[j] <== dataPath[i][j];
      }
    }

    component checkArgRange[2];
    checkArgRange[0] = CheckArgRange(32);
    checkArgRange[1] = CheckArgRange(32);
    checkArgRange[0].in <== commands[5];
    checkArgRange[1].in <== commands[6];

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

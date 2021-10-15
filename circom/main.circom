// TreeData: field[50], 0: index, 1 - 45: path digests, 45 - 48: leaf value, 49 - root hash
// Command: field[6], 0: op, 1: nonce, 2 - 3: 32bits args, 4 - 5: 252 bits args

template CheckCommandHash(N) {
    signal input commands[6 * N];
    signal input commandHashLow;
    signal input commandHashHigh;
    
    // TODO: hash all commands, and constraint the result to the input hash
}

template CheckTreeRootHash() {
    signal input treeData[5 * 50];

    // TODO: calculate the root hash, and constraint the result to the root hash
}

template CheckSign() {
    signal input startRootHash;
    signal input sign[3];
    signal input keyData[50];
    signal input commands[6];
    
    // TODO:
    // The keyData's is a path of the merkle tree that store the public key of account index,
    // 1. check the keyData's validation
    // 2. check the public key's validation
    // 3. check the path index's validation
    // 4. check the sign
}

template RunCommand() {
    signal input startRootHash;
    signal input commands[6];
    signal input treeData[5 * 50];
    signal output endRootHash;
    
    // Check the merkle tree path is valid
    component checkTreeRootHashComp[5]
    for (var i = 0; i < 5; i++) {
      checkTreeRootHashComp[i] <== CheckTreeRootHash();
      for (var j = 0; j < 50; j++) {
        checkTreeRootHashComp[i].treeData[j] <== treeData[j];
      }
    }

    // TODO:
    // 1. dispatch the command, each command return it's merkle-tree's modification path
}

template CheckCommandsRun(N) {
    signal input commandHashLow;
    signal input commandHashHigh;
    signal input startRootHash;
    signal input endRootHash;
    signal input sign[3 * N];
    signal input keyData[50 * N];
    signal input commands[6 * N];
    signal input treeData[N * 5 * 50];
    signal output ret;

    /* Check command hash */
    component checkCommandHashComp <== CheckCommandHash(N);
    checkCommandHashComp.commandHashLow <== commandHashLow;
    checkCommandHashComp.commandHashHigh <== commandHashHigh;
    for (var i = 0; i < 5 * N; i++) {
        checkCommandHashComp.commands[i] <== commands[i];
    }

    /* Check sign */
    component checkSignComp[N];
    for (var i = 0; i < N; i++) {
        checkSignComp[i] = CheckSign();
        for (var j = 0; j < 6; j++) {
            checkSignComp[i].commands[j] <== commands[i * 6 + j]
        }
        for (var j = 0; j < 50; j++) {
            checkSignComp[i].keyData[j] <== keyData[i * 50 + j]
        }
        for (var j = 0; j < 3; j++) {
            checkSignComp[i].sign[j] <== sign[i * 3 + j]
        }
    }

    /* Check run */
    component runCommandComp[N];
    for (var i = 0; i < N; i++) {
        runCommandComp[i] = RunCommand();
        runCommandComp[i].startRootHash <== startRootHash;
        for (var j = 0; j < 5 * 50; j++) {
            runCommandComp[i].treeData[j] <== treeData[i * 50 * 5 + j];
        }
        for (var j = 0; j < 6; j++) {
            runCommandComp[i].commands[j] <== commands[i * 6 + j];
        }
    }

    treeData[49] === startRootHash;
    for (var i = 0; i < N - 1; i++) {
        runCommandComp[i].endRootHash === treeData[(i + i) * 50 * 5 + 49];
    }
    runCommandComp[N - 1].endRootHash === endRootHash;
}

component main = CheckCommandsRun(1);
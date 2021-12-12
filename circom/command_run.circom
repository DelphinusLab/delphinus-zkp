pragma circom 2.0.0;
// TreeData: field[66], 0: index, 1 - 60: path digests, 61 - 64: leaf value, 65 - root hash
// Command: field[6], 0: op, 1: nonce, 2 - 3: 32bits args, 4 - 5: 252 bits args

include "../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "business/addpool.circom";
include "utils/merkle_tree.circom";
include "utils/select.circom";
include "utils/command_hash.circom";
include "utils/command_sign.circom";

template AssertArgRange(N) {
    signal input in;

    component c = Num2Bits(N);
    c.in <== in;
}

template RunCommand() {
    var RootHashIndex = 65;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;
    var MaxStep = 5;
    var NCOMMANDS = 7;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal input signer;
    signal input signed;
    signal output endRootHash;

    // 1. Check all merkle tree path
    component checkTreeRootHashComp[MaxStep];
    for (var i = 0; i < MaxStep; i++) {
      checkTreeRootHashComp[i] = CheckTreeRootHash(0);
      for (var j = 0; j < MaxTreeDataIndex; j++) {
        checkTreeRootHashComp[i].treeData[j] <== dataPath[i][j];
      }
    }

    // 2. Check args range
    component checkArgRange[3];
    checkArgRange[0] = AssertArgRange(64);
    checkArgRange[1] = AssertArgRange(32);
    checkArgRange[2] = AssertArgRange(32);
    checkArgRange[0].in <== args[1];
    checkArgRange[1].in <== args[2];
    checkArgRange[2].in <== args[3];

    signal newDataPath[MaxStep][MaxTreeDataIndex];

    // 3. Dispatch to command
    component commands[NCOMMANDS];
    component outSelect;
    component newDataPathSelect[MaxStep][MaxTreeDataIndex];

    outSelect = NSelect(NCOMMANDS);
    outSelect.cond <== args[0];
    for (var i = 0; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPathSelect[i][j] = NSelect(NCOMMANDS);
            newDataPathSelect[i][j].cond <== args[0];
        }
    }

    for (var i = 0; i < NCOMMANDS; i++) {
        commands[i] = AddPool();

        for (var j = 0; j < CommandArgs; j++) {
            commands[i].args[j] <== args[j];
        }

        for (var j = 0; j < MaxStep; j++) {
            for (var k = 0; k < MaxTreeDataIndex; k++) {
                commands[i].dataPath[j][k] <== dataPath[j][k];
            }
        }

        commands[i].signer <== signer;
        commands[i].signed <== signed;

        outSelect.in[i] <== commands[i].out;
        for (var j = 0; j < MaxStep; j++) {
            for (var k = 0; k < MaxTreeDataIndex; k++) {
                newDataPathSelect[j][k].in[i] <== commands[i].newDataPath[j][k];
            }
        }
    }

    outSelect.out === 1;

    // 4. Check all new merkle tree path
    component checkNewTreeRootHashComp[MaxStep];
    for (var i = 0; i < MaxStep; i++) {
      checkNewTreeRootHashComp[i] = CheckTreeRootHash(1);
      for (var j = 0; j < MaxTreeDataIndex; j++) {
        checkNewTreeRootHashComp[i].treeData[j] <== newDataPathSelect[i][j].out;
      }
    }

    // 5. Check root hash chain among steps
    for (var i = 0; i < MaxStep - 1; i++) {
        checkNewTreeRootHashComp[i].newRootHash === dataPath[i + 1][RootHashIndex];
    }
    endRootHash <== checkNewTreeRootHashComp[MaxStep - 1].newRootHash;
}

template CheckCommandsRun(N) {
    var RootHashIndex = 65;
    var MaxTreeDataIndex = 66;
    var MaxStep = 5;
    var CommandArgs = 6;

    signal input commandHash[2];
    signal input sign[N][3];
    signal input args[N][CommandArgs];
    signal input dataPath[N][MaxStep][MaxTreeDataIndex];
    signal input keyPath[N][MaxTreeDataIndex];
    signal input startRootHash;
    signal input endRootHash;

    /* 1. Check command hash */
    component checkCommandHashComp;
    checkCommandHashComp = CheckCommandsHash(N);
    checkCommandHashComp.hash[0] <== commandHash[0];
    checkCommandHashComp.hash[1] <== commandHash[1];

    for (var i = 0; i < N; i++) {
        for (var j = 0; j < CommandArgs; j++) {
            checkCommandHashComp.args[i][j] <== args[i][j];
        }
    }

    component checkSignComp[N];
    component runCommandComp[N];

    for (var i = 0; i < N; i++) {
        /* 2. Check sign */
        checkSignComp[i] = CheckCommandSignFromKeyPath();
        for (var j = 0; j < CommandArgs; j++) {
            checkSignComp[i].args[j] <== args[i][j];
        }
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            checkSignComp[i].keyPath[j] <== keyPath[i][j];
        }
        for (var j = 0; j < 3; j++) {
            checkSignComp[i].sign[j] <== sign[i][j];
        }

        /* 3. Check root hash of key path */
        keyPath[i][RootHashIndex] === dataPath[i][0][RootHashIndex];

        /* 4. Run Command */
        runCommandComp[i] = RunCommand();
        runCommandComp[i].signer <== checkSignComp[i].signer;
        runCommandComp[i].signed <== checkSignComp[i].signed;
        for (var j = 0; j < MaxStep; j++) {
            for (var k = 0; k < MaxTreeDataIndex; k++) {
                runCommandComp[i].dataPath[j][k] <== dataPath[i][j][k];
            }
        }
        for (var j = 0; j < CommandArgs; j++) {
            runCommandComp[i].args[j] <== args[i][j];
        }
    }

    /* 5. Check root hash chain among commands */
    var lastRootHash = startRootHash;
    for (var i = 0; i < N; i++) {
        dataPath[i][0][RootHashIndex] === lastRootHash;
        lastRootHash = runCommandComp[i].endRootHash;
    }
    lastRootHash === endRootHash;
}

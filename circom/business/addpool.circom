pragma circom 2.0.0;
// dataPath: field[66], 0: index, 1 - 60: path digests, 61 - 64: leaf value, 65 - root hash
// commands: field[6], 0: op, 1: nonce, 2 - 3: 32bits args, 4 - 5: 252 bits args

include "./command.circom";
include "../utils/merkle-tree.circom";

template addpool(N) {
    var RootHashIndex = 65;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input commands[N][CommandArgs];
    signal input dataPath[N][MaxTreeDataIndex];
    signal output newTreeData[N][MaxTreeDataIndex];
    signal output succeed_out;
    signal succeed;
    signal in[N][3];
    signal pool[N];
    signal token0[N];
    signal token1[N];
    signal token0Info[N];
    signal token1Info[N];
    signal token0Amount[N];
    signal token1Amount[N];
    
    succeed <== 1; // true
    
    for(var i=0; i<N; i++) {
        pool[i] <-- commands[i][2];
        token0[i] <-- (commands[i][3] >> 0) & 65535;
        token1[i] <-- (commands[i][3] >> 16) & 65535;
        
        for(var j=4; j<CommandArgs; j++) {
          succeed * commands[i][j] === 0;
        }
    }

    // prerequisite: check arguments
    for(var i=0; i<N; i++) {
        assert(token0[i] != token1[i]);
        in[i][0] <-- checkTokenRange(token0[i]);
        succeed * in[i][0] === 1; // true
        in[i][1] <-- checkTokenRange(token1[i]);
        succeed * in[i][1] === 1; // true
    }

    // step 1: check poolinfo and set
    for(var i=0; i<N; i++) {
        in[i][2] <-- checkPoolLeafInfoIndex(dataPath[i], pool[i]);
        succeed * in[i][2] === 1; // true
        
        token0Info[i] <== getPoolToken0Info(dataPath[i]);
        token1Info[i] <== getPoolToken1Info(dataPath[i]);
        token0Amount[i] <== getPoolToken0Amount(dataPath[i]);
        token1Amount[i] <== getPoolToken1Amount(dataPath[i]);

        token0Info[i] === 0;
        token1Info[i] === 0;
    }

    // change leafValues
    component newDataPath[N];
    var arr[N][4];
    for(var i=0; i<N; i++) {
        arr[i] = [token0[i], token1[i], 0, 0];
        newDataPath[i] = setValues();
        for(var j=0; j<MaxTreeDataIndex; j++) {
            newDataPath[i].dataPath[j] <== dataPath[i][j];
        }

        for(var k=0; k<4; k++) {
            newDataPath[i].arr[k] <== arr[i][k];
        }
    }

    // end
    succeed_out <== 1;
    
    for(var i=0; i<N; i++) {
        for(var j=0; j<MaxTreeDataIndex; j++) {
            newTreeData[i][j] <== newDataPath[i].out[j];
        }
    }
}

pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template addPool() {
  signal input args[8];
  signal input root[5];
  signal input index[5][32];
  signal input pathDigests[5][15][4];
  signal input leafValues[5][4];
  signal output succeed_out;
  signal output root_out[5];
  signal output index_out[5][32];
  signal output pathDigests_out[5][15][4];
  signal output leafValues_out[5][4];
  signal succeed;
  signal res;
  signal in[3];
  signal token0Info;
  signal token1Info;
  signal token0Amount;
  signal token1Amount;

  succeed <== 1; // true

  var pool = args[0];
  var token0 = args[1];
  var token1 = args[2];

  var COMMAND_ARGS = 8; 
  for(var i=4; i<COMMAND_ARGS; i++) {
    succeed * args[i] === 0;
  }

  // prerequisite: check arguments
  assert(token0 != token1);
  in[0] <-- checkTokenRange(token0);
  succeed * in[0] === 1; // true
  in[1] <-- checkTokenRange(token1);
  succeed * in[1] === 1; // true

  // step 1: check poolinfo and set
  in[2] <-- checkPoolLeafInfoIndex(index[0], pool);
  succeed * in[2] === 1; // true

  token0Info <== getPoolToken0Info(leafValues[0]);
  token1Info <== getPoolToken1Info(leafValues[0]);
  token0Amount <== getPoolToken0Amount(leafValues[0]);
  token1Amount <== getPoolToken1Amount(leafValues[0]);

  token0Info === 0;
  token1Info === 0;

  var arr[4] = setValues(leafValues[0], [token0, token1, 0, 0]);
  for(var i=0; i<4; i++) {
    leafValues_out[0][i] <== arr[i];
  }

  // end
  succeed_out <== succeed;
  
  for(var i=0; i<5; i++) {
    // root
    root_out[i] <== root[i];

    // index[32]
    for(var k=0; k<32; k++) {
      index_out[i][k] <== index[i][k];
    }

    // pathDigests[15][4]
    for(var l=0; l<15; l++) {
      for(var p=0; p<4; p++) {
        pathDigests_out[i][l][p] <== pathDigests[i][l][p];
      }
    }

    // leafValues[4]
    for(var j=0; j<4; j++) {
      if(i != 0) {
        leafValues_out[i][j] <== leafValues[i][j];
      }
    }
  }
}

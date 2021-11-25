pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template addtoken() {
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

  // true
  succeed <== 1;

  var tokenAddress = args[0];
  var tokenIndex = args[1];

  var COMMAND_ARGS = 8;
  for(var i=2; i<COMMAND_ARGS; i++) {
    succeed * args[i] === 0;
  }

  // prerequisite: check arguments
  res <-- checkTokenRange(tokenIndex);
  succeed * res === 1; // true

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
      leafValues_out[i][j] <== leafValues[i][j];
    }
  }
}

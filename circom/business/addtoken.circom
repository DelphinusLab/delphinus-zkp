pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template addtoken() {
  signal input args[8];
  signal input leafInfos[5][4];
  signal output succeed_out;
  signal output leafInfos_out[5][4];
  
  // true
  var succeed = 1;

  var tokenAddress = args[0];
  var tokenIndex = args[1];

  var COMMAND_ARGS = 8;
  for(var i=2; i<COMMAND_ARGS; i++) {
    if(succeed == 1 && args[i] == 0) {
      succeed = 1; // true
    } else {
      succeed = 0; // false
    }
  } 

  // prerequisite: check arguments
  if(succeed == 1 && checkTokenRange(tokenIndex) == 1) {
    succeed = 1; // false
  } else {
    succeed = 0; // false
  }

  succeed_out <-- succeed;
  // end
  for(var i=0; i<5; i++) {
    for(var j=0; j<4; j++) {
      leafInfos_out[i][j] <== leafInfos[i][j];
    }
  }
}

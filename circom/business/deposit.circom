pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template deposit() {
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
  signal in[2];

  // true
  succeed <== 1;

  var account = args[0];
  var token = args[1];
  var amount = args[2];

  in[0] <-- checkTokenRange(token);
  in[0] * succeed === 1; // true

  var COMMAND_ARGS = 8;
  for(var i=3; i<COMMAND_ARGS; i++) {
    succeed * args[i] === 0;
  }
   
  in[1] <-- checkBalanceLeafInfoIndex(index[0], account, token);
  in[1] * succeed === 1; // true

  var balance = getValue(leafValues[0], index[0]);
  var balanceNew = balance + amount;
  assert(balance < balanceNew);

  var arr[4] = setValue(leafValues[0], index[0], balanceNew);
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

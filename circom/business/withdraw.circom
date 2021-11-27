pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template withdraw() {
  signal input op;
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
  signal in[4];

  // true
  succeed <== 1;

  var account = args[3];
  var token = args[4];
  var amount = args[5];
  // args[6] is for L1 account address
  var nonce = args[7];

  in[0] <-- checkTokenRange(token);
  in[0] * succeed === 1; // true

  // nonce
  in[1] <-- checkNonceLeafInfoIndex(index[0], account);
  in[1] * succeed === 1; // true

  in[2] <-- checkCommandSign(args, leafValues[0], [[op, account], [token, amount], [nonce, 0]], 3);
  in[2] * succeed === 1; // true

  assert(getNonce(leafValues[0]) == nonce);

  var arr1[4] = setNonce(leafValues[0], nonce + 1);
  for(var i=0; i<4; i++) {
    leafValues_out[0][i] <== arr1[i];
  }

  // sub amount
  in[3] <-- checkBalanceLeafInfoIndex(index[1], account, token);
  in[3] * succeed === 1; // true

  var balance = getValue(leafValues[1], index[1]);
  var balanceNew = balance - amount;
  
  assert(balance >= amount);
  
  var arr2[4] = setValue(leafValues[1], index[1], balanceNew);
  for(var i=0; i<4; i++) {
    leafValues_out[1][i] <== arr2[i];
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
      if(i != 0 && i != 1) {
        leafValues_out[i][j] <== leafValues[i][j];
      }
    }
  }
}

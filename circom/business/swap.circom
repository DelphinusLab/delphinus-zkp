pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template swap() {
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
  signal in[7];
  signal arr_in[3][4];

  // true
  succeed <== 1;
  
  var account = args[3];
  var pool = args[4];
  var amount = args[5];
  var direction = args[6];
  var nonce = args[7];

  // nonce
  in[0] <-- checkNonceLeafInfoIndex(index[0], account);
  in[0] * succeed === 1; // true
  
  in[1] <-- checkCommandSign(args, leafValues[0], [[op, account], [pool, amount], [direction, nonce]], 3);
  in[1] * succeed === 1; // true

  assert(getNonce(leafValues[0]) == nonce);
  
  var arr1[4] = setNonce(leafValues[0], nonce + 1);
  for(var i=0; i<4; i++) {
    leafValues_out[0][i] <== arr1[i];
  }

  // change pool data
  in[2] <-- checkPoolLeafInfoIndex(leafValues[1], pool);
  in[2] * succeed === 1; // true

  var token0Info = getPoolToken0Info(leafValues[1]);
  var token1Info = getPoolToken1Info(leafValues[1]);
  var token0Amount = getPoolToken0Amount(leafValues[1]);
  var token1Amount = getPoolToken1Amount(leafValues[1]);

  var  token0AmountNew = token0Amount + amount;
  var  token1AmountNew = token0Amount + amount;
  
  assert(token0Info != 0);
  assert(token1Info != 0);

  if(direction == 0) {
    token0AmountNew = token0Amount + amount;
  } else {
    token0AmountNew = token0Amount - amount;
    assert(token0Amount >= amount);
  }

  if(direction != 0) {
    token1AmountNew = token1Amount + amount;
  } else {
    token1AmountNew = token1Amount - amount;
    assert(token1Amount >= amount);
  }
  var leaves[4] = [token0Info, token1Info, token0AmountNew, token1AmountNew];
  var arr2[4] = setValues(leafValues[1], leaves);
  for(var i=0; i<4; i++) {
    arr_in[0][i] <-- arr2[i];
    leafValues_out[1][i] <== arr_in[0][i];
  }

  // change token0 balance
  in[3] <-- checkBalanceLeafInfoIndex(index[2], account, token0Info);
  in[3] * succeed === 1; // true
  
  in[4] <-- checkTokenRange(token0Info);
  in[4] * succeed === 1; // true
  
  var balance0 = getValue(leafValues[2], index[2]);
  var balance0New;
  if(direction == 0) {
    balance0New = balance0 - amount;
    assert(balance0 >= amount);
  } else {
    balance0New = balance0 + amount;
  }

  var arr3[4] = setValue(leafValues[2], index[2], balance0New);
  for(var i=0; i<4; i++) {
    arr_in[1][i] <-- arr3[i];
    leafValues_out[2][i] <== arr_in[1][i];
  }

  // change token1 balance
  in[5] <-- checkBalanceLeafInfoIndex(index[3], account, token1Info);
  in[5] * succeed === 1; // true
  
  in[6] <-- checkTokenRange(token1Info);
  in[6] * succeed === 1; // true

  var balance1 = getValue(leafValues[3], index[3]);
  var balance1New = balance1 - amount;
  if(direction != 0) {
    balance1New = balance1 - amount;
    assert(balance1 >= amount);
  } else {
    balance1New = balance1 + amount;
  }
  
  var arr4[4] = setValue(leafValues[3], index[3], balance1New);
  for(var i=0; i<4; i++) {
    arr_in[2][i] <-- arr4[i];
    leafValues_out[3][i] <== arr_in[2][i];
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
      if(i == 4) {
        leafValues_out[i][j] <== leafValues[i][j];
      }
    }
  }
}

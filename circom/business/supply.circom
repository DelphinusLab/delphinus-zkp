pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template supply() {
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
  signal in[8];

  // true
  succeed <== 1;

  var account = args[3];
  var pool = args[4];
  var amount0 = args[5];
  var amount1 = args[6];
  var nonce = args[7];

  // nonce
  in[0] <-- checkNonceLeafInfoIndex(index[0], account);
  in[0] * succeed === 1; // true

  in[1] <-- checkCommandSign(args, leafValues[0], [[op, account], [pool, amount0], [amount1, nonce]], 3);
  in[1] * succeed === 1;
  
  assert(getNonce(leafValues[0]) == nonce);
  
  var arr1[4] = setNonce(leafValues[0], nonce+1);
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

  assert(token0Info != 0);
  assert(token1Info != 0);

  var token0AmountNew = token0Amount + amount0;
  assert(token0Amount < token0AmountNew);
  var token1AmountNew = token1Amount + amount1;
  assert(token1Amount < token1AmountNew);

  var leaves[4] = [token0Info, token1Info, token0AmountNew, token1AmountNew];
  var arr2[4] = setValues(leafValues[1], leaves);
  
  for(var i=0; i<4; i++) {
    leafValues_out[1][i] <== arr2[i];
  }

  // change token0 balance
  in[3] <-- checkBalanceLeafInfoIndex(index[2], account, token0Info);
  in[3] * succeed === 1; // true
  
  in[4] <-- checkTokenRange(token0Info);
  in[4] * succeed === 1; // true
  var balance0 = getValue(leafValues[2], index[2]);
  var balance0New = balance0 - amount0;
  assert(balance0 >= amount0);
  
  var arr3[4] = setValue(leafValues[2], index[2], balance0New);
  for(var i=0; i<4; i++) {
    leafValues_out[2][i] <== arr3[i];
  }
    
  // change token1 balance
  in[5] <-- checkBalanceLeafInfoIndex(index[3], account, token1Info);
  in[5] * succeed === 1; // true
  
  in[6] <-- checkTokenRange(token1Info);
  in[6] * succeed === 1; // true
  var balance1 = getValue(leafValues[3], index[3]);
  var balance1New = balance1 - amount1;
  assert(balance1 >= amount0);
  
  var arr4[4] = setValue(leafValues[3], index[3], balance1New);
  for(var i=0; i<4; i++) {
    leafValues_out[3][i] <== arr4[i];
  }

  // add share
  in[7] <-- checkShareLeafInfoIndex(index[4], account, pool);
  in[7] * succeed === 1; // true
  
  var totalAmount = amount0 + amount1;
  assert(totalAmount > amount0 && totalAmount > amount1);

  var share = getValue(leafValues[4], index[4]);
  var shareNew = share + totalAmount;
  assert(shareNew >= share);
  
  var arr5[4] = setValue(leafValues[4], index[4], shareNew);
  for(var i=0; i<4; i++) {
    leafValues_out[4][i] <== arr5[i];
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
  }
}

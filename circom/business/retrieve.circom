pragma circom 2.0.0;

include "./command.circom"; 
include "../utils/merkle-tree.circom"; 

template retrieve(command, leafInfos) {
  signal output res[1];
  component cres = CommandResult();
  component cmd = Command();
  
  // true
  cres.succeed <== 1;

  for(var i=0; i<5; i++) {
    for(var j=0; j<4; j++) {
      cres.leafInfos[i][j] <== leafInfos[i][j];
    }
  }
  
  cmd.data[0] <== command[0];
  cmd.data[1] <== command[1];
  var account = cmd.args[3];
  var pool = cmd.args[4];
  var amount0 = cmd.args[5];
  var amount1 = cmd.args[6];
  var nonce = cmd.args[7];

  // nonce
  var leafInfo[4] = leafInfos[0];
  if(cres.succeed == 1 && checkNonceLeafInfoIndex(leafInfo, account)) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }

  if(cres.succeed == 1 && checkCommandSign(command, leafInfo, [[cmd.op, account], [pool, amount0], [amount1, nonce]], 3) == 1) {
    // true
    cres.succed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  if(cres.succeed == 1 && getNonce(leafInfo) == nonce) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  cres.leafInfos[0] <== setNonce(leafInfo, nonce+1);

  // change pool data
  leafInfo = leafInfos[1];
  if(cres.succeed == 1 && checkPoolLeafInfoIndex(leafInfo, pool) == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }

  var token0Info = getPoolToken0Info(leafInfo);
  var token1Info = getPoolToken1Info(leafInfo);
  var token0Amount = getPoolToken0Amount(leafInfo);
  var token1Amount = getPoolToken1Amount(leafInfo);

  if(cres.succeed == 1 && token0Info != 0) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  if(cres.succeed == 1 && token1Info != 0) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }

  var token0AmountNew = token0Amount - amount0;
  if(cres.succeed == 1 && token0Amount >= amount0) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  var token1AmountNew = token1Amount - amount1;
  if(cres.succeed == 1 && token1Amount >= amount1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }

  var leaves = [token0Info, token1Info, token0AmountNew, token1AmountNew];
  cres.leafInfos[1] <== setValues(leafInfo, leaves);

  // change token0 balance
  leafInfo = leafInfos[2];
  if(cres.succeed == 1 && checkBalanceLeafInfoIndex(leafInfo, account, token0Info) == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  if(cres.succeed == 1 && checkTokenRange(token0Info) == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  var balance0 = getValue(leafInfo);
  var balance0New = balance0 + amount0;
  if(cres.succeed == 1 && balance0 <= balance0New) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  cres.leafInfos[2] <== setValue(leafInfo, balance0New);

  // change token1 balance
  leafInfo = leafInfos[3];
  if(cres.succeed == 1 && checkBalanceLeafInfoIndex(leafInfo, account, token1Info) == 1) {
    // true
    cres.succeed <== 1;
  } else {
     // false
    cres.succeed <== 0;
  }
  if(cres.succeed == 1 && checkTokenRange(token1Info) == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  var balance1 = getValue(leafInfo);
  var balance1New = balance1 + amount0;
  if(cres.succeed == 1 && balance1 <= balance1New) {   
    // true
    cres.succeed <== 1;
  } else {
     // false
    cres.succeed <== 0;
  }
  cres.leafInfos[3] <== setValue(leafInfo, balance1New);

  // add share
  leafInfo = leafInfos[4];
  if(cres.succeed == 1 && checkShareLeafInfoIndex(leafInfo, account, pool) == 1) {   
    // true
    cres.succeed <== 1;
  } else {
     // false
    cres.succeed <== 0;
  }

  var totalAmount = amount0 + amount1;
  if(cres.succeed == 1 && totalAmount >= amount0 && totalAmount >= amount1) {
    // true
    cres.succeed <== 1;
  } else {
    // false      
    cres.succeed <== 0;
  }

  var share = getValue(leafInfo);
  var shareNew = share - totalAmount;
  if(cres.succeed == 1 && share >= totalAmount) {
    // true
    cres.succeed <== 1;
  } else {
    // false      
    cres.succeed <== 0;
  }
  cres.leafInfos[4] <== setValue(leafInfo, shareNew);
  
  res[0] <== cres.succeed;
  res[1] <== cres.leafInfos;
}

pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template supply(command, leafInfos) {
  // as the return of supply 
  signal output succeed;
  signal output lInfos[5][4];

  component cres = CommandResult();
  component cmd = Command();
  
  for(var i=0; i<5; i++) {
    for(var j=0; j<4; j++) {
      cres.leafInfos[i][j] <== leafInfos[5][4];
    }
  }

  // true
  cres.succeed <== 1;

  cmd.op <== command[0];
  for(var i=0; i<8; i++) {
    cmd.args[i] <== command[1][i];
  }

  var account = cmd.args[3];
  var pool = cmd.args[4];
  var amount0 = cmd.args[5];
  var amount1 = cmd.args[6];
  var nonce = cmd.args[7];

  // nonce
  var leafInfo[4] = leafInfos[0];
  
  if(checkNonceLeafInfoIndex(leafInfo, account) == 1) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  
  // command[0] is op
  if(cres.succeed == 1 && checkCommandSign(command, leafInfo, [[command[0], account], [pool, amount0], [amount1, nonce]], 3) == 1) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  
  if(cres.succeed == 1 && getNonce(leafInfo) == nonce) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  
  var res1[4] = setNonce(leafInfo, nonce + 1);
  for(var i=0; i<4; i++) {
    cres.leafInfos[0][i] <== res1[i]; 
  }

  // change pool data
  leafInfo = leafInfos[1];

  if(cres.succeed == 1 && checkPoolLeafInfoIndex(leafInfo, pool) == 1) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }

  var token0Info = getPoolToken0Info(leafInfo);
  var token1Info = getPoolToken1Info(leafInfo);
  var token0Amount = getPoolToken0Amount(leafInfo);
  var token1Amount = getPoolToken1Amount(leafInfo);

  if(cres.succeed == 1 && token0Info != 0) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  
  if(cres.succeed == 1 && token1Info != 0) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }

  var token0AmountNew = token0Amount + amount0;
  
  if(cres.succeed == 1 && token0Amount < token0AmountNew) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  
  var token1AmountNew = token1Amount + amount1;
  
  if(cres.succeed == 1 && token1Amount < token1AmountNew) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }

  var leaves[4] = [token0Info, token1Info, token0AmountNew, token1AmountNew];

  var res2[4] = setValues(leafInfo, leaves);
  
  for(var i=0; i<4; i++) {
    cres.leafInfos[1][i] <== res2[i]; 
  }

  // change token0 balance
  leafInfo = leafInfos[2];
  if(cres.succeed == 1 && checkBalanceLeafInfoIndex(leafInfo, account, token0Info) == 1) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  
  if(cres.succeed == 1 && checkTokenRange(token0Info) == 1) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }

  var balance0 = getValue(leafInfo);
  var balance0New = balance0 - amount0;

  if(cres.succeed == 1 && balance0 >= amount0) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  
  var res3[4] = setValue(leafInfo, balance0New);
  for(var i=0; i<4; i++) {
    cres.leafInfos[2][i] <== res3[i]; 
  }
    
  // change token1 balance
  leafInfo = leafInfos[3];

  if(cres.succeed == 1 && checkBalanceLeafInfoIndex(leafInfo, account, token0Info) == 1) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  
  if(cres.succeed == 1 && checkTokenRange(token1Info) == 1) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }

  var balance1 = getValue(leafInfo);
  var balance1New = balance1 - amount1;

  if(cres.succeed == 1 && balance0 >= amount0) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  

  var res4[4] = setValue(leafInfo, balance1New);
  for(var i=0; i<4; i++) {
    cres.leafInfos[3][i] <== res4[i];
  }

  // add share
  leafInfo = leafInfos[4];

  if(cres.succeed == 1 && checkShareLeafInfoIndex(leafInfo, account, pool) == 1) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  
  var totalAmount = amount0 + amount1;

  if(cres.succeed == 1 && totalAmount > amount0 && totalAmount > amount1) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }

  var share = getValue(leafInfo);
  var shareNew = share + totalAmount;

  if(cres.succeed == 1 && shareNew >= share) {
    // true
    cres.succeed = 1;
  } else {
    // false
    cres.succeed = 0;
  }
  
  var res5[4] = setValue(leafInfo, shareNew);
  for(var i=0; i<4; i++) {
    cres.leafInfos[4][i] <== res5[i];
  }

  // end
  succeed <== cres.succeed;
  for(var i=0; i<5; i++) {
    for(var j=0; j<4; j++) {
      lInfos[i][j] <== cres.leafInfos[i][j];
    }
  }
}

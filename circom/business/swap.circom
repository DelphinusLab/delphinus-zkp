pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template swap(command, leafInfos) {
  // as the return of swap
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
  
  cmd.data[0] <== command[0];
  cmd.data[1] <== command[1];
  var account = cmd.args[3];
  var pool = cmd.args[4];
  var amount = cmd.args[5];
  var direction = cmd.args[6];
  var nonce = cmd.args[7];

  // nonce
  var leafInfo[4] = leafInfos[0];
  
  if(checkNonceLeafInfoIndex(leafInfo, account) == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  
  if(cres.succeed == 1 && checkCommandSign(command, leafInfo, [[command.op, account], [pool, amount], [direction, nonce]], 3) == 1) {
    // true
    cres.succeed <== 1;
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
  
  var arr[4] = setNonce(leafInfo, nonce + 1);
  for(var i=0; i<4; i++) {
    cres.leafInfos[0][i] = arr[i];
  }

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

  var token0AmountNew;
  if (direction == 0) {
    token0AmountNew = token0Amount + amount;  
  } else {
    token0AmountNew = token0Amount - amount;
  }

  var res;
  if(direction == 0) {
    // true
    res = 1;
  } else {
    if(token0Amount >= amount) {
      // true
      res = 1;
    } else {
      // false
      res = 0;  
    }
  }
  
  if(cres.succeed == 1 && res == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }

  var token1AmountNew;
  if(direction != 0) {
    token1AmountNew = token1Amount + amount;
  } else {
    token1AmountNew = token1Amount - amount;
  }
  
  var res1;
  if(direction != 0) {
    // true
    res1 = 1;
  } else {
    if(token1Amount >= amount) {
      // true
      res1 = 1;
    } else {
      // false
      res1 = 0;  
    }
  }
  
  if(cres.succeed == 1 && res1 == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }

  var leaves[4] = [token0Info, token1Info, token0AmountNew, token1AmountNew];
  var arr1[4] = setValues(leafInfo, leaves);
  
  for(var i=0; i<4; i++) {
    cres.leafInfos[1][i] <== arr1[i];
  }

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

  var balance0New;
  if (direction == 0) {
    balance0New = balance0 - amount;  
  } else {
    balance0New = balance0 + amount;  
  }

  var res2;
  if(direction != 0) {
    // true
    res = 1;
  } else {
    if(balance0 >= amount) {
      // true
      res = 1;
    } else {
      // false
      res = 0;  
    }
  }
  
  if(cres.succeed == 1 && res2 == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }

  var arr2[4] = setValue(leafInfo, balance0New);
  
  for(var i=0; i<4; i++) {
    cres.leafInfos[2][i] <== arr2[i];
  }


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
  
  var balance1New;
  if (direction != 0) {
    balance1New = balance1 - amount;  
  } else {
    balance1New = balance1 + amount;  
  }

  var res3;
  if(direction != 0) {
    // true
    res = 1;
  } else {
    if(balance1 >= amount) {
      // true
      res = 1;
    } else {
      // false
      res = 0;  
    }
  }
  
  if(cres.succeed == 1 && res3 == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }

  var arr3[4] = setValue(leafInfo, balance1New);
  
  for(var i=0; i<4; i++) {
    cres.leafInfos[3][i] <== arr3[i];
  }

  // end
  succeed <== cres.succeed;
  for(var i=0; i<5; i++) {
    for(var j=0; j<4; j++) {
      lInfos[i][j] <== cres.leafInfos[i][j];
    }
  }

}

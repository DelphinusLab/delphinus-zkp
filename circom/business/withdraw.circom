pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template withdraw(command, leafInfos) {
  // as the return of withdraw
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
  var token = cmd.args[4];
  var amount = cmd.args[5];
  //command.args[6] is for L1 account address
  var nonce = cmd.args[7];

  if(checkTokenRange(token) == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }

  // nonce
  var leafInfo[4] = leafInfos[0];
  if(cres.succeed == 1 && checkNonceLeafInfoIndex(leafInfo, account) == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }

  if(cres.succeed == 1 && checkCommandSign(command, leafInfo, [[cmd.op, account], [token, amount], [nonce, 0]], 3) == 1) { 
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
    cres.leafInfos[0][i] <== arr[i];
  }

  // sub amount
  leafInfo = leafInfos[1];

  if(cres.succeed == 1 && checkBalanceLeafInfoIndex(leafInfo, account, token) == 1) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  
  var balance = getValue(leafInfo);
  var balanceNew = balance - amount;
  
  if(cres.succeed == 1 && balance >= amount) {
    // true
    cres.succeed <== 1;
  } else {
    // false
    cres.succeed <== 0;
  }
  
  var arr1[4] = setValue(leafInfo, balanceNew);
  
  for(var i=0; i<4; i++) {
    cres.leafInfos[1][i] <== arr1[i];
  }

  // end
  succeed <== cres.succeed;
  for(var i=0; i<5; i++) {
    for(var j=0; j<4; j++) {
      lInfos[i][j] <== cres.leafInfos[i][j];
    }
  }
}

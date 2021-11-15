pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template deposit(command, leafInfos) {
  signal output res[2];
  component cres = CommandResult();
  component cmd = Command();

  // leafInfos should be an array, leafInfos[5][4]
  for(var i=0; i<5; i++) {
    for(var j=0; j<4; j++) {
      cres.leafInfos[i][j] <== leafInfos[i][j];
    }
  }

  cres.succeed = 1; //true

  cmd.data[0] <== command[0];
  cmd.data[1] <== command[1];
  var account = cmd.args[0];
  var token = cmd.args[1];
  var amount = cmd.args[2];

  if(checkTokenRange(token) != 1) {
    cres.succeed <== 0; // false
  }

  var COMMAND_ARGS = 8;
  for(var i=3; i<COMMAND_ARGS; i++) {
    if(cmd.args[i] != 0) {
      cres.succeed <== 0; // false
    }
  } 
   
  var leafInfo[4] = leafInfos[0];
  if(cres.succeed == 1 && checkBalanceLeafInfoIndex(leafInfo, account, token) == 1) {
    cres.succeed <== 1; // true
  } else {
    cres.succeed <== 0; // false
  }

  var balance = getValue(leafInfo);
  var balanceNew = balance + amount;
  if(cres.succeed == 1 && balance < balanceNew) {
    cres.succeed <== 1; // true
  } else {
    cres.succeed <== 0; // false
  }

  cres.leafInfos[0] <== setValue(leafInfo, balanceNew);
  
  res[0] <== cres.succeed;
  res[1] <== cres.leafInfos;
}

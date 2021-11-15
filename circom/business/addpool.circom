pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template addPool(command, leafInfos) {
  signal output res[2];

  component cres = CommandResult();
  component cmd = Command();
  component leafInfo = LeafInfo();

  for(var i=0; i<5; i++) {
    for(var j=0; j<4; j++) {
      cres.leafInfos[i][j] <== leafInfos[i][j];
    }
  }

  cres.succeed <== 1; // true

  cmd.data[0] <== command[0];
  cmd.data[1] <== command[1];
  var pool = cmd.args[0];
  var token0 = cmd.args[1];
  var token1 = cmd.args[2];

  var COMMAND_ARGS = 8; 
  for(var i=4; i<COMMAND_ARGS; i++) {
    if(cmd.args[i] != 0) {
      cres.succeed <== 0; // false
    }
  }

  // prerequisite: check arguments
  // 0 means false, 1 menas true
  if(cres.succeed == 1 && token0 != token1) {
    cres.succeed <== 1;
  } else {
    cres.succeed <== 0; 
  }
  if(cres.succeed == 1 && checkTokenRange(token0) == 1) {
    cres.succeed <== 1;
  } else {
    cres.succeed <== 0;
  }
  if(cres.succeed == 1 && checkTokenRange(token1) == 1) {
    cres.succeed <== 1;
  } else {
    cres.succeed <== 0;
  }
 
  // step 1: check poolinfo and set
  var lInfo[4] = leafInfos[0];

  // 0 means false, 1 menas true
  if(cres.succeed == 1 && checkPoolLeafInfoIndex(lInfo, pool) == 1) {
    cres.succeed <== 1;
  } else {
    cres.succeedi <== 0;
  }

  var token0Info = getPoolToken0Info(lInfo);
  var token1Info = getPoolToken1Info(lInfo);
  var token0Amount = getPoolToken0Amount(lInfo);
  var token1Amount = getPoolToken1Amount(lInfo);

  if(cres.succeed == 1 && token0Info == 0) {
    cres.succeed <== 1;
  } else {
    cres.succeed <== 0;
  }
  if(cres.succeed == 1 && token1Info == 0) {
    cres.succeed <== 1;
  } else {
    cres.succeed <== 0;
  }


  cres.leafInfos[0] <== setValues(lInfo, [token0, token1, 0, 0]);
  
  var arr[2];
  arr[0] = cres.succeed;
  arr[1] = cres.leafInfos;
  res[0] <== arr;
}

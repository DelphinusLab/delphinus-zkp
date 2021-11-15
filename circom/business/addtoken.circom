pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template addToken(command, leafInfos) {
  signal output res[2];
  component cres = CommandResult();
  component cmd = Command();
  
  // leafInfos should be an array, leafInfos[5][4]
  for(var i=0; i<5; i++) {
    for(var j=0; j<4; j++) {
      cres.leafInfos[i][j] <== leafInfos[i][j];
    }
  }
  
  cmd.data[0] <== command[0];
  cmd.data[1] <== command[1];
  var tokenAddress = cmd.args[0];
  var tokenIndex = cmd.args[1];
  
  cres.succeed <== 1; // true

  var COMMAND_ARGS = 8;
  for(var i=2; i<COMMAND_ARGS; i++) {
    if(cmd.args[i] != 0) {
      cres.succeed <== 0; // false
    }
  } 

  // prerequisite: check arguments
  if(cres.succeed == 1 && checkTokenRange(tokenIndex) == 1) {
    cres.succeed <== 1; // true
  } else {
    cres.succeed <== 0; // false
  }

  res[0] <== cres.succeed;
  res[1] <== cres.leafInfos;
}

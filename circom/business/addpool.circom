pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";

template addPool(command, leafInfos) {
  signal output res[5][4];
  component cres = CommandResult();
  component cmd = Command();
  component leafInfo = LeafInfo();

  var COMMAND_ARGS = 8; 

  for(var i=0; i<5; i++) {
    for(var j=0; j<4; j++) {
      cres.data[i][j] <== leafInfos[i][j];
    }
  }

  cmd.data[0] <== command[0];
  cmd.data[1] <== command[1];

  var pool = cmd.args[0];
  var token0 = cmd.args[1];
  var token1 = cmd.args[2];

  for(i=0; i>=4 && i<COMMAND_ARGS; i++) {
    cmd.args[i] === 0;
  }

  // prerequisite: check arguments
  assert(token0 != token1);
  checkTokenRange(token0) === 1;
  checkTokenRange(token1) === 1;
  
  // step 1: check poolinfo and set
  var leafInfo[4] = leafInfos[0];

  checkPoolLeafInfoIndex(leafInfo, pool) === 1;

  var token0Info = getPoolToken0Info(leafInfo);
  var token1Info = getPoolToken1Info(leafInfo);
  var token0Amount = getPoolToken0Amount(leafInfo);
  var token1Amount = getPoolToken1Amount(leafInfo);

  token0Info === 0;
  token1Info === 0;

  cres.data[0] = setValues(leafInfo, [token0, token1, 0, 0]);
  
  // end
  res <== cres.data;
}

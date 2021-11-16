pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";
include "../utils/sign.circom";

function setkey(command, root, leafInfos) {
  // command[1] is args[8]
  var account = command[1][0];
  var key0 = command[1][1];
  var key1 = command[1][2];
  var nonce = command[1][3];
  
  var COMMAND_ARGS = 8;
  for(var i=4; i<COMMAND_ARGS; i++) {
    assert(command[1][i] == 0);
  }
  
  var LEAF_INFOS = 5;
  for(var i=1; i<LEAF_INFOS; i++) {
    // == 1 means true
    assert(checkEmptyLeafInfo(leafInfos[i]) == 1);
  }

  assert(checkKey([key0, key1]) == 1);

  var leafInfo[4] = leafInfos[0];
  //assert(checkLeafInfo(root, leafInfo) == 1);
  assert(checkAccount(leafInfo, account) == 1);
  // command[0] is op
  assert(checkCommandSign(command, leafInfo, [[command[0], account], [key0, key1], [nonce, 0]], 3) == 1);
  return checkNonceAndUpdateWithKey(leafInfo, nonce, [key0, key1]);
}

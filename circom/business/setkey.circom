pragma circom 2.0.0;

include "./command.circom";
include "../utils/merkle-tree.circom";
include "../utils/sign.circom";

template setkey() {
  signal input root_in;
  signal input op;
  signal input args[8];
  signal input root[5];
  signal input index[5][32];
  signal input pathDigests[5][15][4];
  signal input leafValues[5][4];
  signal out;

  var account = args[0];
  var key0 = args[1];
  var key1 = args[2];
  var nonce = args[3];
  
  var COMMAND_ARGS = 8;
  for(var i=4; i<COMMAND_ARGS; i++) {
    args[i] === 0;
  }
  
  /*
  var LEAF_INFOS = 5;
  for(var i=1; i<LEAF_INFOS; i++) {
    // == 1 means true
    assert(checkEmptyLeafInfo(leafInfos[i]) == 1);
  }
  */

  assert(checkKey([key0, key1]) == 1);

  assert(checkLeafInfo(index[0], leafValues[0], pathDigests[0], root[0]) == 1);
  // assert(checkAccount(leafInfo, account) == 1);
  assert(checkCommandSign(args, leafValues[0], [[op, account], [key0, key1], [nonce, 0]], 3) == 1);
  // checkNonceAndUpdateWithKey(leafInfo, nonce, [key0, key1]);
  out <== 1; // function above is stub, so use return 1; temporarily
}

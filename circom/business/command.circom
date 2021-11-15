pragma circom 2.0.0;

include "../utils/merkle-tree.circom";
include "../utils/sign.circom";

template CommandResult() {
  signal input succeed;
  signal input leafInfos[5][4];
}

template Command() {
    signal input data[2];
    signal output op;
    signal output args[8];

    op <== data[0];
    for(var i=0; i<8; i++) {
      args[i] <== data[1][i];
    }
}

function checkTokenRange(token) {
  if(token >= 4 && token < 1024) {
    // true
    return 1;
  } else {
    // false
    return 0;
  }
}

function getNonce(leafInfo) {
  var NONCE_SELECTOR = 2;
  return getValueBySelector(leafInfo, NONCE_SELECTOR);
}

function setNonce(leafInfo, nonce) {
  var NONCE_SELECTOR = 2;
  return setValueBySelector(leafInfo, nonce, NONCE_SELECTOR);
}

function checkNonceLeafInfoIndex(leafInfo, account) {
  var NONCE_SELECTOR_FIELD = 2;
  return checkBalanceLeafInfoIndex(leafInfo, account, NONCE_SELECTOR_FIELD);
}

template checkCommandSign(command, leafInfo, msg, msgLength) {
  signal output res;
  
  var r[2];
  // command[1] is args[8] 
  r[0]= command[1][0];
  r[1]= command[1][1];
  var s = command[1][2];
  // no sign at this stage
  if(r[0] == 0 && r[1] == 0 && s == 0) {
    res <== 1; // true
  } else {
    res <== 0; // false
  }
  /* 
  var AX_SELECTOR = 0;
  var AY_SELECTOR = 1;
  var a[2] = [
      getValueBySelector(leafInfo, AX_SELECTOR),
      getValueBySelector(leafInfo, AY_SELECTOR)
  ];
  var META_ASSET_INDEX = 0;
  // == 1 means true
  assert(checkAsset(leafInfo, META_ASSET_INDEX) == 1);
  component check_sign = checkSign(msg, r, s, a, msgLength);
  // msgLength is the length of msg
  res <== check_sign.res;
  */
}

pragma circom 2.0.0;

include "../utils/merkle-tree.circom";
include "../utils/sign.circom";

/*stub*/

function checkAccount(N1, N2) {
    // true
    return 1;
}

function checkNonceAndUpdateWithKey(N1, N2, N3) {
    return 1;
}
/*stub end*/

function checkTokenRange(token) {
    assert(token >= 4 && token < 1024);
    return 1; // true
}

function getNonce(leafValues) {
    var NONCE_SELECTOR = 2;
    return leafValues[NONCE_SELECTOR];
}

function setNonce(leafValues, nonce) {
    var NONCE_SELECTOR = 2;
    return setValueBySelector(leafValues, nonce, NONCE_SELECTOR);
}

function checkNonceLeafInfoIndex(index, account) {
    var NONCE_SELECTOR_FIELD = 2;
    return checkBalanceLeafInfoIndex(index, account, NONCE_SELECTOR_FIELD);
}

function checkCommandSign(args, leafValues, msg, msgLength) {
    var r[2];
    r[0] = args[0];
    r[1] = args[1];
    var s = args[2];
    // no sign at this stage
    assert(r[0] == 0 && r[1] == 0 && s == 0);

    return 1; // true
    /* 
    var AX_SELECTOR = 0;
    var AY_SELECTOR = 1;
    var a[2] = [
      getValueBySelector(leafValues, AX_SELECTOR),
      getValueBySelector(leafValues, AY_SELECTOR)
    ];
    var META_ASSET_INDEX = 0;
    // == 1 means true
    assert(checkAsset(leafValues, META_ASSET_INDEX) == 1);
    component chSign = checkSign(msg, r, s, a, msgLength);
    return chSign.res;
    */
}

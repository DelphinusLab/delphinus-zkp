pragma circom 2.0.0; 

include "./dependency.circom";

template LeafInfo() {
  signal input data[4];
  signal output root;
  signal output index[32];
  signal output pathDigests[15][4];
  signal output leafValues[4];

  root <== data[0];
  for(var i=0; i<32; i++) {
    index[i] <== data[1][i];
  }
  for(var i=0; i<15; i++) {
    for(var j=0; j<4; j++) {
      pathDigests[i][j] <== data[2][i];
    }
  }
  for(var i=0; i<4; i++) {
    leafValues[i] <== data[3][i];
  }
}

function bits_to_field(count, bits) {
  var arr[32];
  for(var i=0; i<32; i++) {
    // count is the length of bits
    if(i<32-count) {
      // represent false
      arr[i] = 0;
    } else {
      arr[i] = bits[i-32+count];
    }
  }
  return u32_to_field(u32_from_bits(arr));
}

function u32_from_2bits(selector) {
  var arr[32];
  for(var i=0; i<32; i++) {
    if(i<30) {
      arr[i] = 0;
    } else {
      arr[i] = selector[i-30];
    }
  }
  return u32_from_bits(arr);
}

function getRootHash(leafInfo) {
  // leafInfo[1] is index[32]
  var selector[32] = leafInfo[1];
  // leafInfo[3] is leafValues[4]
  var currentValue = hash(leafInfo[3]);
  
  var arr[2]; // selector[0], selector[1]
  for(var i=1; i<16; i++) {
    var layer = 15 - i;
    arr[0] = selector[layer*2];
    arr[1] = selector[layer*2 + 1];

    // leafInfo[2] is pathDigests[15][4]
    leafInfo[2][layer][u32_from_2bits(arr)] = currentValue;
    currentValue = hash(leafInfo[2][layer]);
  }
  return currentValue;
}

function checkLeafInfo(leafInfo) {
  // leafInfo[1] is index[32]
  var selector[32] = leafInfo[1];
  var ret;
  // leafInfo[3] is leafValues[4]
  var currentValue = hash(leafInfo[3]);
  
  var arr[2]; // selector[0], selector[1]
  for(var i=1; i<16; i++) {
    var layer = 15 - i;
    arr[0] = selector[layer*2];
    arr[1] = selector[layer*2 + 1];

    // leafInfo[2] is pathDigests[15][4]
    if(leafInfo[2][layer][u32_from_2bits(arr)] == currentValue) {
      // represent true
      ret = 1;
    } else {
      // represent false
      ret = 0;
    }
    currentValue = hash(leafInfo[2][layer]);
  }
  // leafInfo[0] is root
  if(ret == 1 && leafInfo[0] == currentValue) {
    // represent true
    return 1;
  } else {
    // represent false
    return 0;
  }
}

/* getter */

function getValueBySelector(leafInfo, idx) {
  return leafInfo[3][idx]; // leafInfo[3] is leafValues[4]
}

function getValue(leafInfo) {
  var TOTAL_BITS = 32;
  var arr[2];
  // leafInfo[1] is index[32]
  for(var i=30; i<TOTAL_BITS; i++) {
    arr[i-30] = leafInfo[1][i];
  }
  arr[0] = leafInfo[1][30];
  arr[1] = leafInfo[1][31];
  return getValueBySelector(leafInfo, u32_from_2bits(arr));
}

/* setter */

function setValue(leafInfo, v) {
  var arr = [2];
  var TOTAL_BITS = 32;
  var LEAF_BITS = 2;
  var LEAF_START_BIT = TOTAL_BITS - LEAF_BITS;
  var LEAF_END_BIT = TOTAL_BITS;

  // leafInfo[1] is index[32]
  for(var i=LEAF_START_BIT; i<LEAF_END_BIT; i++) {
    arr[i-LEAF_START_BIT] = leafInfo[1][i];
  }
  // leafInfo[3] is leafValues
  leafInfo[3][u32_from_2bits(arr)] = v;
  return leafInfo;
}

function setValueBySelector(leafInfo, v, idx) {
  // leafInfo[3] is leafValues
  leafInfo[3][idx] = v;
  return leafInfo;
}

function setValues(leafInfo, v) {
  // leafInfo[3] is leafValues
  leafInfo[3] = v;
  return leafInfo;
}

/* balance index */

function checkBalanceLeafInfoIndex(leafInfo, account, asset) {
  // represent [false, false]
  var BALANCE_SELECTOR[2] = [0, 0];
  // leafInfo[1] is index[32]
  var selector[32] = leafInfo[1];
  // represent false
  var cond0 = 0;
  var cond1 = 0;
  var cond2 = 0;

  var arr1[20];
  var arr2[10];
  for(var i=2; i<32; i++) {
    if(i<22) {
      arr1[i-2] = selector[i];
    }
    if(i>=22) {
      arr2[i-22] = selector[i];
    }
  }
  if(selector[0] == BALANCE_SELECTOR[0] && selector[1] == BALANCE_SELECTOR[1]) {
    // true
    cond0 = 1;
  }
  // 20 is the length of arr1
  if(bits_to_field(20, arr1) == account) {
    // true
    cond1 = 1;
  }
  // 10 is the length of arr2
  if(bits_to_field(10, arr2) == asset) {
    // true
    cond2 = 1;
  }
  if(cond0 == 1 && cond1 == 1 && cond2 == 1) {
    // true
    return 1;
  } else {
    // false
    return 0;
  }
}

/* pool index */

function checkPoolLeafInfoIndex(leafInfo, pool) {
  // [false, true]
  var POOL_SELECTOR[2] = [0, 1];
  // [false, false]
  var BALANCE_SELECTOR[2] = [0, 0];
  // false
  var cond0 = 0;
  var cond1 = 0;
  // true
  var cond2 = 1;
  
  var selector[32] = leafInfo[1]; // index[32]
  
  var arr[10];
  for(var i=2; i<30; i++) {
    if(i<12) {
      arr[i-2] = selector[i];
    } 
    if(i>=12) {
      // 1 means true
      if(selector[i] == 1) {
        cond2 = 0;
      }
    }
  }
  if(selector[0] == BALANCE_SELECTOR[0] && selector[1] == BALANCE_SELECTOR[1]) {
    // true
    cond0 = 1;
  }
  if(bits_to_field(10, arr) == pool) {
    cond1 = 1;
  }
  if(cond0 == 1 && cond1 == 1 && cond2 == 1) {
    // true
    return 1;
  } else {
    // false
    return 0;
  }
}

function getPoolToken0Info(leafInfo) {
  var TOKEN0_INFO_SELECTOR = 0;
  return getValueBySelector(leafInfo, TOKEN0_INFO_SELECTOR);
}

function getPoolToken1Info(leafInfo) {
  var TOKEN1_INFO_SELECTOR = 1;
  return getValueBySelector(leafInfo, TOKEN1_INFO_SELECTOR);
}

function getPoolToken0Amount(leafInfo) {
  var TOKEN0_AMOUNT_SELECTOR = 2;
  return getValueBySelector(leafInfo, TOKEN0_AMOUNT_SELECTOR);
}

function getPoolToken1Amount(leafInfo) {
  var TOKEN1_AMOUNT_SELECTOR = 3;
  return getValueBySelector(leafInfo, TOKEN1_AMOUNT_SELECTOR);
}

/* share index */

function checkShareLeafInfoIndex(leafInfo, account, pool) {
  // represent [true, false]
  var SHARE_SELECTOR[2] = [1, 0];
  // leafInfo[1] is index[32]
  var selector[32] = leafInfo[1];
  // represent false
  var cond0 = 0;
  var cond1 = 0;
  var cond2 = 0;

  var arr1[20];
  var arr2[10];
  for(var i=2; i<32; i++) {
    if(i<22) {
      arr1[i-2] = selector[i];
    }
    if(i>=22) {
      arr2[i-22] = selector[i];
    }
  }
  if(selector[0] == SHARE_SELECTOR[0] && selector[1] == SHARE_SELECTOR[1]) {
    // true
    cond0 = 1;
  }
  // 20 is the length of arr1
  if(bits_to_field(20, arr1) == account) {
    // true
    cond1 = 1;
  }
  // 10 is the length of arr2
  if(bits_to_field(10, arr2) == pool) {
    // true
    cond2 = 1;
  }
  if(cond0 == 1 && cond1 == 1 && cond2 == 1) {
    // true
    return 1;
  } else {
    // false
    return 0;
  }
}

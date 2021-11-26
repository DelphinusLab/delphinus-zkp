pragma circom 2.0.0; 

include "./dependency.circom";

/*stub*/

function checkEmptyLeafInfo(N) {
  // true
  return 1;
}

/*stub end*/

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

function getValueBySelector(leafValues, idx) {
  return leafValues[idx];
}

function getValue(leafValues, index) {
  var TOTAL_BITS = 32;
  var arr[2];
  for(var i=30; i<TOTAL_BITS; i++) {
    arr[i-30] = index[i];
  }

  return getValueBySelector(leafValues, u32_from_2bits(arr));
}

/* setter */

function setValue(leafValues, index, v) {
  var arr[2];
  var TOTAL_BITS = 32;
  var LEAF_BITS = 2;
  var LEAF_START_BIT = TOTAL_BITS - LEAF_BITS;
  var LEAF_END_BIT = TOTAL_BITS;

  for(var i=LEAF_START_BIT; i<LEAF_END_BIT; i++) {
    arr[i-LEAF_START_BIT] = index[i];
  }
  leafValues[u32_from_2bits(arr)] = v;
  return leafValues;
}

function setValueBySelector(leafInfo, v, idx) {
  // leafInfo[3] is leafValues
  leafInfo[3][idx] = v;
  return leafInfo;
}

function setValues(leafValues, v) {
  leafValues = v;
  return leafValues;
}

/* balance index */

function checkBalanceLeafInfoIndex(index, account, asset) {
  // represent [false, false]
  var BALANCE_SELECTOR[2] = [0, 0];
  var selector[32] = index;
  assert(selector[0] == BALANCE_SELECTOR[0]);
  assert(selector[1] == BALANCE_SELECTOR[1]);

  var arr1[20];
  for(var i=2; i<22; i++) {
    arr1[i-2] = selector[i];
  }
  assert(bits_to_field(20, arr1) == account);

  var arr2[10];
  for(var i=22; i<32; i++) {
    arr2[i-22] = selector[i];
  }
  assert(bits_to_field(10, arr2) == asset);

  return 1; // true
}

/* pool index */

function checkPoolLeafInfoIndex(index, pool) {
  var selector[32] = index; // index[32]
  // [false, true]
  var POOL_SELECTOR[2] = [0, 1];
  assert(selector[0] == POOL_SELECTOR[0]);
  assert(selector[1] == POOL_SELECTOR[1]);
  
  var res[10];
  for(var i=2; i<12; i++) {
    res[i-2] = selector[i];
  }
  assert(bits_to_field(10, res) == pool);

  for(var i=12; i<30; i++) {
    assert(selector[i] == 0); // false
  }

  // true
  return 1;
}

function getPoolToken0Info(leafValues) {
  var TOKEN0_INFO_SELECTOR = 0;
  return getValueBySelector(leafValues, TOKEN0_INFO_SELECTOR);
}

function getPoolToken1Info(leafValues) {
  var TOKEN1_INFO_SELECTOR = 1;
  return getValueBySelector(leafValues, TOKEN1_INFO_SELECTOR);
}

function getPoolToken0Amount(leafValues) {
  var TOKEN0_AMOUNT_SELECTOR = 2;
  return getValueBySelector(leafValues, TOKEN0_AMOUNT_SELECTOR);
}

function getPoolToken1Amount(leafValues) {
  var TOKEN1_AMOUNT_SELECTOR = 3;
  return getValueBySelector(leafValues, TOKEN1_AMOUNT_SELECTOR);
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

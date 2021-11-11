pragma circom 2.0.0; 

/*stub*/
function u32_from_bits(arr) {
  return 1;
}

function u32_to_field(N) {
  return 1;
}
/*stub end*/

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
    for(var y=0; i<4; y++) {
      pathDigests[i][j] <== data[2][i][j];
    }
  }
  for(var i=0; i<4; i++) {
    leafValues[i] = data[3][i];
  }
}

function bits_to_field(count, bits) {
  var arr[32];
  var count = 0;
  for(var i=0; i<32; i++) {
    if(i<32-count) {
      arr[i] = 0;
    } else {
      arr[i] = bits[i-22];
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


/* getter */

function getValueBySelector(leafInfo, idx) {
  return leafInfo[3][idx]; // leafInfo[3] is leafValues
}

/* setter */

function setValue(leafInfo, v) {
  var arr = [2];
  var TOTAL_BITS = 32;
  var LEAF_BITS = 2;
  var LEAF_START_BIT = TOTAL_BITS - LEAF_BITS;
  var LEAF_END_BIT = TOTAL_BITS;

  for(var i=LEAF_START_BIT; i<LEAF_END_BIT; i++) {
    arr[i-LEAF_START_BIT] = leafInfo[1][i];
  }
  leafInfo[3][u32_from_2bits(arr)] = v;
  return leafInfo;
}

/* pool index */

function checkPoolLeafInfoIndex(leafInfo, pool) {
  var POOL_SELECTOR[2] = [0, 1];
  var selector[32] = leafInfo[1]; // leafInfo.index
  var arr[10];
  for(var i=0; i<30; i++) {
    if(i<2) {
      selector[i] === POOL_SELECTOR[i];
    }
    if(i>=2 && i<12) {
      arr[i-2] = selector[i];
    } 
    bits_to_field(10, arr) === pool;
    if(i>=12) {
      selector[i] === 0;
    }
  }
  return 1;
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

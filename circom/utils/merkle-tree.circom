pragma circom 2.0.0; 

include "./dependency.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../utils/select.circom";

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

function checkLeafInfo(index, leafValues, pathDigests, root) {
    var selector[32] = index;
    var currentValue = hash(leafValues);
    
    for(var i=1; i<16; i++) {
      var layer = 15 - i;
      var arr[2];
      arr[0] = selector[layer*2];
      arr[1] = selector[layer*2+1];
      assert(pathDigests[layer][u32_from_2bits(arr)] == currentValue);
      currentValue = hash(pathDigests[layer]);
    }
    assert(root == currentValue);

    return 1; // true
}

/* getter */

function getValue(leafValues, index) {
    var TOTAL_BITS = 32;
    var arr[2];
    for(var i=30; i<TOTAL_BITS; i++) {
      arr[i-30] = index[i];
    }

    return leafValues[u32_from_2bits(arr)];
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

function setValueBySelector(leafValues, v, idx) {
    leafValues[idx] = v;
    return leafValues;
}

template setValues() {
    var MaxTreeDataIndex = 66;
    var RootHashIndex = 65;
    var PathLevel = 15;
    var PathIndexStart = 1;

    signal input dataPath[MaxTreeDataIndex];
    signal input arr[4];
    signal output out[MaxTreeDataIndex];
    signal selector[PathLevel];

    // index[32]
    for(var i=0; i<PathLevel; i++) {
        selector[i] <-- (dataPath[0] >> (i*2)) & 3; // [0-3]
    }
    
    component new_hash[PathLevel+1];
    for(var i=0; i<= PathLevel; i++) {
        new_hash[i] = Poseidon(4);
    }

    component selcond[PathLevel*4];
    for(var i=0; i<PathLevel*4; i++) {
        selcond[i] = BiSelect();
    }

    new_hash[0].inputs[0] <== dataPath[61];
    new_hash[0].inputs[1] <== dataPath[62];
    new_hash[0].inputs[2] <== dataPath[63];
    new_hash[0].inputs[3] <== dataPath[64];

    // generate new path digests
    for(var level=0; level<PathLevel; level++) {
        for(var i=0; i<4; i++) {
            var idx = 4*level+i;
            selcond[idx].in[0] <== new_hash[level].out;
            selcond[idx].in[1] <== dataPath[idx+PathIndexStart];
            selcond[idx].cond <== i - selector[i];
            out[idx+PathIndexStart] <== selcond[idx].out; // path digests
            new_hash[level+1].inputs[i] <== out[idx+PathIndexStart];
        }
    }

    
    // change root
    out[RootHashIndex] <== new_hash[PathLevel].out;
    
    // new treeData
    // leafValues
    out[61] <== dataPath[61];
    out[62] <== dataPath[62];
    out[63] <== dataPath[63];
    out[64] <== dataPath[64];
    // index
    out[0] <== dataPath[0];
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

function checkPoolLeafInfoIndex(dataPath, pool) {
    var selector[32];
    for(var i=0; i<32; i++) {
      selector[i] = (dataPath[0] >> 1) & 1;
    }

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
      assert(selector[i] == 0); // 0 means false
    }

    return 1; // true
}

function getPoolToken0Info(dataPath) {
    var TOKEN0_INFO_SELECTOR = 0;
    return dataPath[61+TOKEN0_INFO_SELECTOR];
}

function getPoolToken1Info(dataPath) {
    var TOKEN1_INFO_SELECTOR = 1;
    return dataPath[61+TOKEN1_INFO_SELECTOR];
}

function getPoolToken0Amount(dataPath) {
    var TOKEN0_AMOUNT_SELECTOR = 2;
    return dataPath[61+TOKEN0_AMOUNT_SELECTOR];
}

function getPoolToken1Amount(dataPath) {
    var TOKEN1_AMOUNT_SELECTOR = 3;
    return dataPath[61+TOKEN1_AMOUNT_SELECTOR];
}

/* share index */

function checkShareLeafInfoIndex(index, account, pool) {
    // represent [true, false]
    var SHARE_SELECTOR[2] = [1, 0];

    var selector[32] = index;
    assert(selector[0] == SHARE_SELECTOR[0]);
    assert(selector[1] == SHARE_SELECTOR[1]);
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
    assert(bits_to_field(20, arr1) == account);
    assert(bits_to_field(10, arr2) == pool);

    return 1; // true
}

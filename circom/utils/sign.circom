pragma circom 2.0.0;

include "./sha256.circom";
include "./dependency.circom";

function checkKey(A) {
  var context = babyjubjubContext();
  if(onCurve(A, context) == 1 && orderCheck(A, context) == 1) {
    // represent true
    return 1;
  } else {
    // represent false
    return 0;
  }
}

template fieldSplit(v, vLength) {
  signal output res[vLength][2];

  // arr1 is a part of arr2
  var arr1[8];
  for(var i=0; i<8; i++) {
    arr1[i] = 0;
  }
  // arr2 is a part of out
  var arr2[2];
  arr2[0] = arr1;
  arr2[1] = arr1;
  
  for(var i=0; i<vLength; i++) {
    res[i] <== arr2;
  }
  
  // change v to an array of which the length is 8
  var d[256];
  for(var i=0; i<vLength; i++) {
    for(var j=0; i<2; j++) {
      d[256] = unpack256b(v[i][j]);
      res[i][j] <== bool_256_to_u32_8(d);
    }
  }
}

template checkSign(msg, R, S, A, msgLength) {
  signal output res;

  var context = babyjubjubContext();
  //context[0] and context[1] represent Gu and Gv respectively
  var G[2] = [context[0], context[1]];

  var arr[msgLength+1];
  arr[0] = [R[0], A[0]];
  for(var i=0; i<msgLength; i++) {
    arr[i+1] = msg[i];
  }
  component field_split = fieldSplit(arr, msgLength+1);
  // msgLength+1 is the length of arr;
  var hRAM[256] = u32_8_to_bool_256(sha256(field_split.res));

  var sBits[256] = unpack256bool(S);
  var lhs[2] = scalarMult(sBits, G, context);

  var AhRAM[2] = scalarMult(hRAM, A, context);
  var rhs[2] = add(R, AhRAM, context);

  var out;
  if(rhs[0] == lhs[0] && rhs[1] == lhs[1]) {
    // represent true
    out = 1;
  } else {
    // represent false
    out = 0;
  }

  if(out  == 1 && onCurve(R, context)  == 1 && orderCheck(R, context) == 1) {
    // represent true
    res <== 1;
  } else {
    // represent false
    res <== 0;
  }
}

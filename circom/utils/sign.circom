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
  signal output out[vLength][2][8];
  
  for(var i=0; i<vLength; i++) {
    for(var j=0; j<2; j++) {
      var d[256] = unpack256b(v[i][j]);
      var res[8] = bool_256_to_u32_8(d);
      for(var k=0; k<8; k++) {
        out[i][j][k] <== res[k];
      }
    }
  }
}

template checkSign(msg, R, S, A, msgLength) {
  signal output res;

  var context[2] = babyjubjubContext();
  //context[0] and context[1] represent Gu and Gv respectively
  var G[2] = [context[0], context[1]];

  var arr[msgLength+1];
  arr[0] = [R[0], A[0]];
  for(var i=0; i<msgLength; i++) {
    arr[i+1] = msg[i];
  }

  component fieldSp = fieldSplit(arr, msgLength+1);
  var hRAM[256] = u32_8_to_bool_256(sha256(fieldSp.out));

  var sBits[256] = unpack256bool(S);
  var lhs[2] = scalarMult(sBits, G, context);

  var AhRAM[2] = scalarMult(hRAM, A, context);
  var rhs[2] = add(R, AhRAM, context);

  assert(rhs[0] == lhs[0]);
  assert(rhs[1] == lhs[1]);
  assert(onCurve(R, context) == 1);
  assert(orderCheck(R, context) == 1);

  res <== 1; // true
}

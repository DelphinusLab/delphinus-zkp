pragma circom 2.0.0;

function u32_from_bits(arr) {
  return 1;
}

function u32_to_field(N) {
  return 1;
}

function hash(N) {
  return 1;
}

/*function u32_from_2bits(arr) {
  return 1;
}*/

function sha256(N) {
  var res[8];
  return res;
}

function onCurve(A, context) {
  // represent true
  return 1;
}

function orderCheck(A, context) {
  // represent true
  return 1;
}

function babyjubjubContext() {
  // Gu and Gv of context
  var arr[2]; 
  return arr;
}

function u32_8_to_bool_256(N) {
  var res[256];
  return res;
}

function unpack256b(N) {
  // return an array of boolean
  var res[256];
  return res;
}

function bool_256_to_u32_8(N) {
  // change an array of boolean to an array of field element values
  var res[8];
  return res;
}

function unpack256bool(N) {
  var res[256];
  return res;
}

function scalarMult(N1, N2, N3) {
  var res[2];
  return res[2];
}

function add(N1, N2, N3) {
  var res[2];
  return res;
}

function pack128b(N) {
  return 1;
}

function u32_4_to_bool_128(N) {
  var res[128];
  return res;
}

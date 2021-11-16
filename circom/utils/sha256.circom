pragma circom 2.0.0;

include "./dependency.circom";

template Sha256(N, content) {
  signal output res[8];

  var data[N+1][16];
  // arr1 is part of data
  var arr1[16];
  for(var i=0; i<16; i++) {
    arr1[i] = 0;
  }
  // arr2 is part of data
  var arr2[16];
  arr2[0] = 0x80000000;
  for(var i=1; i<15; i++) {
    arr2[i] = 0;
  }
  arr2[15] = N * 512;

  for(var i=0; i< N; i++) {
     data[i] = arr1;
  }
  data[N] = arr2;
  
  var arr3[8];
  var arr4[8];
  for(var i=0; i<N; i++) {
    for(var j=0; j<16; j++) {
      if(j<8) {
        data[i][j] = content[i][0][j];
      } else {
        data[i][j] = content[i][1][j-8];
      }
    }
  }
  
  var sha[8] = sha256(data);
  for(var i=0; i<8; i++) {
    res[i] <== sha[i]; 
  }
}

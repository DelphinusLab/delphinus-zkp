pragma circom 2.0.0;

template CommandResult() {
    signal input data[5][4];
    component leafInfo[5];

    for(var i=0; i<5; i++) {
      leafInfo[i] = LeafInfo();
      for(var j=0; j<4; j++) {
        leafInfo[i].data[j] <== data[i][j];
      }
    }
}

template Command() {
    signal input data[2];
    signal output op;
    signal output args[8];

    op <== data[0];
    for(i=0; i<8; i++) {
      args[i] <== data[1][i];
    }
}

function checkTokenRange(token) {
  if(token >= 4 && token < 1024) {
    return 1;
  } else {
    return 0;
  }
}

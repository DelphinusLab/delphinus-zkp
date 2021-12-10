pragma circom 2.0.0;
// dataPath: field[66], 0: index, 1 - 60: path digests, 61 - 64: leaf value, 65 - root hash
// commands: field[6], 0: op, 1: nonce, 2 - 3: 32bits args, 4 - 5: 252 bits args

include "../utils/check_tree_root_hash.circom";
include "../utils/bit.circom";

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    var e2=1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2+e2;
    }

    lc1 === in;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;

    component n2b = Num2Bits(n+1);

    n2b.in <== in[0]+ (1<<n) - in[1];

    out <== 1-n2b.out[n];
}

// check index of pool
template checkPoolLeafInfoIndex() {
    signal input index[32];
    signal input poolIndex;
    signal output res;

    // [false, true]
    var POOL_SELECTOR[2] = [0, 1];
    index[31] === POOL_SELECTOR[0];
    index[30] === POOL_SELECTOR[1];

    component btf = bits_to_field(10); // 10 is the length of the array passed to btf.bits
    for(var i=29; i>19; i--) {
        btf.bits[29-i] <== index[i];
    }

    // the result of bits_to_field equal to pool, stub function in ../utils/dependency will be implemented later
    btf.res === poolIndex;

    for(var i=19; i>1; i--) {
        index[i] === 0; // 0 means false
    }

    res <== 1; // true
}

template addpool() {
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input commands[CommandArgs];
    signal input dataPath[MaxTreeDataIndex];
    signal output newRootHash;
    signal tokenInfo0;
    signal tokenInfo1;
	signal tokenIndex0;
	signal tokenIndex1;

    var poolIndex = commands[2];
    tokenIndex0 <-- (commands[3] >> 0) & 65535;
    tokenIndex1 <-- (commands[3] >> 16) & 65535;
    
    for(var i=4; i<CommandArgs; i++) {
      commands[i] === 0;
    }

    // check tokenIndex0 != tokenIndex1
    assert(tokenIndex0 != tokenIndex1);
    
    component lt[2];
    // check tokenIndex0 < 2 ^ 10
    lt[0] = LessThan(16);
    lt[0].in[0] <== tokenIndex0;
    lt[0].in[1] <== 1024;
    lt[0].out === 1;

    // check tokenIndex1 < 2 ^ 10
    lt[1] = LessThan(16);
    lt[1].in[0] <== tokenIndex0;
    lt[1].in[1] <== 1024;
    lt[1].out === 1;

	// decompose pool index
	component ntb = Num2Bits(32);
	ntb.in <== dataPath[0];

    // check index of pool
    component pli = checkPoolLeafInfoIndex();
    for(var i=0; i<32; i++) {
        pli.index[i] <== ntb.out[i];
    }
    pli.poolIndex <== poolIndex;
    pli.res === 1; // true

    var TOKEN0_INFO_SELECTOR = 0;
    tokenInfo0 <-- dataPath[61+TOKEN0_INFO_SELECTOR];
    tokenInfo0 === 0;
    var TOKEN1_INFO_SELECTOR = 1;
    tokenInfo1 <-- dataPath[61+TOKEN1_INFO_SELECTOR];
    tokenInfo1 === 0;
    var TOKEN0_AMOUNT_SELECTOR = 2;
    var token0Amount = dataPath[61+TOKEN0_AMOUNT_SELECTOR];
    var TOKEN1_AMOUNT_SELECTOR = 2;
    var token1Amount = dataPath[61+TOKEN1_AMOUNT_SELECTOR];

    // generate new root hash
    var arr[4] = [tokenIndex0, tokenIndex1, 0, 0];
    component checkTreeRootHashComp = CheckTreeRootHash(1);
    for(var i=0; i<MaxTreeDataIndex; i++) {
        if(i>60 && i<65) {
            checkTreeRootHashComp.treeData[i] <== arr[i-61];
        } else {
            checkTreeRootHashComp.treeData[i] <== dataPath[i];
        }
    }

    newRootHash <== checkTreeRootHashComp.newRootHash;
}

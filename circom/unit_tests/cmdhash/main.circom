// TreeData: field[66], 0: index, 1 - 60: path digests, 61 - 64: leaf value, 65 - root hash
// Command: field[6], 0: op, 1: nonce, 2 - 3: 32bits args, 4 - 5: 252 bits args

include "../../../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../../utils/bit.circom";
include "../../../node_modules/circomlib/circuits/bitify.circom";

template CheckCommandHash(N) {
    var CommandArgs = 6;
    var ByteBits = 8;
    var CommandBytes = 81;

    var i, j;

    signal input commands[N][CommandArgs];
    signal input commandHash[2];
    signal commandBits[N * CommandBytes * ByteBits];
    signal output out;
    component bits = CommandBits(N);
    component sha2 = Sha256(N * CommandBytes * ByteBits);
    component low = Bits2Num(128);
    component high = Bits2Num(128);
    for (i=0; i<N; i++) {
        for (j=0; j<CommandArgs; j++) {
            bits.commands[i][j] <== commands[i][j];
        }
    }
    for (i=0; i<N*CommandBytes*ByteBits; i++) {
        log(bits.out[i]);
        sha2.in[i] <-- bits.out[i];
    }
    for (i=0; i<128; i++) {
        low.in[i] <== sha2.out[i];
    }
    for (i=0; i<128; i++) {
        high.in[i] <== sha2.out[128 + i];
    }
    log(commandHash[0]);
    log(commandHash[1]);
    log(high.out);
    log(low.out);
    commandHash[0] === high.out;
    commandHash[1] === low.out;
    log(134);
}

component main {public [commandHash, commands]} = CheckCommandHash(1);

pragma circom 2.0.2;

include "../../node_modules/circomlib/circuits/sha256/sha256.circom";
include "./command_to_bits.circom";

template CheckCommandsHash(N) {
    var CommandArgs = 6;
    var ByteBits = 8;
    var CommandBytes = 81;
    var CommandsBits = N * CommandBytes * ByteBits;

    signal input args[N][CommandArgs];
    signal input hash[2];
    signal output out;

    component c2b = Commands2Bits(N);

    for (var i = 0; i < N; i++) {
        for (var j = 0; j < CommandArgs; j++) {
            c2b.args[i][j] <== args[i][j];
        }
    }

    component sha2 = Sha256(CommandsBits);
    for (var i = 0; i < CommandsBits; i++) {
        sha2.in[i] <== c2b.out[i];
    }

    component low = Bits2NumBe(128);
    component high = Bits2NumBe(128);

    for (var i = 0; i < 128; i++) {
        low.in[i] <== sha2.out[i];
        high.in[i] <== sha2.out[128 + i];
    }

    hash[0] === low.out;
    hash[1] === high.out;

    out <== 1;
}

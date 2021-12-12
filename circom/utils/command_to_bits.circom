pragma circom 2.0.2;

include "./bit.circom";

template Command2Bits() {
    var CommandArgs = 6;
    var ByteBits = 8;
    var ArgBytesList[CommandArgs] = [1, 8, 4, 4, 32, 32];
    var CommandBits = 81 * ByteBits;

    signal input args[CommandArgs];
    signal output out[CommandBits];

    component c[CommandArgs];

    var offset = 0;
    for (var i = 0; i < CommandArgs; i++) {
        var bits = ArgBytesList[i] * ByteBits;
        c[i] = Num2BitsBe(bits);
        c[i].in <== args[i];
        for (var j = 0; j < bits; j++) {
            out[offset] <== c[i].out[j];
            offset++;
        }
    }
}

template Commands2Bits(N) {
    var CommandArgs = 6;
    var ByteBits = 8;
    var CommandBits = 81 * ByteBits;

    signal input args[N][CommandArgs];
    signal output out[N * CommandBits];

    component c[N];
    for (var i = 0; i < N; i++) {
        c[i] = Command2Bits();
        for (var j = 0; j < CommandArgs; j++) {
            c[i].args[j] <== args[i][j];
        }

        for (var j = 0; j < CommandBits; j++) {
            out[i * CommandBits + j] <== c[i].out[j];
        }
    }
}


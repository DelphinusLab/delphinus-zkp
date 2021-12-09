pragma circom 2.0.0;

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
    component low = Bits2NumEx(128);
    component high = Bits2NumEx(128);
    for (i=0; i<N; i++) {
        for (j=0; j<CommandArgs; j++) {
            bits.commands[i][j] <== commands[i][j];
        }
    }
    for (i=0; i<N*CommandBytes*ByteBits; i++) {
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
    commandHash[0] === low.out;
    commandHash[1] === high.out;
}

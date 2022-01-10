pragma circom 2.0.2;

include "../../node_modules/circomlib/circuits/bitify.circom";

template Num2BitsBe(N) {
    signal input in;
    signal output out[N];

    component c = Num2Bits(N);
    c.in <== in;

    for (var i = 0; i < N; i++) {
        out[i] <== c.out[N - i - 1];
    }
}

template Bits2NumBe(N) {
    signal input in[N];
    signal output out;

    component c = Bits2Num(N);
    for (var i = 0; i < N; i++) {
        c.in[i] <== in[N - i - 1];
    }

    out <== c.out;
}

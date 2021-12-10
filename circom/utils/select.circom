pragma circom 2.0.2;

template BiSelect() {
    signal input in[2];
    signal input cond;
    signal output out;
    component iszero = IsZero();
    iszero.in <== cond;
    out <== in[0] * iszero.out + in[1] * (1 - iszero.out);
}

template NSelect(N) {
    signal input in[N];
    signal input cond;
    signal output out;

    component c[N];

    var sum = 0;
    for (var i = 0; i < N; i++) {
        c[i] = IsZero();
        c[i].in <== cond - i;
        sum += c[i].out * in[i];
    }

    out <== sum;
}

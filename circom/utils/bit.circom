/* n bytes in bitwise format */
template BitOfBytes(n) {
    var ByteBits = 8;
    signal input in;
    signal output out[n * ByteBits];
    var lc1 = 0;

    var carry = 1;
    for (var i=0; i<n*4; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * carry;
        carry = carry + carry;
    }

    lc1 === in;
}

template Concatenate(N, L) {
    signal input in[N][L];
    signal output out[N*L];

    for (var i=0; i<N; i++) {
        for (var j=0; j<L; j++) {
            out[i*L + j] <== in[i][j];
        }
    }
}


template CommandBits(N) {
    var CommandArgs = 6;
    var ByteBits = 8;
    var CommandBytes = 81; /* 1, 8, 4, 4, 32, 32 */
    var i;
    var j;
    component c0[N];
    for (i=0; i<N; i++) { c0[i] = BitOfBytes(1);}
    component c1[N];
    for (i=0; i<N; i++) { c1[i] = BitOfBytes(8);}
    component c2[N];
    for (i=0; i<N; i++) { c2[i] = BitOfBytes(4);}
    component c3[N];
    for (i=0; i<N; i++) { c3[i] = BitOfBytes(4);}
    component c4[N];
    for (i=0; i<N; i++) { c4[i] = BitOfBytes(32);}
    component c5[N];
    for (i=0; i<N; i++) { c5[i] = BitOfBytes(32);}

    component concat = Concatenate(N, CommandBytes * ByteBits);


    signal input commands[N][CommandArgs];
    signal output out[N * CommandBytes * ByteBits];

    for (i=0; i<N; i++) {
        c0[i].in <== commands[i][0];
        c1[i].in <== commands[i][1];
        c2[i].in <== commands[i][2];
        c3[i].in <== commands[i][3];
        c4[i].in <== commands[i][4];
        c5[i].in <== commands[i][5];
    }

    var offset = 0;

    for (i=0; i<N; i++) {
        for (j=0; j<ByteBits; j++) {
            concat.in[i][j] <== c0[i].out[j];
            offset++;
        }
        for (j=0; j<ByteBits * 8; j++) {
            concat.in[i][offset] <== c1[i].out[j];
            offset++;
        }
        for (j=0; j<ByteBits * 4; j++) {
            concat.in[i][offset] <== c2[i].out[j];
            offset++;
        }
        for (j=0; j<ByteBits * 4; j++) {
            concat.in[i][offset] <== c3[i].out[j];
            offset++;
        }
        for (j=0; j<ByteBits * 32; j++) {
            concat.in[i][offset] <== c4[i].out[j];
            offset++;
        }
        for (j=0; j<ByteBits * 32; j++) {
            concat.in[i][offset] <== c5[i].out[j];
            offset++;
        }
    }

    for (i=0; i< N * CommandBytes * ByteBits; i++) {
        out[i] <== concat.out[i];
    }
}

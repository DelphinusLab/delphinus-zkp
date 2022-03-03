pragma circom 2.0.2;

include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/compconstant.circom";
include "../../node_modules/circomlib/circuits/escalarmulany.circom";
include "../../node_modules/circomlib/circuits/escalarmulfix.circom";
include "../../node_modules/circomlib/circuits/sha256/sha256.circom";
include "./command_to_bits.circom";

template PointCheck() {
    signal input x;
    signal input y;
    signal output out;

    signal x2;
    signal y2;

    var a = 168700;
    var d = 168696;

    x2 <== x * x;
    y2 <== y * y;

    component c = IsZero();
    c.in <== a * x2 + y2 - 1 - d * x2 * y2;
    out <== c.out;
}

template Point2Bits() {
    signal input in[2];
    signal output out[256];

    component n2bX = Num2Bits(254);
    n2bX.in <== in[0];

    component n2bY = Num2Bits(254);
    n2bY.in <== in[1];

    component signCalc = CompConstant(10944121435919637611123202872628637544274182200208017171849102093287904247808);
    for (var i = 0; i < 254; i++) {
        signCalc.in[i] <== n2bX.out[i];
    }

    for (var i = 0; i < 254; i++) {
        out[i] <== n2bY.out[i];
    }

    out[254] <== 0;
    out[255] <== signCalc.out;
}

template CheckSign(N) {
    signal input msg[N];
    signal input ax;
    signal input ay;
    signal input rx;
    signal input ry;
    signal input s;

    signal output out;

    signal t[2];

    component pointCheckA = PointCheck();
    pointCheckA.x <== ax;
    pointCheckA.y <== ay;
    
    component pointCheckR = PointCheck();
    pointCheckR.x <== rx;
    pointCheckR.y <== ry;

    t[0] <== pointCheckA.out * pointCheckR.out;

    component point2bitsA = Point2Bits();
    point2bitsA.in[0] <== ax;
    point2bitsA.in[1] <== ay;

    component point2bitsR = Point2Bits();
    point2bitsR.in[0] <== rx;
    point2bitsR.in[1] <== ry;

    component sha2 = Sha256(512 + N);
    for (var i = 0; i < 32; i++) {
        for (var j = 0; j < 8; j++) {
            sha2.in[i * 8 + j] <== point2bitsR.out[i * 8 + 7 - j];
            sha2.in[i * 8 + j + 256] <== point2bitsA.out[i * 8 + 7 - j];
        }
    }

    for (var i = 0; i < N; i++) {
        sha2.in[i + 512] <== msg[i];
    }

    /* left */
    var basepoint[2] = [
        5299619240641551281634865583518297030282874472190772894086521144482721001553,
        16950150798460657717958625567821834550301663161624707787222815936182638968203
    ];

    component num2bitsS = Num2Bits_strict();
    num2bitsS.in <== s;

    component mulFix = EscalarMulFix(254, basepoint);
    for (var i = 0; i < 254; i++) {
        mulFix.e[i] <== num2bitsS.out[i];
    }

    var leftx = mulFix.out[0];
    var lefty = mulFix.out[1];

    /* right */
    /* a * 8 */
    var ax8;
    var ay8;
    component dbl[3];
    {
        var x = ax;
        var y = ay;
        for (var i = 0; i < 3; i++) {
            dbl[i] = BabyDbl();
            dbl[i].x <== x;
            dbl[i].y <== y;
            x = dbl[i].xout;
            y = dbl[i].yout;
        }
        ax8 = x;
        ay8 = y;
    }

    /* a * 8 * h */
    component mul = EscalarMulAny(256);
    for (var i = 0; i < 32; i++) {
        for (var j = 0; j < 8; j++) {
            mul.e[i * 8 + j] <== sha2.out[i * 8 + 7 - j];
        }
    }
    mul.p[0] <== ax8;
    mul.p[1] <== ay8;

    component add = BabyAdd();
    add.x1 <== rx;
    add.y1 <== ry;
    add.x2 <== mul.out[0];
    add.y2 <== mul.out[1];

    var rightx = add.xout;
    var righty = add.yout;

    component xeq = IsEqual();
    xeq.in[0] <== leftx;
    xeq.in[1] <== rightx;

    component yeq = IsEqual();
    yeq.in[0] <== lefty;
    yeq.in[1] <== righty;

    t[1] <== yeq.out * xeq.out;
    
    out <== t[0] * t[1];
    // out <== 1;
}

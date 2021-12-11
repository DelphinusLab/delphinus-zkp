pragma circom 2.0.2;

include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/pointbits.circom";
include "../../node_modules/circomlib/circuits/escalarmulany.circom";
include "../../node_modules/circomlib/circuits/escalarmulfix.circom";
include "../../node_modules/circomlib/circuits/sha256/sha256.circom";
include "./command_to_bits.circom";

template CheckCommandSign() {
    var CommandArgs = 6;
    var ByteBits = 8;
    var CommandBytes = 81;
    var CommandsBits = CommandBytes * ByteBits;

    signal input args[CommandArgs];
    signal input ax;
    signal input ay;
    signal input rx;
    signal input ry;
    signal input s;

    signal output out;

    component babycheckA = BabyCheck();
    babycheckA.x <== ax;
    babycheckA.y <== ay;
    
    component babycheckR = BabyCheck();
    babycheckR.x <== rx;
    babycheckR.y <== ry;

    component point2bitsA = Point2Bits_Strict();
    point2bitsA.in[0] <== ax;
    point2bitsA.in[1] <== ay;

    component point2bitsR = Point2Bits_Strict();
    point2bitsR.in[0] <== rx;
    point2bitsR.in[1] <== ry;

    component sha2 = Sha256(512 + CommandsBits);
    for (var i = 0; i < 32; i++) {
        for (var j = 0; j < 8; j++) {
            sha2.in[i * 8 + j] <== point2bitsR.out[i * 8 + 7 - j];
            sha2.in[i * 8 + j + 256] <== point2bitsA.out[i * 8 + 7 - j];
        }
    }

    component c2b = Command2Bits();
    for (var i = 0; i < CommandArgs; i++) {
        c2b.args[i] <== args[i];
    }

    for (var i = 0; i < CommandsBits; i++) {
        sha2.in[i + 512] <== c2b.out[i];
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
    
    component isZero = IsZero();
    isZero.in <== ax8;
    isZero.out === 0;

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

    leftx === rightx;
    lefty === righty;

    out <== 1;
}

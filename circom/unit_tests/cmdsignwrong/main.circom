pragma circom 2.0.2;

include "../../utils/command_sign.circom";

template TestCheckCommandSign() {
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

    component ccs = CheckCommandSign();
    ccs.ax <== ax;
    ccs.ay <== ay;
    ccs.rx <== rx;
    ccs.ry <== ry;
    ccs.s <== s;

    for (var i = 0; i < CommandArgs; i++) {
        ccs.args[i] <== args[i];
    }

    ccs.out === 0;
}


component main = TestCheckCommandSign();

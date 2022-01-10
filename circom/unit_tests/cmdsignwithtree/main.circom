pragma circom 2.0.2;

include "../../utils/command_sign.circom";

template TestCheckCommandSignFromKeyPath() {
    var CommandArgs = 6;
    var ByteBits = 8;
    var CommandBytes = 81;
    var CommandsBits = CommandBytes * ByteBits;
    var MaxTreeDataIndex = 66;

    signal input sign[3];
    signal input keyPath[MaxTreeDataIndex];
    signal input args[CommandArgs];

    component ccs = CheckCommandSignFromKeyPath();
    
    for (var i = 0; i < 3; i++) {
        ccs.sign[i] <== sign[i];
    }
    
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        ccs.keyPath[i] <== keyPath[i];
    }

    for (var i = 0; i < CommandArgs; i++) {
        ccs.args[i] <== args[i];
    }

    ccs.signed === 1;
}


component main = TestCheckCommandSignFromKeyPath();

pragma circom 2.0.2;

include "./swap_aux.circom";
include "./eddsa_sha2.circom";
include "./merkle_tree.circom";
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

    component c2b = Command2Bits();
    for (var i = 0; i < CommandArgs; i++) {
        c2b.args[i] <== args[i];
    }

    component cs = CheckSign(CommandsBits);
    cs.ax <== ax;
    cs.ay <== ay;
    cs.rx <== rx;
    cs.ry <== ry;
    cs.s <== s;

    for (var i = 0; i < CommandsBits; i++) {
        cs.msg[i] <== c2b.out[i];
    }

    out <== cs.out;
}

template CheckCommandSignFromKeyPath() {
    var IndexOffset = 0;
    var LeafStartOffset = 61;
    var AxOffset = LeafStartOffset + 0;
    var AyOffset = LeafStartOffset + 1;
    var RootHashIndex = 65;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input sign[3];
    signal input keyPath[MaxTreeDataIndex];
    signal input args[CommandArgs];
    signal output signer;
    signal output signed;

    // 1. check the keyPath's validation
    component checkPath = CheckTreeRootHash(0);
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        checkPath.treeData[i] <== keyPath[i];
    }

    // 2. check the path index's validation
    component checkIndex = CheckAccountInfoIndexFE(0);
    checkIndex.index <== keyPath[IndexOffset];
    checkIndex.out === 1;

    component checkSign = CheckCommandSign();
    for (var i = 0; i < CommandArgs; i++) {
        checkSign.args[i] <== args[i];
    }
    checkSign.ax <== keyPath[AxOffset];
    checkSign.ay <== keyPath[AyOffset];
    checkSign.rx <== sign[0];
    checkSign.ry <== sign[1];
    checkSign.s <== sign[2];

    signed <== checkSign.out;
    signer <== checkIndex.caller;
}
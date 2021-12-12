pragma circom 2.0.0;
// TreeData: field[66], 0: index, 1 - 60: path digests, 61 - 64: leaf value, 65 - root hash
// Command: field[6], 0: op, 1: nonce, 2 - 3: 32bits args, 4 - 5: 252 bits args

include "command_run.circom"

component main {public [commandHash, startRootHash, endRootHash]}= CheckCommandsRun(1);

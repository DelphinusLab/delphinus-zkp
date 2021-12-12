pragma circom 2.0.2;

include "command_run.circom"

component main {public [commandHash, startRootHash, endRootHash]} = CheckCommandsRun(1);

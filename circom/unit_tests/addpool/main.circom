pragma circom 2.0.0;

include "../../business/addpool.circom";

component main {public [commands, dataPath]} = addpool(1);

pragma circom 2.0.0;

include "../../business/addpool.circom";
include "../../../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../../../node_modules/circomlib/circuits/poseidon.circom";
include "../../utils/select.circom";

component main {public [commands, dataPath]} = addpool();

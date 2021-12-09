pragma circom 2.0.0;

include "../../../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../../../node_modules/circomlib/circuits/poseidon.circom";
include "../../utils/bit.circom";
include "../../utils/select.circom";
include "../../utils/check_tree_root_hash.circom";

component main {public [treeData]} = CheckTreeRootHash(0);
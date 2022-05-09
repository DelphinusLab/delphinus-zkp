### Introduction
This directory includes code for unit test of substrate-node.

The file `genInput.ts` used `input/` to generate json files for substrate-node. The value of the object in `input/paths.json` is an array whose order is the execution order of the commands. The order must keep consistent with the order of the commands in substrate-node/pallets/swap/src/unit_tests/tests/.

### How to use SubstrateUnitTestingTool 
Run `bash test.sh` in substrate-node/pallets/swap/src/unit_tests/.

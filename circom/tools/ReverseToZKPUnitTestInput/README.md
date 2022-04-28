The file ReverseToZKPUnitTestInput.ts includes a function named reverseToZKPUnitTestInput to generate the file config.json as the input of zkp/circom/tools/UnitTestInputGenerator.
The file eventlog.json includes layer2 event log. It's the input file of reverseToZKPUnitTestInput.

## How to run reverseToZKPUnitTestInput
In zkp/circom/tools/ReverseToZKPUnitTestInput/, run:

```
npx tsc
node ../../../dist/circom/tools/ReverseToZKPUnitTestInput/ReverseToZKPUnitTestInput.js
```
The output file config.json will be generated in zkp/circom/tools/ReverseToZKPUnitTestInput/.

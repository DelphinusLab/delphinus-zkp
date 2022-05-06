npx tsc
node ../../../dist/circom/tools/EventLogTestTool/ReverseToZKPUnitTestInput.js eventlog.json
node ../../../dist/circom/tools/CircomTestTool/main.js ../EventLogTestTool/config.json $1
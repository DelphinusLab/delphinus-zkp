npx tsc
echo "Generating circom test tool input..."
node ../../../dist/circom/tools/EventLogTestTool/ReverseToZKPUnitTestInput.js eventlog.json
echo "Begin circom test..."
node ../../../dist/circom/tools/CircomTestTool/main.js ../EventLogTestTool/config.json $1
echo "Finish..."
npx tsc
node ../../dist/tests/generateSignPubKey.js
node ../../dist/tests/circom.test.js
mv ../input.setkey_account1_owner1.json ../unit_tests/setkey/input.json
mv ../input.addpool_account1_poolindex2.json ../unit_tests/addpool/input.json
rm ../input.json
bash unit_run_full.sh ${1}
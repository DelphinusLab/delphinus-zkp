### 1. Before using this tool
- Run `bash setup20.sh 23` if pot23_0000ptau，pot23_0001.ptau, pot23_final.ptau are not in circom folder. (Generate pot23_final.ptau will be time consuming and the size is more than 10GB. We can use `bash setup20.sh 20` to generate pot20_final.ptau instead, however, the script `pre_test.sh` under circom/tools/CircomTestTool need to be manully modified, in order to use pot20_final.ptau)

### 2. How to use EventLogTestTool
- In `zkp/circom/tools/EventLogTestTool/` folder, Run `bash eventLog_test.sh` to test config.json with correct paras only.

### 3. using rapidsnark to generate proof fater(option): 
- Install `rapidsnark` by runing `bash install_rapidsnark_linux.sh` under `zkcross-lerna` folder. 
- Then, you can run `bash eventLog_test.sh --rapidsnark` or `bash eventLog_test.sh -rs` to use rapidsnark to generate proof and should see all passed results. This command will use rapidsnark instead of snarkjs to generate proof.

### 4. How to check results
- Unit test results will be generated in `circom/unit_tests` folder called `Unit_Test_at_(UTC Time)`
- All the tested inputs will be stored in `Unit_Test_at_(UTC Time)/Test_input` folder
- All the operations' unit test results will be saved in `testedFiles` folder which include their `input.json`, `proof.json`, `public.json`, `witness.wtns`.
- Test document will be saved in `test_results.txt` file. Whether each test input pass their unit test and error messages will be shown in this document to help you locate the problem.

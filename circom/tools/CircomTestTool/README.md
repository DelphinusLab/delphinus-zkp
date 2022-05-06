### 1. Before using this tool
Run `bash setup20.sh 23` if pot23_0000ptau，pot23_0001.ptau, pot23_final.ptau are not in circom folder. (Generate pot23_final.ptau will be time consuming and the size is more than 10GB. We can use `bash setup20.sh 20` to generate pot20_final.ptau instead, however, the script `pre_test.sh` under circom/tools/CircomTestTool need to be manully modified, in order to use pot20_final.ptau)

### 2. Edit Config.json: obj format for each type of operation
> setkey:   {
                "op_name": "setkey",
                "callerAccountIndex":"~",
                "accountIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>addpool:   {
                "op_name": "addpool",
                "callerAccountIndex":"~",
                "tokenIndex0":"~",
                "tokenIndex1":"~",
                "poolIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>deposit:   {
                "op_name": "deposit",
                "callerAccountIndex":"~",
                "accountIndex": "~",
                "tokenIndex": "~",
                "amount": "~",
                "msg": "~",
                "derive_key": "~"
            }

>depositNFT:{
                "op_name": "deposit_nft",
                "callerAccountIndex":"~",
                "accountIndex":"~",
                "owner":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>bidNFT:    {
                "op_name": "bid_nft",
                "callerAccountIndex":"~",
                "accountIndex":"~",
                "bidder":"~",
                "biddingAmount":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>transferNFT: {
                "op_name": "transfer_nft",
                "callerAccountIndex":"~",
                "accountIndex":"~",
                "owner":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"  
              }

>finalizeNFT: {
                "op_name": "finalize_nft",
                "callerAccountIndex":"~",
                "accountIndex":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
              }

>withdrawNFT: {
                "op_name": "withdraw_nft",
                "callerAccountIndex":"~",
                "accountIndex":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
              }

>withdraw:    {
                "op_name": "withdraw",
                "callerAccountIndex":"~",
                "accountIndex":"~",
                "tokenIndex":"~",
                "amount":"~",
                "msg":"~",
                "derive_key":"~"
              }

>supply:      {
                "op_name": "supply",
                "callerAccountIndex":"~",
                "accountIndex":"~",
                "poolIndex":"~",
                "amount0":"~",
                "amount1":"~",
                "msg":"~",
                "derive_key":"~"
              }

>retrieve:    {
                "op_name": "retrieve",
                "callerAccountIndex":"~",
                "accountIndex":"~",
                "poolIndex":"~",
                "amount0":"~",
                "amount1":"~",
                "msg":"~",
                "derive_key":"~"
              }

>swap:        {
                "op_name": "swap",
                "callerAccountIndex":"~",
                "accountIndex":"~",
                "poolIndex":"~",
                "reverse":"~",
                "amount":"~",
                "msg":"~",
                "derive_key":"~"
              }

### 3. run command: 
- Run `bash unit_test.sh` to test config.json with correct paras only.
- Change `config.json` to the json files that with errors in `unit_test.sh` if you want to test them. (All kinds of configs with error are in `examples` folder)

### 4. using rapidsnark to generate proof fater(option): 
- Install `rapidsnark` by runing `bash install_rapidsnark_linux.sh` under `delphinus-lerna` folder. 
- Then, you can run `bash unit_test.sh --rapidsnark` or `bash unit_test.sh -rs` to use rapidsnark to generate proof and should see all passed results. This command will use rapidsnark instead of snarkjs to generate proof.

### 5. How to check results
- Unit test results will be generated in `circom/unit_tests` folder called `Unit_Test_at_(UTC Time)`
- All the tested inputs will be stored in `Unit_Test_at_(UTC Time)/Test_input` folder
- All the operations' unit test results will be saved in `testedFiles` folder which include their `input.json`, `proof.json`, `public.json`, `witness.wtns`.
- Test document will be saved in `test_results.txt` file. Whether each test input pass their unit test and error messages will be shown in this document to help you locate the problem.
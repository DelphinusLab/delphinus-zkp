### 1. Before using this tool
Run `bash setup20.sh 20` if pot20_0000ptau，pot20_0001.ptau, pot20_final.ptau are not in circom folder.

### 2. Edit Config.json: obj format for each type of operation
> setkey:   {
                "op_name": "setkey",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>addpool:   {
                "op_name": "addpool",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "tokenIndex0":"~",
                "tokenIndex1":"~",
                "poolIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>deposit:   {
                "op_name": "deposit",
                "calleraccountIndex":"~",
                "accountIndex": "~",
                "tokenIndex": "~",
                "amount": "~",
                "msg": "~",
                "derive_key": "~"
            }

>depositNFT:{
                "op_name": "deposit_nft",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "owner":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>bidNFT:    {
                "op_name": "bid_nft",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "bidder":"~",
                "biddingAmount":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>transferNFT: {
                "op_name": "transfer_nft",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "owner":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"  
              }

>finalizeNFT: {
                "op_name": "finalize_nft",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
              }

>withdrawNFT: {
                "op_name": "withdraw_nft",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
              }

>withdraw:    {
                "op_name": "withdraw",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "tokenIndex":"~",
                "amount":"~",
                "msg":"~",
                "derive_key":"~"
              }

>supply:      {
                "op_name": "supply",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "poolIndex":"~",
                "amount0":"~",
                "amount1":"~",
                "msg":"~",
                "derive_key":"~"
              }

>retrieve:    {
                "op_name": "retrieve",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "poolIndex":"~",
                "amount0":"~",
                "amount1":"~",
                "msg":"~",
                "derive_key":"~"
              }

>swap:        {
                "op_name": "swap",
                "calleraccountIndex":"~",
                "accountIndex":"~",
                "poolIndex":"~",
                "reverse":"~",
                "amount":"~",
                "msg":"~",
                "derive_key":"~"
              }

### 3. run command: 
> bash circom_test.sh
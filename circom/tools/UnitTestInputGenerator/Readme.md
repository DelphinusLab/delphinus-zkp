### 1. Before using this tool
Make sure each relevent operation folder in unit_tests are clean (only main.circom)

### 2. Edit Config.json: obj format for each type of operation
> setkey:   {
                "op_name": "setkey",
                "accountIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>addpool:   {
                "op_name": "addpool",
                "accountIndex":"~",
                "tokenIndex0":"~",
                "tokenIndex1":"~",
                "poolIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>deposit:   {
                "op_name": "deposit",
                "accountIndex": "~",
                "tokenIndex1": "~",
                "tokenIndex1amount": "~",
                "msg": "~",
                "derive_key": "~"
            }

>depositNFT:{
                "op_name": "deposit_nft",
                "accountIndex":"~",
                "owner":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>bidNFT:    {
                "op_name": "bid_nft",
                "accountIndex":"~",
                "bidder":"~",
                "biddingAmount":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
            }

>transferNFT: {
                "op_name": "transfer_nft",
                "accountIndex":"~",
                "owner":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"  
              }

>finalizeNFT: {
                "op_name": "finalize_nft",
                "accountIndex":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
              }

>withdrawNFT: {
                "op_name": "withdraw_nft",
                "accountIndex":"~",
                "nftIndex":"~",
                "msg":"~",
                "derive_key":"~"
              }

### 3. run command: 
> bash circom_test.sh ${path of config.json}
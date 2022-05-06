import fs from "fs-extra";

type logType = {
    "_id": string,
    "rid": string,
    "command": number,
    "args": string[]
}

type configType = {
    "_COMMENT": string,
    "Ops": {[key: string]: string}[]
}

let keys = [
    [
        "deposit",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "tokenIndex",
        "amount",
        "l1_tx_hash",
        "callerAccountIndex"
    ],
    [
        "withdraw",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "tokenIndex",
        "amount",
        "l1address",
    ],
    [
        "swap",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "poolIndex",
        "reverse",
        "amount",
    ],
    [
        "retrieve",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "poolIndex",
        "amount0",
        "amount1",
    ],
    [
        "supply",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "poolIndex",
        "amount0",
        "amount1",
    ],
    [
        "addpool",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "tokenIndex0",
        "tokenIndex1",
        "reserved",
        "reserved",
        "poolIndex",
        "callerAccountIndex"
    ],
    [
        "setkey",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "reserved",
        "ax",
        "ay"
    ],
    [
        "deposit_nft",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "nftIndex",
        "l1_tx_hash",
        "reserved",
        "callerAccountIndex"
    ],
    [
        "withdraw_nft",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "nftIndex",
        "l1account",
        "reserved"
    ],
    [
        "transfer_nft",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "nftIndex",
        "new_owner_accountIndex"
    ],
    [
        "bid_nft",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "nftIndex",
        "biddingAmount",
        "reserved"
    ],
    [
        "finalize_nft",
        "sign_rx",
        "sign_ry",
        "sign_s",
        "nonce",
        "accountIndex",
        "nftIndex",
        "reserved",
        "reserved"
    ]
]

function reverseToZKPUnitTestInput(log: logType) {
    let config: {[key: string]: string} = {};
    let key = keys[log.command];

    config["op_name"] = key[0];

    for(let i=1; i<=log.args.length; i++) {
        if(key[i] != "reserved") {
            config[key[i]] = log.args[i-1];
        }
    }

    if(log.command != 0 && log.command != 5 && log.command != 7) {
        config["callerAccountIndex"] = log.args[4];
    }

    return config;
}

module.exports = reverseToZKPUnitTestInput;

async function runReverseToZKPUnitTestInput() {
  try {
    let configs: configType = {
        "_COMMENT": "All ops should pass their unit test",
        "Ops": []
    }

    // const logs = await fs.readJson("./eventlog.json");
    const logs = await fs.readJson(process.argv[2]);

    logs.forEach((log: logType) => {
        let config = reverseToZKPUnitTestInput(log);
        configs["Ops"].push(config || {});
    })

    try {
      await fs.writeFile("./config.json", JSON.stringify(configs, null, 4));
    } catch(err) {
      console.error("WriteFile Error: " + err);
    }
  } catch(err) {
    console.log("ReadJson Error: " + err);
  }
}

runReverseToZKPUnitTestInput();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.L2Storage = exports.getShareStoreIndex = exports.getBalanceStoreIndex = exports.getPoolStoreIndex = exports.Index = exports.StoreNameSpace = exports.Command = exports.CommandOp = void 0;
const field_1 = require("delphinus-curves/src/field");
const markle_tree_1 = require("delphinus-curves/src/markle-tree");
var CommandOp;
(function (CommandOp) {
    CommandOp[CommandOp["Deposit"] = 0] = "Deposit";
    CommandOp[CommandOp["Withdraw"] = 1] = "Withdraw";
    CommandOp[CommandOp["Swap"] = 2] = "Swap";
    CommandOp[CommandOp["Supply"] = 3] = "Supply";
    CommandOp[CommandOp["Retrieve"] = 4] = "Retrieve";
    CommandOp[CommandOp["AddPool"] = 5] = "AddPool";
    CommandOp[CommandOp["AddToken"] = 7] = "AddToken";
})(CommandOp = exports.CommandOp || (exports.CommandOp = {}));
;
class Command {
    constructor(args) {
        this.args = args.concat(Array(8).fill(new field_1.Field(0))).slice(0, 8);
    }
    run(storage) {
        throw new Error('Not Implemented yet');
    }
}
exports.Command = Command;
var StoreNameSpace;
(function (StoreNameSpace) {
    StoreNameSpace[StoreNameSpace["BalanceStore"] = 0] = "BalanceStore";
    StoreNameSpace[StoreNameSpace["PoolStore"] = 1] = "PoolStore";
    StoreNameSpace[StoreNameSpace["ShareStore"] = 2] = "ShareStore";
})(StoreNameSpace = exports.StoreNameSpace || (exports.StoreNameSpace = {}));
class Index {
    constructor(poolIndex) {
        if (poolIndex < 0 || poolIndex >= 1024) {
            throw new Error(`Bad pool index: ${poolIndex}`);
        }
        this.poolIndex = poolIndex;
    }
    get index() {
        return (StoreNameSpace.PoolStore << 30) | (this.poolIndex << 20);
    }
}
exports.Index = Index;
function getPoolStoreIndex(poolIndex) {
    return (StoreNameSpace.PoolStore << 30) | (poolIndex << 20);
}
exports.getPoolStoreIndex = getPoolStoreIndex;
function getBalanceStoreIndex(accountIndex, tokenIndex) {
    return (StoreNameSpace.BalanceStore << 30) | (accountIndex << 10) | tokenIndex;
}
exports.getBalanceStoreIndex = getBalanceStoreIndex;
function getShareStoreIndex(accountIndex, poolIndex) {
    return (StoreNameSpace.ShareStore << 30) | (accountIndex << 10) | poolIndex;
}
exports.getShareStoreIndex = getShareStoreIndex;
class L2Storage extends markle_tree_1.MarkleTree {
    getPoolToken0Info(index) {
        return this.get(index + 0);
    }
    getPoolToken1Info(index) {
        return this.get(index + 1);
    }
    getPoolToken0Amount(index) {
        return this.get(index + 2);
    }
    getPoolToken1Amount(index) {
        return this.get(index + 3);
    }
}
exports.L2Storage = L2Storage;

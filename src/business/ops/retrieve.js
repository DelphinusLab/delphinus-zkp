"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrieveCommand = void 0;
const field_1 = require("delphinus-curves/src/field");
const command_1 = require("../command");
class RetrieveCommand extends command_1.Command {
    run(storage) {
        const path = [];
        const account = this.args[3];
        const pool = this.args[4];
        const amount0 = this.args[5];
        const amount1 = this.args[6];
        const nonce = this.args[7];
        const index0 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), 2);
        path.push(storage.getPath(index0));
        storage.set(index0, nonce.add(new field_1.Field(1)));
        const index1 = (0, command_1.getPoolStoreIndex)(pool.v.toNumber());
        path.push(storage.getPath(index1));
        const poolInfo = storage.getLeaves(index1);
        poolInfo[2] = poolInfo[2].sub(amount0);
        poolInfo[3] = poolInfo[3].sub(amount1);
        storage.setLeaves(index1, poolInfo);
        const index2 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), poolInfo[0].v.toNumber());
        path.push(storage.getPath(index2));
        const balance0 = storage.get(index2);
        storage.set(index2, balance0.add(amount0));
        const index3 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), poolInfo[1].v.toNumber());
        path.push(storage.getPath(index3));
        const balance1 = storage.get(index3);
        storage.set(index3, balance1.add(amount1));
        const index4 = (0, command_1.getShareStoreIndex)(account.v.toNumber(), pool.v.toNumber());
        path.push(storage.getPath(index4));
        const share = storage.get(index4);
        storage.set(index4, share.sub(amount0).sub(amount1));
        return path;
    }
}
exports.RetrieveCommand = RetrieveCommand;

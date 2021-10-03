"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplyCommand = void 0;
const field_1 = require("delphinus-curves/src/field");
const command_1 = require("../command");
class SupplyCommand extends command_1.Command {
    async run(storage) {
        const path = [];
        const account = this.args[3];
        const pool = this.args[4];
        const amount0 = this.args[5];
        const amount1 = this.args[6];
        const nonce = this.args[7];
        const index0 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), 2);
        path.push(await storage.getPath(index0));
        await storage.setLeave(index0, nonce.add(new field_1.Field(1)));
        const index1 = (0, command_1.getPoolStoreIndex)(pool.v.toNumber());
        path.push(await storage.getPath(index1));
        const poolInfo = await storage.getLeaves(index1);
        poolInfo[2] = poolInfo[2].add(amount0);
        poolInfo[3] = poolInfo[3].add(amount1);
        await storage.setLeaves(index1, poolInfo);
        const index2 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), poolInfo[0].v.toNumber());
        path.push(await storage.getPath(index2));
        const balance0 = await storage.getLeave(index2);
        await storage.setLeave(index2, balance0.sub(amount0));
        const index3 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), poolInfo[1].v.toNumber());
        path.push(await storage.getPath(index3));
        const balance1 = await storage.getLeave(index3);
        await storage.setLeave(index3, balance1.sub(amount1));
        const index4 = (0, command_1.getShareStoreIndex)(account.v.toNumber(), pool.v.toNumber());
        path.push(await storage.getPath(index4));
        const share = await storage.getLeave(index4);
        await storage.setLeave(index4, share.add(amount0).add(amount1));
        return path;
    }
}
exports.SupplyCommand = SupplyCommand;

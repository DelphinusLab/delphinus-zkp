"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapCommand = void 0;
const field_1 = require("delphinus-curves/src/field");
const command_1 = require("../command");
class SwapCommand extends command_1.Command {
    async run(storage) {
        const path = [];
        const account = this.args[3];
        const pool = this.args[4];
        const amount = this.args[5];
        const direction = this.args[6];
        const nonce = this.args[7];
        const index0 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), 2);
        path.push(await storage.getPath(index0));
        await storage.setLeave(index0, nonce.add(new field_1.Field(1)));
        const index1 = (0, command_1.getPoolStoreIndex)(pool.v.toNumber());
        path.push(await storage.getPath(index1));
        const poolInfo = await storage.getLeaves(index1);
        poolInfo[2] = direction.v.eqn(0) ? poolInfo[2].add(amount) : poolInfo[2].sub(amount);
        poolInfo[3] = !direction.v.eqn(0) ? poolInfo[3].add(amount) : poolInfo[3].sub(amount);
        await storage.setLeaves(index1, poolInfo);
        const index2 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), poolInfo[0].v.toNumber());
        path.push(await storage.getPath(index2));
        const balance0 = await storage.getLeave(index2);
        await storage.setLeave(index2, direction.v.eqn(0) ? balance0.sub(amount) : balance0.add(amount));
        const index3 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), poolInfo[1].v.toNumber());
        path.push(await storage.getPath(index3));
        const balance1 = await storage.getLeave(index3);
        await storage.setLeave(index3, !direction.v.eqn(0) ? balance1.sub(amount) : balance1.add(amount));
        return path;
    }
}
exports.SwapCommand = SwapCommand;

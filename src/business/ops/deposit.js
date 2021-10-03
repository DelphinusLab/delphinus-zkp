"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositCommand = void 0;
const command_1 = require("../command");
class DepositCommand extends command_1.Command {
    async run(storage) {
        const path = [];
        const account = this.args[0];
        const token = this.args[1];
        const amount = this.args[2];
        const index = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), token.v.toNumber());
        path.push(await storage.getPath(index));
        const balance = await storage.getLeave(index);
        await storage.setLeave(index, balance.add(amount));
        return path;
    }
}
exports.DepositCommand = DepositCommand;

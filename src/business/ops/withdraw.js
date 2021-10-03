"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawCommand = void 0;
const field_1 = require("delphinus-curves/src/field");
const command_1 = require("../command");
class WithdrawCommand extends command_1.Command {
    async run(storage) {
        const path = [];
        const account = this.args[3];
        const token = this.args[4];
        const amount = this.args[5];
        const nonce = this.args[7];
        const index0 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), 2);
        path.push(await storage.getPath(index0));
        await storage.setLeave(index0, nonce.add(new field_1.Field(1)));
        const index1 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), token.v.toNumber());
        path.push(await storage.getPath(index1));
        const balance = await storage.getLeave(index1);
        await storage.setLeave(index1, balance.sub(amount));
        return path;
    }
}
exports.WithdrawCommand = WithdrawCommand;

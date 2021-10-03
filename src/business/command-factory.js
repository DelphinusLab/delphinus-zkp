"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommand = void 0;
const command_1 = require("./command");
const addpool_1 = require("./ops/addpool");
const deposit_1 = require("./ops/deposit");
const retrieve_1 = require("./ops/retrieve");
const supply_1 = require("./ops/supply");
const swap_1 = require("./ops/swap");
const withdraw_1 = require("./ops/withdraw");
function createCommand(op, args) {
    if (op.v.eqn(command_1.CommandOp.Deposit)) {
        return new deposit_1.DepositCommand(args);
    }
    if (op.v.eqn(command_1.CommandOp.Withdraw)) {
        return new withdraw_1.WithdrawCommand(args);
    }
    if (op.v.eqn(command_1.CommandOp.Swap)) {
        return new swap_1.SwapCommand(args);
    }
    if (op.v.eqn(command_1.CommandOp.Supply)) {
        return new supply_1.SupplyCommand(args);
    }
    if (op.v.eqn(command_1.CommandOp.Retrieve)) {
        return new retrieve_1.RetrieveCommand(args);
    }
    if (op.v.eqn(command_1.CommandOp.AddPool)) {
        return new addpool_1.AddPoolCommand(args);
    }
    throw new Error('Not implemented yet');
}
exports.createCommand = createCommand;

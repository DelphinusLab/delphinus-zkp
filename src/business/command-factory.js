"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommand = void 0;
var command_1 = require("./command");
var addpool_1 = require("./ops/addpool");
var addtoken_1 = require("./ops/addtoken");
var deposit_1 = require("./ops/deposit");
var retrieve_1 = require("./ops/retrieve");
var supply_1 = require("./ops/supply");
var swap_1 = require("./ops/swap");
var withdraw_1 = require("./ops/withdraw");
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
    if (op.v.eqn(command_1.CommandOp.AddToken)) {
        return new addtoken_1.AddTokenCommand(args);
    }
    throw new Error('Not implemented yet');
}
exports.createCommand = createCommand;

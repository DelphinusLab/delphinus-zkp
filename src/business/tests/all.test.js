"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const field_1 = require("delphinus-curves/src/field");
const command_1 = require("../command");
const main_1 = require("../main");
const storage = new command_1.L2Storage();
async function main() {
    const _0 = await (0, main_1.runZkp)(new field_1.Field(command_1.CommandOp.AddPool), [new field_1.Field(0), new field_1.Field(4), new field_1.Field(5)], storage);
    const _1 = await (0, main_1.runZkp)(new field_1.Field(command_1.CommandOp.Deposit), [new field_1.Field(0), new field_1.Field(4), new field_1.Field(100)], storage);
    const _2 = await (0, main_1.runZkp)(new field_1.Field(command_1.CommandOp.Deposit), [new field_1.Field(0), new field_1.Field(5), new field_1.Field(100)], storage);
    const _3 = await (0, main_1.runZkp)(new field_1.Field(command_1.CommandOp.Supply), [
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(10),
        new field_1.Field(10),
        new field_1.Field(0),
    ], storage);
    const _4 = await (0, main_1.runZkp)(new field_1.Field(command_1.CommandOp.Swap), [
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(5),
        new field_1.Field(0),
        new field_1.Field(1),
    ], storage);
    const _5 = await (0, main_1.runZkp)(new field_1.Field(command_1.CommandOp.Retrieve), [
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(15),
        new field_1.Field(5),
        new field_1.Field(2),
        new field_1.Field(0),
    ], storage);
    const _6 = await (0, main_1.runZkp)(new field_1.Field(command_1.CommandOp.Withdraw), [
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(4),
        new field_1.Field(100),
        new field_1.Field(0xdeadbeaf),
        new field_1.Field(3),
    ], storage);
    const _7 = await (0, main_1.runZkp)(new field_1.Field(command_1.CommandOp.Withdraw), [
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(5),
        new field_1.Field(100),
        new field_1.Field(0xdeadbeaf),
        new field_1.Field(4),
    ], storage);
}
main();

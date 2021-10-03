"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const field_1 = require("delphinus-curves/src/field");
const command_1 = require("../command");
const main_1 = require("../main");
const child_process_1 = require("child_process");
const storage = new command_1.L2Storage();
async function testInput(data) {
    console.log(`zokrates compute-witness -a ${data.slice(0, 10).map((f) => f.v.toString(10)).join(" ")} ...`);
    return new Promise((resolve, reject) => (0, child_process_1.exec)(`zokrates compute-witness -a ${data.map((f) => f.v.toString(10)).join(" ")}`, (error, stdout, stderr) => {
        console.log('stdout\n', stdout);
        if (error) {
            //console.log(error);
            reject(error);
            return;
        }
        //console.log('error\n', error);
        //console.log('stderr\n', stderr);
        resolve(undefined);
    }));
}
async function main() {
    const _0 = await (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.AddPool), [
        new field_1.Field(0),
        new field_1.Field(4),
        new field_1.Field(5)
    ], storage);
    const _1 = await (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Deposit), [
        new field_1.Field(0),
        new field_1.Field(4),
        new field_1.Field(100)
    ], storage);
    const _2 = await (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Deposit), [
        new field_1.Field(0),
        new field_1.Field(5),
        new field_1.Field(100)
    ], storage);
    const _3 = await (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Supply), [
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(10),
        new field_1.Field(10),
        new field_1.Field(0)
    ], storage);
    const _4 = await (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Swap), [
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(5),
        new field_1.Field(0),
        new field_1.Field(1)
    ], storage);
    const _5 = await (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Retrieve), [
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(15),
        new field_1.Field(5),
        new field_1.Field(2),
        new field_1.Field(0)
    ], storage);
    const _6 = await (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Withdraw), [
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(4),
        new field_1.Field(100),
        new field_1.Field(3),
        new field_1.Field(0)
    ], storage);
    const _7 = await (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Withdraw), [
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(0),
        new field_1.Field(5),
        new field_1.Field(100),
        new field_1.Field(4)
    ], storage);
    await testInput(_0);
    await testInput(_1);
    await testInput(_2);
    await testInput(_3);
    await testInput(_4);
    await testInput(_5);
    await testInput(_6);
    await testInput(_7);
}
main();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var field_1 = require("delphinus-curves/src/field");
var command_1 = require("../command");
var main_1 = require("../main");
var child_process_1 = require("child_process");
var storage = new command_1.L2Storage();
var _0 = (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.AddPool), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(4),
    new field_1.Field(5)
], storage);
var _1 = (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Deposit), [
    new field_1.Field(0),
    new field_1.Field(4),
    new field_1.Field(100)
], storage);
var _2 = (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Deposit), [
    new field_1.Field(0),
    new field_1.Field(5),
    new field_1.Field(100)
], storage);
var _3 = (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Supply), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(10),
    new field_1.Field(10),
    new field_1.Field(0)
], storage);
var data = (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Swap), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(5),
    new field_1.Field(0),
    new field_1.Field(1)
], storage);
console.log("zokrates compute-witness -a " + data.map(function (f) { return f.v.toString(10); }).join(" "));
(0, child_process_1.exec)("zokrates compute-witness -a " + data.map(function (f) { return f.v.toString(10); }).join(" "), {
    cwd: "/home/shindar/Projects/delphinus/delphinus-zkp"
}, function (error, stdout, stderr) {
    //console.log('error\n', error);
    console.log('stdout\n', stdout);
    //console.log('stderr\n', stderr);
});

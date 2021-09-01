"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var field_1 = require("delphinus-curves/src/field");
var command_1 = require("../command");
var main_1 = require("../main");
var child_process_1 = require("child_process");
/*
const data = genZKPInput(
  new Field(CommandOp.AddPool),
  [
    new Field(0),
    new Field(0),
    new Field(4),
    new Field(5)
  ],
  new L2Storage()
);
*/
var data = (0, main_1.genZKPInput)(new field_1.Field(command_1.CommandOp.Deposit), [
    new field_1.Field(0),
    new field_1.Field(4),
    new field_1.Field(100)
], new command_1.L2Storage());
console.log("zokrates compute-witness -a " + data.map(function (f) { return f.v.toString(10); }).join(" "));
(0, child_process_1.exec)("zokrates compute-witness -a " + data.map(function (f) { return f.v.toString(10); }).join(" "), {
    cwd: "/home/shindar/Projects/delphinus/delphinus-zkp"
}, function (error, stdout, stderr) {
    console.log('error\n', error);
    console.log('stdout\n', stdout);
    console.log('stderr\n', stderr);
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runZkp = exports.genZKPInput = exports.shaCommand = void 0;
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const bn_js_1 = __importDefault(require("bn.js"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = require("child_process");
const field_1 = require("delphinus-curves/src/field");
const markle_tree_1 = require("delphinus-curves/src//markle-tree");
const command_factory_1 = require("./command-factory");
class ZKPInputBuilder {
    constructor() {
        this.inputs = [];
    }
    push(data) {
        if (data instanceof field_1.Field) {
            this.inputs.push(data);
        }
        else {
            this.inputs = this.inputs.concat(data);
        }
    }
    _pushPathInfo(pathInfo) {
        this.push(pathInfo.root);
        for (let i = 0; i < 32; i++) {
            this.push(new field_1.Field((pathInfo.index >> (31 - i)) & 1));
        }
        for (let i = 0; i < markle_tree_1.MaxHeight; i++) {
            this.push(pathInfo.pathDigests[i].slice(0, 4));
        }
    }
    async pushPathInfo(pathInfoList, storage) {
        for (const pathInfo of pathInfoList) {
            this._pushPathInfo(pathInfo);
        }
        for (let i = 0; i < 5 - pathInfoList.length; i++) {
            this._pushPathInfo(await storage.getPath(0));
        }
    }
    pushCommand(op, command) {
        this.push(op);
        this.push(command.args);
    }
    async pushRootHash(storage) {
        this.push(await storage.getRoot());
    }
}
function shaCommand(op, command) {
    const data = [new field_1.Field(0), op]
        .concat(command.args)
        .map((x) => {
        return x.v.toBuffer("be", 32).toString("hex");
    })
        .join("");
    const hvalue = (0, sha256_1.default)(enc_hex_1.default.parse(data)).toString();
    return [
        new field_1.Field(new bn_js_1.default(hvalue.slice(0, 32), "hex", "be")),
        new field_1.Field(new bn_js_1.default(hvalue.slice(32, 64), "hex", "be")),
    ];
}
exports.shaCommand = shaCommand;
async function genZKPInput(op, args, storage) {
    const builder = new ZKPInputBuilder();
    const command = (0, command_factory_1.createCommand)(op, args);
    const shaValue = shaCommand(op, command);
    builder.push(shaValue);
    builder.push(await storage.getRoot());
    builder.pushCommand(op, command);
    const pathInfo = await command.run(storage);
    await builder.pushPathInfo(pathInfo, storage);
    await builder.pushRootHash(storage);
    return builder.inputs;
}
exports.genZKPInput = genZKPInput;
async function runZkp(op, args, storage, runProof = true) {
    const data = await genZKPInput(op, args, storage);
    if (!runProof) {
        return;
    }
    console.log(`zokrates compute-witness -a ${data
        .slice(0, 11)
        .map((f) => f.v.toString(10))
        .join(" ")} ...`);
    await new Promise((resolve, reject) => (0, child_process_1.exec)(`zokrates compute-witness -a ${data
        .map((f) => f.v.toString(10))
        .join(" ")}`, {
        cwd: path_1.default.resolve(__dirname, "..", ".."),
    }, (error, stdout, stderr) => {
        console.log("stdout\n", stdout);
        if (error) {
            reject(error);
            return;
        }
        resolve(undefined);
    }));
    console.log("zokrates generate-proof ...");
    await new Promise((resolve, reject) => (0, child_process_1.exec)("zokrates generate-proof", {
        cwd: path_1.default.resolve(__dirname, "..", ".."),
    }, (error, stdout, stderr) => {
        console.log("stdout\n", stdout);
        if (error) {
            reject(error);
            return;
        }
        resolve(undefined);
    }));
    const proof = await fs_extra_1.default.readJson(path_1.default.resolve(__dirname, "..", "..", "proof.json"));
    console.log(JSON.stringify(proof));
    return proof.proof.a
        .concat(proof.proof.b[0])
        .concat(proof.proof.b[1])
        .concat(proof.proof.c)
        .concat(proof.inputs);
}
exports.runZkp = runZkp;

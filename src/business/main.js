"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genZKPInput = exports.shaCommand = void 0;
var sha256_1 = __importDefault(require("crypto-js/sha256"));
var enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
var bn_js_1 = __importDefault(require("bn.js"));
var field_1 = require("delphinus-curves/src/field");
var markle_tree_1 = require("delphinus-curves/src//markle-tree");
var command_factory_1 = require("./command-factory");
var ZKPInputBuilder = /** @class */ (function () {
    function ZKPInputBuilder() {
        this.inputs = [];
    }
    ZKPInputBuilder.prototype.push = function (data) {
        if (data instanceof field_1.Field) {
            this.inputs.push(data);
        }
        else {
            this.inputs = this.inputs.concat(data);
        }
    };
    ZKPInputBuilder.prototype._pushPathInfo = function (pathInfo) {
        this.push(pathInfo.root);
        for (var i = 0; i < 32; i++) {
            this.push(new field_1.Field((pathInfo.index >> (31 - i)) & 1));
        }
        for (var i = 0; i < markle_tree_1.MaxHeight; i++) {
            this.push(pathInfo.pathDigests[i].slice(0, 4));
        }
    };
    ZKPInputBuilder.prototype.pushPathInfo = function (pathInfoList, storage) {
        for (var _i = 0, pathInfoList_1 = pathInfoList; _i < pathInfoList_1.length; _i++) {
            var pathInfo = pathInfoList_1[_i];
            this._pushPathInfo(pathInfo);
        }
        for (var i = 0; i < 5 - pathInfoList.length; i++) {
            this._pushPathInfo(storage.getPath(0));
        }
    };
    ZKPInputBuilder.prototype.pushCommand = function (op, command) {
        this.push(op);
        //console.log(command.args);
        this.push(command.args);
    };
    ZKPInputBuilder.prototype.pushRootHash = function (storage) {
        this.push(storage.root.value);
    };
    return ZKPInputBuilder;
}());
function shaCommand(op, command) {
    var data = [op].concat(command.args).concat([new field_1.Field(0)]).map(function (x) { return x.v.toString('hex', 64); }).join('');
    var hvalue = (0, sha256_1.default)(enc_hex_1.default.parse(data)).toString();
    return [
        new field_1.Field(new bn_js_1.default(hvalue.slice(0, 32), 'hex')),
        new field_1.Field(new bn_js_1.default(hvalue.slice(32, 64), 'hex'))
    ];
}
exports.shaCommand = shaCommand;
function genZKPInput(op, args, storage) {
    var builder = new ZKPInputBuilder();
    var command = (0, command_factory_1.createCommand)(op, args);
    var shaValue = shaCommand(op, command);
    builder.push(shaValue);
    builder.pushCommand(op, command);
    var pathInfo = command.run(storage);
    builder.pushPathInfo(pathInfo, storage);
    builder.pushRootHash(storage);
    return builder.inputs;
}
exports.genZKPInput = genZKPInput;

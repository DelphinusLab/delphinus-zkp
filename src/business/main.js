"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runZkp = exports.genZKPInput = exports.shaCommand = void 0;
var sha256_1 = __importDefault(require("crypto-js/sha256"));
var enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
var bn_js_1 = __importDefault(require("bn.js"));
var path_1 = __importDefault(require("path"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var child_process_1 = require("child_process");
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
    var data = [op]
        .concat(command.args)
        .concat([new field_1.Field(0)])
        .map(function (x) { return x.v.toString("hex", 64); })
        .join("");
    var hvalue = (0, sha256_1.default)(enc_hex_1.default.parse(data)).toString();
    return [
        new field_1.Field(new bn_js_1.default(hvalue.slice(0, 32), "hex")),
        new field_1.Field(new bn_js_1.default(hvalue.slice(32, 64), "hex")),
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
function runZkp(op, args, storage) {
    return __awaiter(this, void 0, void 0, function () {
        var data, proof;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = genZKPInput(op, args, storage);
                    console.log("zokrates compute-witness -a " + data
                        .map(function (f) { return f.v.toString(10); })
                        .join(" "));
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            return (0, child_process_1.exec)("zokrates compute-witness -a " + data
                                .map(function (f) { return f.v.toString(10); })
                                .join(" "), {
                                cwd: path_1.default.resolve(__dirname, "..", ".."),
                            }, function (error, stdout, stderr) {
                                console.log("stdout\n", stdout);
                                if (error) {
                                    reject(error);
                                    return;
                                }
                                resolve(undefined);
                            });
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            return (0, child_process_1.exec)("zokrates generate-proof", {
                                cwd: path_1.default.resolve(__dirname, "..", ".."),
                            }, function (error, stdout, stderr) {
                                console.log("stdout\n", stdout);
                                if (error) {
                                    reject(error);
                                    return;
                                }
                                resolve(undefined);
                            });
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs_extra_1.default.readJson(path_1.default.resolve(__dirname, "..", "..", "proof.json"))];
                case 3:
                    proof = _a.sent();
                    console.log(JSON.stringify(proof));
                    return [2 /*return*/];
            }
        });
    });
}
exports.runZkp = runZkp;

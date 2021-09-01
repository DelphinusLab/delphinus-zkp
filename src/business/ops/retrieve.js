"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrieveCommand = void 0;
var field_1 = require("delphinus-curves/src/field");
var command_1 = require("../command");
var RetrieveCommand = /** @class */ (function (_super) {
    __extends(RetrieveCommand, _super);
    function RetrieveCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RetrieveCommand.prototype.run = function (storage) {
        var path = [];
        var account = this.args[3];
        var pool = this.args[4];
        var amount0 = this.args[5];
        var amount1 = this.args[6];
        var nonce = this.args[7];
        var index0 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), 2);
        path.push(storage.getPath(index0));
        storage.set(index0, nonce.add(new field_1.Field(1)));
        var index1 = (0, command_1.getPoolStoreIndex)(pool.v.toNumber());
        path.push(storage.getPath(index1));
        var poolInfo = storage.getLeaves(index1);
        poolInfo[2] = poolInfo[2].sub(amount0);
        poolInfo[3] = poolInfo[3].sub(amount1);
        storage.setLeaves(index1, poolInfo);
        var index2 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), poolInfo[0].v.toNumber());
        path.push(storage.getPath(index2));
        var balance0 = storage.get(index2);
        storage.set(index2, balance0.add(amount0));
        var index3 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), poolInfo[1].v.toNumber());
        path.push(storage.getPath(index3));
        var balance1 = storage.get(index3);
        storage.set(index3, balance1.add(amount1));
        var index4 = (0, command_1.getShareStoreIndex)(account.v.toNumber(), pool.v.toNumber());
        path.push(storage.getPath(index4));
        var share = storage.get(index4);
        storage.set(index4, share.sub(amount0).sub(amount1));
        return path;
    };
    return RetrieveCommand;
}(command_1.Command));
exports.RetrieveCommand = RetrieveCommand;

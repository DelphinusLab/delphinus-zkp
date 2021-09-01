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
exports.WithdrawCommand = void 0;
var field_1 = require("delphinus-curves/src/field");
var command_1 = require("../command");
var WithdrawCommand = /** @class */ (function (_super) {
    __extends(WithdrawCommand, _super);
    function WithdrawCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WithdrawCommand.prototype.run = function (storage) {
        var path = [];
        var account = this.args[3];
        var token = this.args[4];
        var amount = this.args[5];
        var nonce = this.args[6];
        var index0 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), 2);
        path.push(storage.getPath(index0));
        storage.set(index0, nonce.add(new field_1.Field(1)));
        var index1 = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), token.v.toNumber());
        path.push(storage.getPath(index1));
        var balance = storage.get(index1);
        storage.set(index1, balance.sub(amount));
        return path;
    };
    return WithdrawCommand;
}(command_1.Command));
exports.WithdrawCommand = WithdrawCommand;

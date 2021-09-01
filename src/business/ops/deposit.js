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
exports.DepositCommand = void 0;
var command_1 = require("../command");
var DepositCommand = /** @class */ (function (_super) {
    __extends(DepositCommand, _super);
    function DepositCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DepositCommand.prototype.run = function (storage) {
        var path = [];
        var account = this.args[0];
        var token = this.args[1];
        var amount = this.args[2];
        var index = (0, command_1.getBalanceStoreIndex)(account.v.toNumber(), token.v.toNumber());
        path.push(storage.getPath(index));
        var balance = storage.get(index);
        storage.set(index, balance.add(amount));
        return path;
    };
    return DepositCommand;
}(command_1.Command));
exports.DepositCommand = DepositCommand;

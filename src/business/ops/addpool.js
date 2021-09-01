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
exports.AddPoolCommand = void 0;
var field_1 = require("delphinus-curves/src/field");
var command_1 = require("../command");
var AddPoolCommand = /** @class */ (function (_super) {
    __extends(AddPoolCommand, _super);
    function AddPoolCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddPoolCommand.prototype.run = function (storage) {
        var path = [];
        var poolIndex = this.args[1];
        var tokenIndex0 = this.args[2];
        var tokenIndex1 = this.args[3];
        var index = (0, command_1.getPoolStoreIndex)(poolIndex.v.toNumber());
        path.push(storage.getPath(index));
        var zero = new field_1.Field(0);
        storage.setLeaves(index, [tokenIndex0, tokenIndex1, zero, zero]);
        return path;
    };
    return AddPoolCommand;
}(command_1.Command));
exports.AddPoolCommand = AddPoolCommand;

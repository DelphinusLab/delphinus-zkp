"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPoolCommand = void 0;
const field_1 = require("delphinus-curves/src/field");
const command_1 = require("../command");
class AddPoolCommand extends command_1.Command {
    async run(storage) {
        const path = [];
        const poolIndex = this.args[0];
        const tokenIndex0 = this.args[1];
        const tokenIndex1 = this.args[2];
        const index = (0, command_1.getPoolStoreIndex)(poolIndex.v.toNumber());
        path.push(await storage.getPath(index));
        const zero = new field_1.Field(0);
        await storage.setLeaves(index, [tokenIndex0, tokenIndex1, zero, zero]);
        return path;
    }
}
exports.AddPoolCommand = AddPoolCommand;

import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/markle-tree-large";
import { Command, L2Storage, getPoolStoreIndex } from "../command";

export class AddPoolCommand extends Command {
  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const poolIndex = this.args[0];
    const tokenIndex0 = this.args[1];
    const tokenIndex1 = this.args[2];

    const index = getPoolStoreIndex(poolIndex.v.toNumber());
    path.push(await storage.getPath(index));

    const zero = new Field(0);
    await storage.setLeaves(index, [tokenIndex0, tokenIndex1, zero, zero]);

    return path;
  }
}

import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { Command, L2Storage, getPoolStoreIndex } from "../command";

export class AddPoolCommand extends Command {
  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const poolIndex = this.args[4];
    const tokenIndex0 = new Field(this.args[5].v.shrn(16));
    const tokenIndex1 = new Field(this.args[5].v.addn(0xffff));

    const index = getPoolStoreIndex(poolIndex.v.toNumber());
    path.push(await storage.getPath(index));

    const zero = new Field(0);
    await storage.setLeaves(index, [tokenIndex0, tokenIndex1, zero, zero]);

    return path;
  }
}

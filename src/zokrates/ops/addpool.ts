import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { Command, L2Storage, getPoolStoreAddress } from "../command";

export class AddPoolCommand extends Command {
  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const poolIndex = this.args[0];
    const tokenIndex0 = this.args[1];
    const tokenIndex1 = this.args[2];

    const poolAddress = getPoolStoreAddress(poolIndex.v.toNumber());
    path.push(await storage.getPath(poolAddress));

    const zero = new Field(0);
    await storage.setLeaves(poolAddress, [tokenIndex0, tokenIndex1, zero, zero]);

    return path;
  }
}

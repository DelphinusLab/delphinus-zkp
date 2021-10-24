import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { getPoolInfoIndex, L2Storage } from "../address-space";
import { Command } from "../command";
import { adminAccountIndex } from "../common";

export class AddPoolCommand extends Command {
  get callerAccountIndex() {
    return adminAccountIndex;
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const poolIndex = this.args[4];
    const tokenIndex0 = new Field(this.args[5].v.shrn(16));
    const tokenIndex1 = new Field(this.args[5].v.addn(0xffff));

    path.push(await storage.getAndUpdateNonce(this.callerAccountIndex, nonce));
    path.push(await storage.getPoolInfo(poolIndex));

    const zero = new Field(0);
    await storage.setLeaves(getPoolInfoIndex(poolIndex), [
      tokenIndex0,
      tokenIndex1,
      zero,
      zero,
    ]);

    return path;
  }
}

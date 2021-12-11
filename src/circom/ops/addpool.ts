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
    const tokenIndex0 = this.args[4];
    const tokenIndex1 = this.args[5];

    // circuits: check tokenIndex0 < 2 ^ 10
    // circuits: check tokenIndex1 < 2 ^ 10
    // circuits: check tokenIndex0 != tokenIndex1
    // check if the other part of args is 0
    // omit poolIndex in circuits args, we can get it from merkle tree path
    const poolIndex = this.args[9];

    // STEP1: udpate nonce
    // circuits: check nonce
    // circuits: check caller permission
    path.push(await storage.getAndUpdateNonce(this.callerAccountIndex, nonce));

    // STEP2: init pool info
    // circuits: check index of pool
    // circuits: check leafValues[0] and leafValues[1] equal to 0
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

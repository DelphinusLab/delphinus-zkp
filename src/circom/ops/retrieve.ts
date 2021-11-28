import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";

export class RetrieveCommand extends Command {
  get callerAccountIndex() {
    return this.args[4].v.toNumber();
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const accountIndex = this.args[4];
    const poolIndex = this.args[5];
    const amount0 = this.args[6];
    const amount1 = this.args[7];

    // circuits: check accountIndex < 2 ^ 20
    // circuits: check poolIndex < 2 ^ 10
    // circuits: amount1 + amount0 not overflow

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await storage.getAndUpdateNonce(this.callerAccountIndex, nonce));

    // STEP2: udpate liquility
    // circuits: check token0 != 0 || token1 != 0
    // circuits: liq0 >= amount0
    // circuits: liq1 >= amount1
    const [tokenIndex0, tokenIndex1, _path] = await storage.getAndAddLiq(
      poolIndex,
      new Field(0).sub(amount0),
      new Field(0).sub(amount1)
    );
    path.push(_path);

    // STEP3: udpate share
    // circuits: check share >= amount1 + amount0
    path.push(
      await storage.getAndAddShare(
        accountIndex,
        poolIndex,
        new Field(0).sub(amount0).sub(amount1)
      )
    );

    // STEP4: udpate balance0
    // circuits: check balance0 + amount0 not overflow
    path.push(
      await storage.getAndAddBalance(accountIndex, tokenIndex0, amount0)
    );

    // STEP5: udpate balance1
    // circuits: check balance1 + amount1 not overflow
    path.push(
      await storage.getAndAddBalance(accountIndex, tokenIndex1, amount1)
    );

    return path;
  }
}
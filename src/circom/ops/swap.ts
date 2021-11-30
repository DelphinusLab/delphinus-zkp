import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";

export class SwapCommand extends Command {
  get callerAccountIndex() {
    return this.args[4].v.toNumber();
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const accountIndex = this.args[4];
    const poolIndex = this.args[5];
    const reverse = this.args[6];
    const amount = this.args[7];

    // circuits: check accountIndex < 2 ^ 20
    // circuits: check poolIndex < 2 ^ 10
    // circuits: amount1 + amount0 not overflow

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await storage.getAndUpdateNonce(this.callerAccountIndex, nonce));

    // STEP2: udpate liquility
    // circuits: check token0 != 0 || token1 != 0
    // circuits: if reverse == 0 then liq0 + amount doesn't overflow else liq0 >= amount
    // circuits: if reverse == 0 then liq1 >= amount else liq1 + amount doesn't overflow
    const [tokenIndex0, tokenIndex1, _path] = await storage.getAndAddLiq(
      poolIndex,
      reverse.v.eqn(0) ? amount : new Field(0).sub(amount),
      reverse.v.eqn(0) ? new Field(0).sub(amount) : amount
    );
    path.push(_path);

    // STEP3: udpate balance0
    // circuits: if reverse == 0 then balance0 >= amount else balance0 + amount doesn't overflow
    path.push(
      await storage.getAndAddBalance(
        accountIndex,
        tokenIndex0,
        reverse.v.eqn(0) ? new Field(0).sub(amount) : amount
      )
    );

    // STEP4: udpate balance1
    // circuits: if reverse == 0 then balance1 + amount doesn't overflow else balance1 >= amount
    path.push(
      await storage.getAndAddBalance(
        accountIndex,
        tokenIndex1,
        reverse.v.eqn(0) ? amount : new Field(0).sub(amount)
      )
    );

    return path;
  }
}

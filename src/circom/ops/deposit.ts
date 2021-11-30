import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { getBalanceInfoIndex, L2Storage } from "../address-space";
import { Command } from "../command";
import { adminAccountIndex } from "../common";

export class DepositCommand extends Command {
  get callerAccountIndex() {
    return adminAccountIndex;
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const accountIndex = this.args[4];
    const tokenIndex = this.args[5];
    const amount = this.args[6];
    // circuits: check accountIndex < 2 ^ 20
    // circuits: check tokenIndex < 2 ^ 10

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await storage.getAndUpdateNonce(this.callerAccountIndex, nonce));

    // STEP2: udpate balance
    // circuits: check balance + amount doesn't overflow
    path.push(await storage.getAndAddBalance(accountIndex, tokenIndex, amount));

    return path;
  }
}

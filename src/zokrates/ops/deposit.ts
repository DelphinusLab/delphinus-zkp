import { PathInfo } from "delphinus-curves/src/markle-tree-large";
import { Command, getBalanceStoreIndex, L2Storage } from "../command";

export class DepositCommand extends Command {
  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const account = this.args[0];
    const token = this.args[1];
    const amount = this.args[2];

    const index = getBalanceStoreIndex(account.v.toNumber(), token.v.toNumber());
    path.push(await storage.getPath(index));

    const balance = await storage.getLeave(index);
    await storage.setLeave(index, balance.add(amount));

    return path;
  }
}

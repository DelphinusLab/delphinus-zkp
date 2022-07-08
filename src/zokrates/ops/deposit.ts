import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { Command, getBalanceStoreAddress, L2Storage } from "../command";

export class DepositCommand extends Command {
  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const account = this.args[0];
    const token = this.args[1];
    const amount = this.args[2];

    const balanceAddress = getBalanceStoreAddress(account.v.toNumber(), token.v.toNumber());
    path.push(await storage.getPath(balanceAddress));

    const balance = await storage.getLeave(balanceAddress);
    await storage.setLeave(balanceAddress, balance.add(amount));

    return path;
  }
}

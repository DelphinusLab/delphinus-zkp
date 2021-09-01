import { PathInfo } from "delphinus-curves/src/markle-tree";
import { Command, getBalanceStoreIndex, L2Storage } from "../command";

export class DepositCommand extends Command {
  run(storage: L2Storage): PathInfo[] {
    const path = [] as PathInfo[];

    const account = this.args[0];
    const token = this.args[1];
    const amount = this.args[2];

    const index = getBalanceStoreIndex(account.v.toNumber(), token.v.toNumber());
    path.push(storage.getPath(index));

    const balance = storage.get(index);
    storage.set(index, balance.add(amount));

    return path;
  }
}

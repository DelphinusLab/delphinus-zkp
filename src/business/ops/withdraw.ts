import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/markle-tree";
import { Command, getBalanceStoreIndex, L2Storage } from "../command";

export class WithdrawCommand extends Command {
  run(storage: L2Storage): PathInfo[] {
    const path = [] as PathInfo[];

    const account = this.args[3];
    const token = this.args[4];
    const amount = this.args[5];
    const nonce = this.args[6];

    const index0 = getBalanceStoreIndex(account.v.toNumber(), 2);
    path.push(storage.getPath(index0));
    storage.set(index0, nonce.add(new Field(1)));

    const index1 = getBalanceStoreIndex(account.v.toNumber(), token.v.toNumber());
    path.push(storage.getPath(index1));

    const balance = storage.get(index1);
    storage.set(index1, balance.sub(amount));

    return path;
  }
}

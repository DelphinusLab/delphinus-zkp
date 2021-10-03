import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/markle-tree-large";
import { Command, getBalanceStoreIndex, L2Storage } from "../command";

export class WithdrawCommand extends Command {
  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const account = this.args[3];
    const token = this.args[4];
    const amount = this.args[5];
    const nonce = this.args[7];

    const index0 = getBalanceStoreIndex(account.v.toNumber(), 2);
    path.push(await storage.getPath(index0));
    await storage.setLeave(index0, nonce.add(new Field(1)));

    const index1 = getBalanceStoreIndex(account.v.toNumber(), token.v.toNumber());
    path.push(await storage.getPath(index1));

    const balance = await storage.getLeave(index1);
    await storage.setLeave(index1, balance.sub(amount));

    return path;
  }
}

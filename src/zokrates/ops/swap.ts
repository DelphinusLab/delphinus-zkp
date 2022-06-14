import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { Command, getBalanceStoreAddress, getPoolStoreAddress, getShareStoreAddress, L2Storage } from "../command";

export class SwapCommand extends Command {
  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const account = this.args[3];
    const pool = this.args[4];
    const amount = this.args[5];
    const direction = this.args[6];
    const nonce = this.args[7];

    const index0 = getBalanceStoreAddress(account.v.toNumber(), 2);
    path.push(await storage.getPath(index0));
    await storage.setLeave(index0, nonce.add(new Field(1)));

    const index1 = getPoolStoreAddress(pool.v.toNumber());
    path.push(await storage.getPath(index1));
    const poolInfo = await storage.getLeaves(index1);

    poolInfo[2] = direction.v.eqn(0) ? poolInfo[2].add(amount) : poolInfo[2].sub(amount);
    poolInfo[3] = !direction.v.eqn(0) ? poolInfo[3].add(amount) : poolInfo[3].sub(amount);
    await storage.setLeaves(index1, poolInfo);

    const index2 = getBalanceStoreAddress(account.v.toNumber(), poolInfo[0].v.toNumber());
    path.push(await storage.getPath(index2));
    const balance0 = await storage.getLeave(index2);
    await storage.setLeave(index2, direction.v.eqn(0) ? balance0.sub(amount) : balance0.add(amount));

    const index3 = getBalanceStoreAddress(account.v.toNumber(), poolInfo[1].v.toNumber());
    path.push(await storage.getPath(index3));
    const balance1 = await storage.getLeave(index3);
    await storage.setLeave(index3, !direction.v.eqn(0) ? balance1.sub(amount) : balance1.add(amount));

    return path;
  }
}

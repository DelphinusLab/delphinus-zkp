import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { Command, getBalanceStoreIndex, getPoolStoreIndex, getShareStoreIndex, L2Storage } from "../command";

export class RetrieveCommand extends Command {
  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const account = this.args[3];
    const pool = this.args[4];
    const amount0 = this.args[5];
    const amount1 = this.args[6];
    const nonce = this.args[7];

    const index0 = getBalanceStoreIndex(account.v.toNumber(), 2);
    path.push(await storage.getPath(index0));
    await storage.setLeave(index0, nonce.add(new Field(1)));

    const index1 = getPoolStoreIndex(pool.v.toNumber());
    path.push(await storage.getPath(index1));
    const poolInfo = await storage.getLeaves(index1);
    poolInfo[2] = poolInfo[2].sub(amount0);
    poolInfo[3] = poolInfo[3].sub(amount1);
    await storage.setLeaves(index1, poolInfo);

    const index2 = getBalanceStoreIndex(account.v.toNumber(), poolInfo[0].v.toNumber());
    path.push(await storage.getPath(index2));
    const balance0 = await storage.getLeave(index2);
    await storage.setLeave(index2, balance0.add(amount0));

    const index3 = getBalanceStoreIndex(account.v.toNumber(), poolInfo[1].v.toNumber());
    path.push(await storage.getPath(index3));
    const balance1 = await storage.getLeave(index3);
    await storage.setLeave(index3, balance1.add(amount1));

    const index4 = getShareStoreIndex(account.v.toNumber(), pool.v.toNumber());
    path.push(await storage.getPath(index4));
    const share = await storage.getLeave(index4);
    await storage.setLeave(index4, share.sub(amount0).sub(amount1));

    return path;
  }
}

import { Field } from "delphinus-curves/src/field";
import { AddressSpace, getSpaceIndex, toNumber } from "./space";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";
import BN from "bn.js";

export class Pool  {
  private index: number | Field;
  private info_address: number;
  private token0_address: number;
  private token1_address: number;
  private amount0_address: number;
  private amount1_address: number;
  private storage: MerkleTree;

  constructor(storage: MerkleTree, index: number | Field) {
    this.storage = storage;
    this.index = index;
    this.info_address = getSpaceIndex(AddressSpace.Pool) | (toNumber(this.index) << 20);
    this.token0_address = this.info_address | 0;
    this.token1_address = this.info_address | 1;
    this.amount0_address = this.info_address | 2;
    this.amount1_address = this.info_address | 3;
  }

  async getPoolPath(): Promise<PathInfo> {
    return this.storage.getPath(this.info_address);
  }

  async getShareTotalPath(): Promise<PathInfo> {
    return this.storage.getPath(this.getShareTotalAddress());
  }

  async getTokenIndexAndLiq() {
    const poolInfo = await this.storage.getLeaves(this.info_address);
    const tokenIndex0 = poolInfo[0];
    const tokenIndex1 = poolInfo[1];
    const liq0 = poolInfo[2];
    const liq1 = poolInfo[3];
    return [tokenIndex0, tokenIndex1, liq0, liq1];
  }

  getShareTotalAddress(): number {
    return (
      (AddressSpace.Pool << 30) |
      (toNumber(this.index) << 20) |
      (1 << 2) | 0
    );
  }

  async getAndInitTokenIndexAndLiq(
    tokenIndex0: Field,
    tokenIndex1: Field,
    liq0: Field,
    liq1: Field
  ): Promise<PathInfo> {
    const path = await this.getPoolPath();
    await this.storage.setLeaves(this.info_address, [
      tokenIndex0,
      tokenIndex1,
      liq0,
      liq1,
    ]);
    return path;
  }

  async getAndUpdateLiqByAddition(
    amount0: Field,
    amount1: Field
  ): Promise<PathInfo> {
    const path = await this.getPoolPath();
    const [tokenIndex0, tokenIndex1, liq0, liq1] = await this.getTokenIndexAndLiq();
    await this.storage.setLeaves(this.info_address, [
      tokenIndex0,
      tokenIndex1,
      liq0.add(amount0),
      liq1.add(amount1),
    ]);
    return path;
  }

  async getAndInitShareTotal(
    init_share: Field
  ): Promise<PathInfo> {
    const path = await this.getShareTotalPath();
    await this.storage.setLeave(this.getShareTotalAddress(), init_share);
    return path;
  }

  async getAndUpdateShareTotal(
    share_new: Field
  ): Promise<PathInfo> {
    const path = await this.getShareTotalPath();
    const share_old = await this.getShareTotal();
    await this.storage.setLeave(this.getShareTotalAddress(), share_old.add(share_new));
    return path;
  }

  async getShareTotal(){
    const share_total = await this.storage.getLeave(this.getShareTotalAddress());
    return share_total;
  }
}

import { Field } from "delphinus-curves/src/field";
import { AddressSpace, getSpaceIndex, toNumber } from "./space";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";
import BN from "bn.js";

export const initSharePriceKBN = new BN('1' + '0'.repeat(24), 10);

export class Pool  {
  private index: number | Field;
  private info_index: number;
  private token0_index: number;
  private token1_index: number;
  private amount0_index: number;
  private amount1_index: number;
  private storage: MerkleTree;

  constructor(storage: MerkleTree, index: number | Field) {
    this.storage = storage;
    this.index = index;
    this.info_index = getSpaceIndex(AddressSpace.Pool) | (toNumber(this.index) << 20);
    this.token0_index = this.info_index | 0;
    this.token1_index = this.info_index | 1;
    this.amount0_index = this.info_index | 2;
    this.amount1_index = this.info_index | 3;
  }

  async getPoolPath(): Promise<PathInfo> {
    return this.storage.getPath(this.info_index);
  }

  async getKAndRemPath(): Promise<PathInfo> {
    return this.storage.getPath(this.getSharePriceKIndex());
  }

  async getTokenIndexAndLiq() {
    const poolInfo = await this.storage.getLeaves(this.info_index);
    const tokenIndex0 = poolInfo[0];
    const tokenIndex1 = poolInfo[1];
    const liq0 = poolInfo[2];
    const liq1 = poolInfo[3];
    return [tokenIndex0, tokenIndex1, liq0, liq1];
  }

  async getSharePriceK(){
    const sharePriceKIndex = this.getSharePriceKIndex();
    const k = await this.storage.getLeave(sharePriceKIndex);
    if (!k.v.eqn(0)){
      return k
    }
    throw new Error('SharePriceK has not been initiated yet');
  }

  async getAccumulatedRem(){
    const accumulatedRemIndex = this.getAccumulatedRemIndex();
    const r = await this.storage.getLeave(accumulatedRemIndex);
    return r;
  }

  getSharePriceKIndex(): number {
    return (
      (AddressSpace.Pool << 30) |
      (toNumber(this.index) << 20) |
      (1 << 2) | 0
    );
  }

  getAccumulatedRemIndex(): number {
    return (
      (AddressSpace.Pool << 30) |
      (toNumber(this.index) << 20) |
      (1 << 2) | 1
    );
  }

  async getAndInitTokenIndexAndLiq(
    tokenIndex0: Field,
    tokenIndex1: Field,
    liq0: Field,
    liq1: Field
  ): Promise<PathInfo> {
    const path = await this.getPoolPath();
    await this.storage.setLeaves(this.info_index, [
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
    await this.storage.setLeaves(this.info_index, [
      tokenIndex0,
      tokenIndex1,
      liq0.add(amount0),
      liq1.add(amount1),
    ]);
    return path;
  }

  async getAndUpdateKAndRem(
    k_new: Field,
    rem_new: Field
  ): Promise<PathInfo> {
    const KAndRem_path = await this.getKAndRemPath();
    await this.storage.setLeave(this.getSharePriceKIndex(), k_new);
    await this.storage.setLeave(this.getAccumulatedRemIndex(), rem_new);
    return KAndRem_path;
  }

  async updateK(
    k_new: Field
  ){
    const sharePriceKIndex = this.getSharePriceKIndex();
    await this.storage.setLeave(sharePriceKIndex, k_new);
  }

  async updateRem(
    rem_new: Field
  ){
    const accumulatedRem = this.getAccumulatedRemIndex();
    await this.storage.setLeave(accumulatedRem, rem_new);
  }

  // Initialize a pool conveniently 
  // Not return any path, only used in test files
  async initPoolForTest(
    tokenIndex0: Field,
    tokenIndex1: Field,
    token0liq: Field,
    token1liq: Field,
    sharePriceK: Field,
    accumulatedRem: Field
  ) {
    await this.storage.setLeaves(this.info_index, [
      tokenIndex0,
      tokenIndex1,
      token0liq,
      token1liq,
    ]);
    await this.getAndUpdateKAndRem(sharePriceK, accumulatedRem);
  }
}

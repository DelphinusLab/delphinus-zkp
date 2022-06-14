import { Field } from "delphinus-curves/src/field";
import { AddressSpace, getSpaceIndex, toNumber } from "./space";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";
import BN from "bn.js";

export const initSharePriceKBN = new BN('1' + '0'.repeat(24), 10);

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

  async getKAndRemPath(): Promise<PathInfo> {
    return this.storage.getPath(this.getSharePriceKAddress());
  }

  async getTokenIndexAndLiq() {
    const poolInfo = await this.storage.getLeaves(this.info_address);
    const tokenIndex0 = poolInfo[0];
    const tokenIndex1 = poolInfo[1];
    const liq0 = poolInfo[2];
    const liq1 = poolInfo[3];
    return [tokenIndex0, tokenIndex1, liq0, liq1];
  }

  async getSharePriceK(){
    const sharePriceKAddress = this.getSharePriceKAddress();
    const k = await this.storage.getLeave(sharePriceKAddress);
    if (!k.v.eqn(0)){
      return k
    }
    throw new Error('SharePriceK has not been initiated yet');
  }

  async getAccumulatedRem(){
    const accumulatedRemAddress = this.getAccumulatedRemAddress();
    const r = await this.storage.getLeave(accumulatedRemAddress);
    return r;
  }

  getSharePriceKAddress(): number {
    return (
      (AddressSpace.Pool << 30) |
      (toNumber(this.index) << 20) |
      (1 << 2) | 0
    );
  }

  getAccumulatedRemAddress(): number {
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

  async getAndUpdateKAndRem(
    k_new: Field,
    rem_new: Field
  ): Promise<PathInfo> {
    const KAndRem_path = await this.getKAndRemPath();
    await this.storage.setLeave(this.getSharePriceKAddress(), k_new);
    await this.storage.setLeave(this.getAccumulatedRemAddress(), rem_new);
    return KAndRem_path;
  }

  async updateK(
    k_new: Field
  ){
    const sharePriceKAddress = this.getSharePriceKAddress();
    await this.storage.setLeave(sharePriceKAddress, k_new);
  }

  async updateRem(
    rem_new: Field
  ){
    const accumulatedRemAddress = this.getAccumulatedRemAddress();
    await this.storage.setLeave(accumulatedRemAddress, rem_new);
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
    await this.storage.setLeaves(this.info_address, [
      tokenIndex0,
      tokenIndex1,
      token0liq,
      token1liq,
    ]);
    await this.getAndUpdateKAndRem(sharePriceK, accumulatedRem);
  }
}

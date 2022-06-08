import { Field } from "delphinus-curves/src/field";
import { AddressSpace, getSpaceIndex, toNumber } from "./space";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";
import BN from "bn.js";

export const initSharePriceKBN = new BN('1' + '0'.repeat(24), 10);

export class Pool  {
  index: number | Field;
  info_index: number;
  token0_index: number;
  token1_index: number;
  amount0_index: number;
  amount1_index: number;
  storage: MerkleTree;

  constructor(storage: MerkleTree, index: number | Field) {
    this.storage = storage;
    this.index = index;
    this.info_index = getSpaceIndex(AddressSpace.Pool) | (toNumber(this.index) << 20);
    this.token0_index = this.info_index | 0;
    this.token1_index = this.info_index | 1;
    this.amount0_index = this.info_index | 2;
    this.amount1_index = this.info_index | 3;
  }

  async getPoolPath() {
    return this.storage.getPath(this.info_index);
  }

  async getKAndRemPath() {
    return this.storage.getPath(this.getSharePriceKIndex());
  }

  getSharePriceKIndex() {
    return (
      (AddressSpace.Pool << 30) |
      (toNumber(this.index) << 20) |
      (1 << 2) | 0
    );
  }

  getAccumulatedRemIndex() {
    return (
      (AddressSpace.Pool << 30) |
      (toNumber(this.index) << 20) |
      (1 << 2) | 1
    );
  }

  async getAndAddLiq(
    amount0: Field,
    amount1: Field
  ): Promise<[Field, Field, PathInfo]> {
    const path = await this.getPoolPath();

    const poolInfo = await this.storage.getLeaves(this.info_index);
    const tokenIndex0 = poolInfo[0];
    const tokenIndex1 = poolInfo[1];
    const liq0 = poolInfo[2];
    const liq1 = poolInfo[3];

    await this.storage.setLeaves(this.info_index, [
      tokenIndex0,
      tokenIndex1,
      liq0.add(amount0),
      liq1.add(amount1),
    ]);
    return [tokenIndex0, tokenIndex1, path];
  }

  async getAndAddLiq_withKAndRem(
    amount0: Field,
    amount1: Field,
    k_new: Field,
    rem_new: Field
  ): Promise<[Field, Field, PathInfo, PathInfo]> {
    const pool_path = await this.getPoolPath();
    const KAndRem_path = await this.getKAndRemPath()
    const poolInfo = await this.storage.getLeaves(this.info_index);
    const tokenIndex0 = poolInfo[0];
    const tokenIndex1 = poolInfo[1];
    const liq0 = poolInfo[2];
    const liq1 = poolInfo[3];

    await this.storage.setLeaves(this.info_index, [
      tokenIndex0,
      tokenIndex1,
      liq0.add(amount0),
      liq1.add(amount1),
    ]);
    await this.storage.setLeave(this.getSharePriceKIndex(), k_new);
    await this.storage.setLeave(this.getAccumulatedRemIndex(), rem_new);
    return [tokenIndex0, tokenIndex1, pool_path, KAndRem_path];
  }

  async getTokenInfo(){
    const poolInfo = await this.storage.getLeaves(this.info_index);
    const tokenIndex0 = poolInfo[0];
    const tokenIndex1 = poolInfo[1];
    const liq0 = poolInfo[2];
    const liq1 = poolInfo[3];
    return [[tokenIndex0,liq0], [tokenIndex1,liq1]];
  }

  async initSharePriceK(
    k: Field
  ){
    const sharePriceKIndex = this.getSharePriceKIndex();
    await this.storage.setLeave(sharePriceKIndex, k);
  }

  async initAccumulatedRem(
    r: Field
  ){
    const accumulatedRem = this.getAccumulatedRemIndex();
    await this.storage.setLeave(accumulatedRem, r);
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

  async resetPool(
      tokenIndex0: Field,
      tokenIndex1: Field,
      sharePriceK: Field,
      accumulatedRem: Field
  ) {
    const zero = new Field(0);
    await this.storage.setLeaves(this.info_index, [
      tokenIndex0,
      tokenIndex1,
      zero,
      zero,
    ]);
    await this.initSharePriceK(sharePriceK);
    await this.initAccumulatedRem(accumulatedRem);
  }

  async setPool(
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
    await this.initSharePriceK(sharePriceK);
    await this.initAccumulatedRem(accumulatedRem);
  }
}

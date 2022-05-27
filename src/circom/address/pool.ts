import { Field } from "delphinus-curves/src/field";
import { AddressSpace, getSpaceIndex, toNumber } from "./space";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { ShareCalcHelper } from "../shareCalc_helper";

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

  getSharePriceKIndex(){
    return (
      (AddressSpace.Share << 30) |
      (toNumber(this.index) << 20) |
      (1 << 2) | 0
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

  async getTotalAmount(){
    const poolInfo = await this.storage.getLeaves(this.info_index);
    const liq0 = poolInfo[2];
    const liq1 = poolInfo[3];
    const poolTotal = liq0.add(liq1);
    return poolTotal
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

  async getSharePriceK(){
    const sharePriceKIndex = this.getSharePriceKIndex();
    const k = await this.storage.getLeave(sharePriceKIndex);
    if (!k.v.eqn(0)){
      return k
    }
    throw new Error('SharePriceK has not been initiated yet');
  }

  async getAndUpdateSharePriceK(
    profit: Field
  ){
    const sharePriceKIndex = this.getSharePriceKIndex();
    const path = await this.storage.getPath(sharePriceKIndex);
    const k = await this.getSharePriceK();
    const totalAmount = await this.getTotalAmount();
    const shareCalc = new ShareCalcHelper;
    const k_new = shareCalc.calcK_new(totalAmount.v, k.v, profit.v);
    await this.storage.setLeave(sharePriceKIndex, k_new);
    return path
  }

  async resetPool(
      tokenIndex0: Field,
      tokenIndex1: Field,
  ) {
    const zero = new Field(0);
    await this.storage.setLeaves(this.info_index, [
      tokenIndex0,
      tokenIndex1,
      zero,
      zero,
    ]);
  }
}

import { Field } from "delphinus-curves/src/field";
import { AddressSpace, getSpaceIndex, toNumber } from "./space";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";
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
    this.info_index = getSpaceIndex(AddressSpace.Pool) | (toNumber(this.index) << 10);
    this.token0_index = this.info_index | 0;
    this.token1_index = this.info_index | 1;
    this.amount0_index = this.info_index | 2;
    this.amount1_index = this.info_index | 3;
  }
  async getPoolPath() {
    return this.storage.getPath(this.info_index);
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

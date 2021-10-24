import { Field } from "delphinus-curves/src/field";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";

export enum CommandOp {
  Deposit = 0,
  Withdraw = 1,
  Swap = 2,
  Supply = 3,
  Retrieve = 4,
  AddPool = 5,
  AddToken = 7,
};

export class Command {
  args: Field[];

  constructor(args: Field[]) {
    this.args = args.concat(Array(8).fill(new Field(0))).slice(0, 8);
  }

  async run(storage: L2Storage): Promise<PathInfo[]> {
    throw new Error('Not Implemented yet');
  }
}

export enum StoreNameSpace {
  BalanceStore = 0,
  PoolStore = 1,
  ShareStore = 2,
}

export class Index {
  poolIndex: number;

  get index() {
    return (StoreNameSpace.PoolStore << 30) | (this.poolIndex << 20);
  }

  constructor(poolIndex: number) {
    if (poolIndex < 0 || poolIndex >= 1024) {
      throw new Error(`Bad pool index: ${poolIndex}`);
    }
    this.poolIndex = poolIndex;
  }
}

export function getPoolStoreIndex(poolIndex: number) {
  return (StoreNameSpace.PoolStore << 30) | (poolIndex << 20);
}

export function getBalanceStoreIndex(accountIndex: number, tokenIndex: number) {
  return (StoreNameSpace.BalanceStore << 30) | (accountIndex << 10) | tokenIndex;
}

export function getShareStoreIndex(accountIndex: number, poolIndex: number) {
  return (StoreNameSpace.ShareStore << 30) | (accountIndex << 10) | poolIndex;
}

export class L2Storage extends MerkleTree {
  async getPoolToken0Info(index: number) {
    return this.getLeave(index + 0);
  }

  async getPoolToken1Info(index: number) {
    return this.getLeave(index + 1);
  }

  async getPoolToken0Amount(index: number) {
    return this.getLeave(index + 2);
  }

  async getPoolToken1Amount(index: number) {
    return this.getLeave(index + 3);
  }
}

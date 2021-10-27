import { Field } from "delphinus-curves/src/field";
import { MerkleTree } from "delphinus-curves/src/merkle-tree-large";

export enum AddressSpace {
  Balance = 0,
  Pool = 1,
  Share = 2,
  Account = 3,
}

function toNumber(v: number | Field) {
  return v instanceof Field ? v.v.toNumber() : v;
}

export function getBalanceInfoIndex(
  accountIndex: number | Field,
  tokenIndex: number | Field
) {
  return (
    (AddressSpace.Balance << 30) |
    (toNumber(accountIndex) << 10) |
    toNumber(tokenIndex)
  );
}

export function getPoolInfoIndex(poolIndex: number | Field) {
  return (AddressSpace.Pool << 30) | (toNumber(poolIndex) << 20);
}

export function getPoolToken0InfoIndex(poolIndex: number | Field) {
  return (AddressSpace.Pool << 30) | (toNumber(poolIndex) << 20) | 0;
}

export function getPoolToken1InfoIndex(poolIndex: number | Field) {
  return (AddressSpace.Pool << 30) | (toNumber(poolIndex) << 20) | 1;
}

export function getPoolAmount0InfoIndex(poolIndex: number | Field) {
  return (AddressSpace.Pool << 30) | (toNumber(poolIndex) << 20) | 2;
}

export function getPoolAmount1InfoIndex(poolIndex: number | Field) {
  return (AddressSpace.Pool << 30) | (toNumber(poolIndex) << 20) | 3;
}

export function getShareInfoIndex(
  accountIndex: number | Field,
  poolIndex: number | Field
) {
  return (
    (AddressSpace.Share << 30) |
    (toNumber(accountIndex) << 10) |
    toNumber(poolIndex)
  );
}

export function getAccountPublicKeyIndex(accountIndex: number | Field) {
  return (AddressSpace.Account << 30) | (toNumber(accountIndex) << 20) | 0;
}

export function getAccountNonceIndex(accountIndex: number | Field) {
  return (AddressSpace.Account << 30) | (toNumber(accountIndex) << 20) | 2;
}

export class L2Storage extends MerkleTree {
  constructor(isInMemory = false) {
    super(isInMemory);
  }

  async getAndUpdateNonce(_accountIndex: number | Field, nonce: Field) {
    const accountIndex = toNumber(_accountIndex);
    const path = await this.getPath(accountIndex);
    await this.setLeave(accountIndex, nonce.add(new Field(1)));
    return path;
  }

  async getPoolInfo(_poolIndex: number | Field) {
    const poolIndex = toNumber(_poolIndex);
    return this.getPath(getPoolInfoIndex(poolIndex));
  }
}

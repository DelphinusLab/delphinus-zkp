import { Field } from "delphinus-curves/src/field";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";

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
    const nonceIndex = getAccountNonceIndex(_accountIndex);
    const path = await this.getPath(nonceIndex);
    await this.setLeave(nonceIndex, nonce.add(new Field(1)));
    return path;
  }

  async getAndAddBalance(
    _accountIndex: number | Field,
    _tokenIndex: number | Field,
    amount: Field
  ) {
    const accountIndex = toNumber(_accountIndex);
    const tokenIndex = toNumber(_tokenIndex);
    const balanceInfoIndex = getBalanceInfoIndex(accountIndex, tokenIndex);

    const path = await this.getPath(balanceInfoIndex);
    const balance = await this.getLeave(balanceInfoIndex);

    await this.setLeave(balanceInfoIndex, balance.add(amount));
    return path;
  }

  async getAndAddShare(
    _accountIndex: number | Field,
    _poolIndex: number | Field,
    amount: Field
  ) {
    const accountIndex = toNumber(_accountIndex);
    const poolIndex = toNumber(_poolIndex);
    const shareInfoIndex = getShareInfoIndex(accountIndex, poolIndex);

    const path = await this.getPath(shareInfoIndex);
    const share = await this.getLeave(shareInfoIndex);

    await this.setLeave(shareInfoIndex, share.add(amount));
    return path;
  }

  async getAndAddLiq(
    _poolIndex: number | Field,
    amount0: Field,
    amount1: Field
  ): Promise<[Field, Field, PathInfo]> {
    const poolIndex = toNumber(_poolIndex);
    const poolInfoIndex = getPoolInfoIndex(poolIndex);
    const path = await this.getPath(poolInfoIndex);

    const poolInfo = await this.getLeaves(poolInfoIndex);
    const tokenIndex0 = poolInfo[0];
    const tokenIndex1 = poolInfo[1];
    const liq0 = poolInfo[2];
    const liq1 = poolInfo[3];

    await this.setLeaves(poolInfoIndex, [
      tokenIndex0,
      tokenIndex1,
      liq0.add(amount0),
      liq1.add(amount1),
    ]);
    return [tokenIndex0, tokenIndex1, path];
  }

  async getPoolInfo(_poolIndex: number | Field) {
    const poolIndex = toNumber(_poolIndex);
    return this.getPath(getPoolInfoIndex(poolIndex));
  }

  async getAccountInfo(_accountIndex: number | Field) {
    const accountIndex = toNumber(_accountIndex);
    return this.getPath(getAccountPublicKeyIndex(accountIndex));
  }
}

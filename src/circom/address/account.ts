import { Field } from "delphinus-curves/src/field";
import { AddressSpace, MetaType, getMetaAddress, toNumber } from "./space";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { ShareCalcHelper } from "../shareCalc_helper";

export class Account {
  index: number;
  storage: MerkleTree;
  constructor(storage: MerkleTree, index: number | Field) {
    this.storage = storage;
    this.index = toNumber(index);
  }

  getBalanceInfoIndex(tokenIndex: number | Field) {
    return (
      (AddressSpace.Balance << 30) |
      (this.index << 10) |
      toNumber(tokenIndex)
    );
  }

  getShareInfoIndex(
      poolIndex: number | Field
  ) {
    return (
      (AddressSpace.Share << 30) |
      (this.index << 10) |
      toNumber(poolIndex)
    );
  }

  getAccountPublicKeyIndex() {
    return getMetaAddress(this.index, MetaType.Account) | 0;
  }

  getAccountNonceIndex() {
    return getMetaAddress(this.index, MetaType.Account) | 2;
  }

  async getAndUpdateNonce(nonce: Field) {
    const nonceIndex = this.getAccountNonceIndex();
    const path = await this.storage.getPath(nonceIndex);
    await this.storage.setLeave(nonceIndex, nonce.add(new Field(1)));
    return path;
  }

  async getAndAddBalance(
    _tokenIndex: number | Field,
    amount: Field
  ) {
    const tokenIndex = toNumber(_tokenIndex);
    const balanceInfoIndex = this.getBalanceInfoIndex(tokenIndex);

    const path = await this.storage.getPath(balanceInfoIndex);
    const balance = await this.storage.getLeave(balanceInfoIndex);

    await this.storage.setLeave(balanceInfoIndex, balance.add(amount));
    return path;
  }

  async getAndUpdateNewShare(
    _poolIndex: number | Field,
    SharePriceK: Field,
    amount: Field
  ){
    const poolIndex = toNumber(_poolIndex);
    const shareInfoIndex = this.getShareInfoIndex(poolIndex);
    const path = await this.storage.getPath(shareInfoIndex);
    const share_pre = await this.storage.getLeave(shareInfoIndex);
    const shareCalc = new ShareCalcHelper;
    const share_add = shareCalc.amountToShare(amount.v,SharePriceK.v);
    const share_total = new Field(share_pre.v.add(share_add));

    await this.storage.setLeave(shareInfoIndex, share_total);

    return path
  }

  async getAndAddShare(
    _poolIndex: number | Field,
    amount: Field
  ) {
    const poolIndex = toNumber(_poolIndex);
    const shareInfoIndex = this.getShareInfoIndex(poolIndex);

    const path = await this.storage.getPath(shareInfoIndex);
    const share = await this.storage.getLeave(shareInfoIndex);

    await this.storage.setLeave(shareInfoIndex, share.add(amount));
    return path;
  }

  async getAccountInfo() {
    return this.storage.getPath(this.getAccountPublicKeyIndex());
  }
}

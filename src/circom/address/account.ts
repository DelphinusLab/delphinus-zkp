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

  getBalanceInfoAddress(tokenIndex: number | Field) {
    return (
      (AddressSpace.Balance << 30) |
      (this.index << 10) |
      toNumber(tokenIndex)
    );
  }

  getShareInfoAddress(
      poolIndex: number | Field
  ) {
    return (
      (AddressSpace.Share << 30) |
      (this.index << 10) |
      toNumber(poolIndex)
    );
  }

  getAccountPublicKeyAddress() {
    return getMetaAddress(this.index, MetaType.Account) | 0;
  }

  getAccountNonceAddress() {
    return getMetaAddress(this.index, MetaType.Account) | 2;
  }

  async getAndUpdateNonce(nonce: Field) {
    const nonceAddress = this.getAccountNonceAddress();
    const path = await this.storage.getPath(nonceAddress);
    await this.storage.setLeave(nonceAddress, nonce.add(new Field(1)));
    return path;
  }

  async getAndAddBalance(
    _tokenIndex: number | Field,
    amount: Field
  ) {
    const tokenIndex = toNumber(_tokenIndex);
    const balanceInfoAddress = this.getBalanceInfoAddress(tokenIndex);

    const path = await this.storage.getPath(balanceInfoAddress);
    const balance = await this.storage.getLeave(balanceInfoAddress);

    await this.storage.setLeave(balanceInfoAddress, balance.add(amount));
    return path;
  }

  async getAndAddShare(
    _poolIndex: number | Field,
    amount: Field
  ) {
    const poolIndex = toNumber(_poolIndex);
    const shareInfoAddress = this.getShareInfoAddress(poolIndex);

    const path = await this.storage.getPath(shareInfoAddress);
    const share = await this.storage.getLeave(shareInfoAddress);

    await this.storage.setLeave(shareInfoAddress, share.add(amount));
    return path;
  }

  async getAccountInfo() {
    return this.storage.getPath(this.getAccountPublicKeyAddress());
  }
}

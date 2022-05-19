import { Field } from "delphinus-curves/src/field";
import { AddressSpace, MetaType, getMetaAddress, toNumber } from "./space";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";
import BN from "bn.js";
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

  getSharePriceKIndex(
    poolIndex: number | Field
  ){
    return (
      (AddressSpace.Share << 30) |
      (toNumber(poolIndex) << 20) |
      (1 << 2) | 0
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

  async calcProfit(
    amount: Field,
    molecule: BN,
    denominator: BN
  ){
    const rem = amount.v.mul(molecule).mod(denominator);
    let profit;
    if (rem.eqn(0)){
      profit = amount.mul(new Field(molecule)).div(new Field(denominator));
    }else{
      profit = amount.mul(new Field(molecule)).sub(new Field(rem)).div(new Field(denominator).add(new Field(1)));
    }
    return profit
  }

  async getAndAddBalanceWithProfit(
    _tokenIndex: number | Field,
    amount: Field
  ) {
    const tokenIndex = toNumber(_tokenIndex);
    const balanceInfoIndex = this.getBalanceInfoIndex(tokenIndex);

    const path = await this.storage.getPath(balanceInfoIndex);
    const balance = await this.storage.getLeave(balanceInfoIndex);
    let swapAmount = amount;
    if(swapAmount.v.isNeg()){
      const profit = await this.calcProfit(amount, new BN(3), new BN(1000));
      swapAmount = swapAmount.add(profit)
    }
    await this.storage.setLeave(balanceInfoIndex, balance.add(swapAmount));
    return path;
  }

  async init_SharePriceK(){
    const k = 10 ** 12;
    return new Field(k);
  }

  async getSharePriceK(
    _sharePriceKIndex: number | Field
  ){
    const sharePriceKIndex = toNumber(_sharePriceKIndex);
    let k = await this.storage.getLeave(sharePriceKIndex);
    if (k.v.eqn(0)){
      k = await this.init_SharePriceK();
    }
    await this.storage.setLeave(sharePriceKIndex, k);
    return k
  }

  async amountToShare(
    amount: Field,
    _sharePriceKIndex: number | Field,
  ){
    const k = await this.getSharePriceK(_sharePriceKIndex);
    const share = amount.mul(k.sub(new Field(1)));
    return share
  }

  async getAndUpdateNewShare(
    _poolIndex: number | Field,
    amount: Field
  ){
    const poolIndex = toNumber(_poolIndex);
    const shareInfoIndex = this.getShareInfoIndex(poolIndex);
    const sharePriceKIndex = this.getSharePriceKIndex(poolIndex);

    const path = await this.storage.getPath(shareInfoIndex);
    const share = await this.storage.getLeave(shareInfoIndex);

    const share_new = this.amountToShare(amount,sharePriceKIndex);
    if(share.add(share_new).v.isNeg()){
      throw Error('Your share amount is insufficient');
    }else{
      await this.storage.setLeave(shareInfoIndex, share.add(share_new));
    }
    return path
  }

  async calcK_new(
    totalAmount: Field,
    k: Field,
    profit: Field
  ){
    const total_new = totalAmount.add(profit);
    const rem = totalAmount.mul(k).v.mod(total_new.v);
    let k_new;
    if (rem.eqn(0)){
      k_new = totalAmount.mul(k).div(total_new);
    }else{
      k_new = totalAmount.mul(k).sub(new Field(rem)).div(total_new).add(new Field(1));
    }
    return k_new
  }

  async getAndUpdateSharePriceK(
    _poolIndex: number | Field,
    amount: Field,
    totalAmount: Field
  ){
    const poolIndex = toNumber(_poolIndex);
    const sharePriceKIndex = this.getSharePriceKIndex(poolIndex);
    const path = await this.storage.getPath(sharePriceKIndex);
    const k = await this.getSharePriceK(sharePriceKIndex);
    const profit = await this.calcProfit(amount, new BN(3), new BN(1000));
    const k_new = await this.calcK_new(totalAmount, k, profit);
    await this.storage.setLeave(sharePriceKIndex, k_new);
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

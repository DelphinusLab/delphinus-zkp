import { Field } from "delphinus-curves/src/field";
import { MetaType, getMetaIndex, toNumber } from "./space";
import { MerkleTree } from "delphinus-curves/src/merkle-tree-large";
import { Account } from "./account";

export class NFT {
    index: number | Field;
    info_index: number;
    owner: number;
    bidder: number;
    biddingAmount: number;
    storage: MerkleTree;

    constructor(storage: MerkleTree, index: number | Field) {
        this.storage = storage;
        this.index = index;
        this.info_index = getMetaIndex(this.index, MetaType.NFT);
        this.owner = this.info_index | 0;
        this.bidder = this.info_index | 1;
        this.biddingAmount = this.info_index | 2;
    }
    
    async getNFTPath() {
        return this.storage.getPath(this.info_index);
    }

    async getAndUpdateNFT(
        owner: Field,
        bidder: Field,
        biddingAmount: Field
    ) {
        const path = await this.getNFTPath();

        const zero = new Field(0); 
        await this.storage.setLeaves(this.info_index, [
            owner,
            bidder,
            biddingAmount,
            zero
        ]);
        return path;
    }

    async getBidderBalance(
        bidder: Field
    ) {
        const _bidder = new Account(this.storage, bidder);
        const index = toNumber(this.info_index);
        const balanceInfoIndex = _bidder.getBalanceInfoIndex(index);
        const balance = await _bidder.storage.getLeave(balanceInfoIndex);

        return balance;
    }
}

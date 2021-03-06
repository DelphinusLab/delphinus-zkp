import { Field } from "delphinus-curves/src/field";
import { MetaType, getMetaAddress, toNumber } from "./space";
import { MerkleTree } from "delphinus-curves/src/merkle-tree-large";
import { Account } from "./account";

const zero = new Field(0);

export class NFT {
    index: number | Field;
    address: number;
    owner: number;
    bidder: number;
    biddingAmount: number;
    storage: MerkleTree;

    constructor(storage: MerkleTree, index: number | Field) {
        this.storage = storage;
        this.index = index;
        this.address = getMetaAddress(this.index, MetaType.NFT);
        this.owner = this.address | 0;
        this.bidder = this.address | 1;
        this.biddingAmount = this.address | 2;
    }

    async getNFTPath() {
        return this.storage.getPath(this.address);
    }

    async getAndUpdateNFT(
        owner: Field,
        bidder: Field,
        biddingAmount: Field
    ) {
        const path = await this.getNFTPath();

        await this.storage.setLeaves(this.address, [
            owner,
            bidder,
            biddingAmount,
            zero
        ]);
        return path;
    }

	async getBidderBalance(
        tokenIndex: number | Field,
        _bidder: Field
    ) {
        const bidder = new Account(this.storage, _bidder);
        const index = toNumber(tokenIndex);
        const balanceInfoAddress = bidder.getBalanceInfoAddress(index);
        const balance = await bidder.storage.getLeave(balanceInfoAddress);

        return balance;
    }
}

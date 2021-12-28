import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";
import { Account } from "../address/account";
import { NFT } from "../address/nft"

// bid
export class BidNFTCommand extends Command {
  get callerAccountIndex() {
    return this.args[9].v.toNumber();
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const owner = this.args[4];
    const bidder = this.args[5];
    const biddingAmount = this.args[6];
    
    const nftIndex = this.args[8];
    const nft = new NFT(storage, nftIndex);
    const account = new Account(storage, this.callerAccountIndex);

    // circuits: check leafValues[0] < 2 ^ 20 & leafValues[0] != 0
    // circuits: check leafValues[1] < 2 ^ 20
    // circuits: check leafValues[2] < 2 ^ 250
    // circuits: check leafValues[3] is 0
    // circuits: check if args[7] is 0
    // circuits: check if owner is equal to leafValues[0]
    // circuits: check bidder < 2 ^ 20 & bidder != 0
    // circuits: check biddingAmount < 2 ^ 250
    // circuits: check biddingAmount > leafValues[2]
    const leafValues = await storage.getLeaves(nft.info_index);

    // check if bidder has enough balance(balance1 >= biddingAmount)
    const balance = nft.getBidderBalance(bidder);
    
    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await account.getAndUpdateNonce(nonce));
    
    // STEP2: if leafValues[1] !=0. update balance of current bidder
    // circuits: check balance0 dosen't overflow
    // get current bidder of nft
    const currentBidder = new Account(storage, leafValues[1]);
    // give back current biddingAmount into currentBiddder's balance
    path.push(await currentBidder.getAndAddBalance(nft.info_index, leafValues[2]));

    // STEP3: update balance of bidder
    const _bidder = new Account(storage, bidder);
    path.push(await _bidder.getAndAddBalance(nft.info_index, new Field(0).sub(biddingAmount)));

    // STEP4: update nft info
    path.push(await nft.getAndUpdateNFT(owner, bidder, biddingAmount));

    return path;
  }
}

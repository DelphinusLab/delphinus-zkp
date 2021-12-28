import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";
import { Account } from "../address/account";
import { NFT } from "../address/nft"

// start auction
export class DepositNFTCommand extends Command {
  get callerAccountIndex() {
    return this.args[9].v.toNumber();
  }

  async run(storage: L2Storage) {
    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const owner = this.args[4];
    const bidder = this.args[5];
    const biddingAmount = this.args[6];

    // circuits: check if bidder, biddingAmount and args[7] is 0
    // circuits: check owner < 2 ^ 20 & owner != 0
    const nftIndex = this.args[8];
    const nft = new NFT(storage, nftIndex);
    const account = new Account(storage, this.callerAccountIndex);

    // circuits: check if leafValues[0]-leafValues[3] is 0
    const leafValues = await storage.getLeaves(nft.info_index);

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await account.getAndUpdateNonce(nonce));
    
    // STEP2: update nft info
    path.push(await nft.getAndUpdateNFT(owner, bidder, biddingAmount));
    
    return path;
  }
}

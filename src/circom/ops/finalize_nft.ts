import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";
import { Account } from "../address/account";
import { NFT } from "../address/nft"

// finalize
export class FinalizeNFTCommand extends Command {
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
    // circuits: check leafValues[1] < 2 ^ 20 & leafValues[1] != 0
    // circuits: check leafValues[2] < 2 ^ 250 & leafValues[2] != 0
    // circuits: check leafValues[3] is 0
    // circuits: check if args[7] is 0
    // circuits: check owner is equal to leafValues[1]
    // circuits: check bidder and biddingAmount is equal to 0
    const leafValues = await storage.getLeaves(nft.info_index);

    // STEP1: udpate nonce
    // circuits: check nonce
    // circuits: check caller permission
    path.push(await account.getAndUpdateNonce(nonce));

    // STEP2: update balance of current owner
    // circuits: check balance dosen't overflow
    const _owner = new Account(storage, leafValues[0]);
    path.push(await _owner.getAndAddBalance(nft.info_index, leafValues[2]));

    // STEP3: update nft info
    path.push(await nft.getAndUpdateNFT(owner, bidder, biddingAmount));

    return path;
  }
}

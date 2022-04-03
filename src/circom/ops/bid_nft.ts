import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";
import { Account } from "../address/account";
import { NFT } from "../address/nft"

// bid
export class BidNFTCommand extends Command {
  get callerAccountIndex() {
    return this.args[4].v.toNumber();
  }

  async run(storage: L2Storage) {
	/*
      Description for circom:
        This function is for changing nft node's bidder and biddingAmount. It will try to update the nft node's bidder and biddingAmount.
      Input/Output of circom:
        signal input args[6];
        signal input dataPath[5][66];
        signal input signer;
        signal input signed;
        signal output newDataPath[5][66];
        signal output out;
      In TS file, this.args is Array[9]. [0], [3] - [7] will be passed to circom.
      In circom, signal input args[6]
        args[0] is the command code.
        args[1] = this.args[3], which is nonce.
        args[2] = this.args[4], which is accountIndex.
        args[3] = this.args[5], which is nftIndex.
        args[4] = this.args[6], which is biddingAmount.
        args[5] = this.args[7], which is reserved.
    */
    const tokenIndex = 1; // constant, temporary now
    const path = [] as PathInfo[];

    // owner is not changed, omit it
    const nonce = this.args[3];
    const accountIndex = this.args[4];
    const nftIndex = this.args[5];
    const biddingAmount = this.args[6];

    // circuits: check dataPath[3]'s leafValues[0] < 2 ^ 20 & leafValues[0] != 0
    // circuits: check dataPath[3]'s leafValues[1] < 2 ^ 20
    // circuits: check dataPath[3]'s leafValues[2] < 2 ^ 250
    // circuits: check accountIndex < 2 ^ 20 & accountIndex != 0
    // circuits: check biddingAmount < 2 ^ 250 & biddingAmount > dataPath[3]'s leafValues[2]
    // circuits: check nftIndex < 2 ^ 20 & nftIndex != 0
    // circuits: check nftIndex == CheckNFTIndexFE's output nftIndex
    // circuits: check signer == accountIndex
    const nft = new NFT(storage, nftIndex);
    const account = new Account(storage, this.callerAccountIndex);
    const leafValues = await storage.getLeaves(nft.address);

    // check accountIndex has enough balance(>= biddingAmount)
    const balance = nft.getBidderBalance(tokenIndex, accountIndex);
    
    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await account.getAndUpdateNonce(nonce));
    
    // STEP2: if dataPath[3]'s leafValues[1] !=0, update balance of current accountIndex
    // circuits: check balance dosen't overflow
    // get current accountIndex of nft
    const currentBidder = new Account(storage, leafValues[1]);
    // give back current biddingAmount into currentBiddder's balance
    path.push(await currentBidder.getAndAddBalance(tokenIndex, leafValues[2]));

    // STEP3: update balance of accountIndex
    const bidder = new Account(storage, accountIndex);
    path.push(await bidder.getAndAddBalance(tokenIndex, new Field(0).sub(biddingAmount)));

    // STEP4: update nft info with new accountIndex and biddingAmount
    const zero = new Field(0);
    path.push(await nft.getAndUpdateNFT(leafValues[0], accountIndex, biddingAmount));

    return path;
  }
}

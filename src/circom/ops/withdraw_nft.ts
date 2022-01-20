import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";
import { Account } from "../address/account";
import { NFT } from "../address/nft"

// cancel auction
export class WithdrawNFTCommand extends Command {
  get callerAccountIndex() {
    return this.args[8].v.toNumber();
  }

  async run(storage: L2Storage) {
	/*
      Description for circom:
        This function is for changing nft node's owner. It will try to update the nft node's owner.
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
        args[2] = this.args[4], which is owner (new owner we want to transfer to).
        args[3] = this.args[5], which is bidder.
        args[4] = this.args[6], which is biddingAmount.
        args[5] = this.args[7], which is nftIndex.
    */
    const tokenIndex = 1; // constant, temporary now
    const path = [] as PathInfo[];

    // owner, bidder, biddingAmount is 0, omit them
    const nonce = this.args[3];
    const nftIndex = this.args[7];

    // circuits: check dataPath[2][66]'s leafValues[0] != 0 & leafValues[0] < 2 ^ 20
    // circuits: check dataPath[2]'s leafValues[1] < 2 ^ 20
    // circuits: check dataPath[2]'s leafValues[2] < 2 ^ 250
    // circuits: check owner, bidder and biddingAmount is 0
    // circuits: check signer == dataPath[2]'s leafValues[0]
    // circuits: check nftIndex < 2 ^ 20 & nftIndex != 0
    // circuits: check nftIndex == CheckNFTIndexFE's output nftIndex
    const nft = new NFT(storage, nftIndex);
    const account = new Account(storage, this.callerAccountIndex);
    const leafValues = await storage.getLeaves(nft.address);

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await account.getAndUpdateNonce(nonce));
    
    // STEP2: if dataPath[2]'s leafValues[1] != 0, return biddingAmount to bidder
    // circuits: check balance of current bidder dosen't overflow(< 2 ^ 250)
    // get current bidder of nft
    const currentBidder = new Account(storage, leafValues[1]);
    path.push(await currentBidder.getAndAddBalance(tokenIndex, leafValues[2]));

    // STEP3: update nft with new owner, bidder and, biddingAmount
    const zero = new Field(0);
    path.push(await nft.getAndUpdateNFT(zero, zero, zero));

    return path;
  }
}

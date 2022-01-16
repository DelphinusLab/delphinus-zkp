import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";
import { Account } from "../address/account";
import { NFT } from "../address/nft"

// cancel auction
export class WithdrawNFTCommand extends Command {
  get callerAccountIndex() {
    return this.args[9].v.toNumber();
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

    const path = [] as PathInfo[];

    const nonce = this.args[3];
    const owner = this.args[4];
    const bidder = this.args[5];
    const biddingAmount = this.args[6];
   
    /*
      Issue here:
        nftIndex need to be passed to circom, so it need to be this.arg[7].
        Then in circom, the CheckNFTIndex functionality's output should have nftIndex which parser from address (dataPath[1][0])
        and need check nftIndex(args[5]) == CheckNFTIndex functionality's output nftIndex.
    */
    const nftIndex = this.args[8];
    const nft = new NFT(storage, nftIndex);
    const account = new Account(storage, this.callerAccountIndex);

     /*
      For circom:
        1. Check dataPath[1]'s leafValues[0] < 2 ^ 20 & leafValues[0] != 0 (dataPath[1]'s leafValues[0] is current owner of the NFT)
        2. If leafValues[1]-leafValues[2] is not 0, it means we current have bidder and biddingAmount. We need return biddingAmount to bidder.
            (need to be a component)
        3. Check dataPath[1]'s leafValues[0] == signer
        4. Check owner, bidder, biddingAmount is 0.
    */
    const leafValues = await storage.getLeaves(nft.info_index);

    /*
      For circom:
        Nonce is in dataPath[0][66]
        Check and update nonce.
    */
    path.push(await account.getAndUpdateNonce(nonce));
    
    /*
      For circom:
        nft nodes in dataPath[1][66]
        Update nft nodes to set owner/bidder/biddingAmount to 0.
        Need need return biddingAmount to bidder if current bidder/biddingAmount is not 0.
    */
    path.push(await nft.getAndUpdateNFT(owner, bidder, biddingAmount));

    return path;
  }
}

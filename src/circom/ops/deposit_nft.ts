import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";
import { Account } from "../address/account";
import { NFT } from "../address/nft"

// start auction
export class DepositNFTCommand extends Command {
  get callerAccountIndex() {
    return this.args[8].v.toNumber();
  }

  async run(storage: L2Storage) {
    /*
      Description for circom:
        This function is for initialing nft nodes. It will try to update the Nonce of caller and update the nft nodes' owner.
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
        args[2] = this.args[4], which is owner_accountIndex.
        args[3] = this.args[5], which is nftIndex.
        args[4] = this.args[6], which is l1_tx_hash.
        args[5] = this.args[7], which is reserved.
    */
    const path = [] as PathInfo[];

    // bidder and biddingAmount have not participanted in deposit_nft, omit them
    const nonce = this.args[3];
    const owner_accountIndex = this.args[4];
    const nftIndex = this.args[5];

    // circuits: check nftIndex < 2 ^ 20 & nftIndex != 0
    // circuits: check nftIndex == CheckNFTIndexFE's output nftIndex
    // circuits: check owner_accountIndex < 2 ^ 20 & owner_accountIndex != 0
    const nft = new NFT(storage, nftIndex);
    const account = new Account(storage, this.callerAccountIndex);

    // circuits: check dataPath[1][66]'s leafValues[0]-leafValues[2] is 0
    const leafValues = await storage.getLeaves(nft.address);

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await account.getAndUpdateNonce(nonce));

    // STEP2: update nft info with new owner_accountIndex
    const zero = new Field(0);
    path.push(await nft.getAndUpdateNFT(owner_accountIndex, zero, zero));

    return path;
  }
}

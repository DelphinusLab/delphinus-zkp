import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "../address-space";
import { Command } from "../command";
import { Account } from "../address/account";
import { NFT } from "../address/nft"

// change owner from current acount to another
export class TransferNFTCommand extends Command {
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
        signal input signed
        args[0] is the command code.
        args[1] = this.args[3], which is nonce.
        args[2] = this.args[4], which is original_owner_accountIndex.
        args[3] = this.args[5], which is nftIndex.
        args[4] = this.args[6], which is new_owner_accountIndex.
        args[5] = this.args[7], which is reserved.
    */
    const path = [] as PathInfo[];

    // bidder and biddingAmount have not participanted in transfer_nft, omit them
    const nonce = this.args[3];
    const nftIndex = this.args[5];
		const new_owner_accountIndex = this.args[6];
    // circuits: check dataPath[1]'s leafValues[0] < 2 ^ 20 & leafValues[0] != 0
    // circuits: check new_owner_accountIndex < 2 ^ 20 & new_owner_accountIndex != 0
    // circuits: check dataPath[1]'s leafValues[0] != new_owner_accountIndex
    // circuits: check dataPath[1]'s leafValues[1] < 2 ^ 20
    // circuits: check dataPath[1]'s leafValues[2] < 2 ^ 250
    // circuits: check nftIndex < 2 ^ 20 & nftIndex != 0
    // circuits: check nftIndex == CheckNFTIndexFE's output nftIndex
    // circuits: check signer == dataPath[1]'s leafValues[0]
    const nft = new NFT(storage, nftIndex);
    const account = new Account(storage, this.callerAccountIndex);
    const leafValues = await storage.getLeaves(nft.address);

    // STEP1: udpate nonce
    // circuits: check nonce
    path.push(await account.getAndUpdateNonce(nonce));
    
    // STEP2: update nft info with new owner
    const zero = new Field(0);
    path.push(await nft.getAndUpdateNFT(new_owner_accountIndex, leafValues[1], leafValues[2]));

    return path;
  }
}

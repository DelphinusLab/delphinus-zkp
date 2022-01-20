pragma circom 2.0.2;
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
        args[2] = this.args[4], which is owner.
        args[3] = this.args[5], which is bidder.
        args[4] = this.args[6], which is biddingAmount.
        args[5] = this.args[7], which is nftIndex.
*/
include "../utils/bit.circom";
include "../utils/swap_aux.circom";

template DepositNFT() {
    var MaxStep = 5;
    var argNonceIndex = 0;
    var argNFTIndex = 1;
    var IndexOffset = 0;
    var LeaveStartOffset = 61;
    var OwnerOffset = LeaveStartOffset;
    var BidderOffset = LeaveStartOffset + 1;
    var BiddingAmountOffset = LeaveStartOffset + 2;
    var NFTIndexOffset = LeaveStartOffset + 3;
    var MaxTreeDataIndex = 66;
    var CommandArgs = 6;

    signal input args[CommandArgs];
    signal input dataPath[MaxStep][MaxTreeDataIndex];
    signal input signer;
    signal input signed;
    signal output newDataPath[MaxStep][MaxTreeDataIndex];
    signal output out;

    component andmany = AndMany(8);
    var andmanyOffset = 0;

    // bidder and biddingAmount have not participanted in deposit_nft, omit them
    var nonce = args[1];
    var owner = args[2];
    var nftIndex = args[5];

    // circuits: check nftIndex < 2 ^ 20 & nftIndex != 0
    component rangecheck0 = Check2PowerRangeFE(20);
    rangecheck0.in <== nftIndex;
    component zero0 = IsZero();
    zero0.in <== nftIndex;
    andmany.in[andmanyOffset] <== rangecheck0.out * (1 - zero0.out);
    andmanyOffset++;

    // circuits: check owner < 2 ^ 20 & owner != 0
    component rangecheck1 = Check2PowerRangeFE(20);
    rangecheck1.in <== owner;
    component zero1 = IsZero();
    zero1.in <== owner;
    andmany.in[andmanyOffset] <== rangecheck1.out * (1 - zero1.out);
    andmanyOffset++;
    
    // circuits: check dataPath[1][66]'s leafValues[0]-leafValues[2] is 0
    component zero2 = IsZero();
    zero2.in <== dataPath[argNFTIndex][OwnerOffset];
    component zero3 = IsZero();
    zero3.in <== dataPath[argNFTIndex][BidderOffset];
    component zero4 = IsZero();
    zero4.in <== dataPath[argNFTIndex][BiddingAmountOffset];

    signal mul;
    mul <== zero2.out * zero3.out;
    andmany.in[andmanyOffset] <== mul * zero4.out;
    andmanyOffset++;

    // STEP1: udpate nonce
    component checkNonce = CheckAndUpdateNonceFE();
    checkNonce.nonce <== nonce;
    checkNonce.caller <== signer;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        checkNonce.dataPath[i] <== dataPath[argNonceIndex][i];
    }
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[argNonceIndex][i] <== checkNonce.newDataPath[i];
    }
    andmany.in[andmanyOffset] <== checkNonce.out;
    andmanyOffset++;

    // circuits: check caller permission and signer
    component perm = CheckPermission(1);
    perm.caller <== checkNonce.caller;
    andmany.in[andmanyOffset] <== perm.out;
    andmanyOffset++;

    andmany.in[andmanyOffset] <== signed;
    andmanyOffset++;

    // circuits: check index of dataPath[argNFTIndex] meets nft encoding
    component check_NFT_index = CheckNFTIndexFE();
    check_NFT_index.index <== dataPath[argNFTIndex][IndexOffset];
    andmany.in[andmanyOffset] <== check_NFT_index.out;
    andmanyOffset++;

    // circuits: check nftIndex == CheckNFTIndexFE's output nftIndex
    component eq = IsEqual();
    eq.in[0] <== check_NFT_index.nftIndex;
    eq.in[1] <== nftIndex; 
    andmany.in[andmanyOffset] <== eq.out;
    andmanyOffset++;

    // STEP2: udpate nft info
    component setNFTInfo = SetNFTValueFromTreePath();
    setNFTInfo.owner <== owner;
    setNFTInfo.bidder <== 0;
    setNFTInfo.biddingAmount <== 0;
    for (var i = 0; i < MaxTreeDataIndex; i++) {
        setNFTInfo.treeData[i] <== dataPath[argNFTIndex][i];
    }

    for(var i = 0; i < MaxTreeDataIndex; i++) {
        newDataPath[argNFTIndex][i] <== setNFTInfo.newTreeData[i];
    }

    for (var i = 2; i < MaxStep; i++) {
        for (var j = 0; j < MaxTreeDataIndex; j++) {
            newDataPath[i][j] <== dataPath[i][j];
        }
    }

    out <== andmany.out;
}

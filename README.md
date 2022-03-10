# Delphinus ZKP Design

## Storage - merkle tree with 32bits index - 4 nodes per layer - 4G Item [field = U252] in total

### To get value from storage

Giving root hash and digest path for validation

### Address Space

(2bits) Class

1. b00 Balance: (20bits) account index + (10bits) token index
2. b01 Pool: (10bits) pool index + (18bits) 0 + (2bits) poolinfo (token0index, token1index, amount0, amount1)
3. b10 Share: (20bits) account index + (10bits) pool index
4. b11 Account: (20bits) account index + (4bits) MetaType(0) + (6bits) info data (0 & 1 - public key, 2 - nonce, other -reserved)
5. b11 NFT: (20bits) nft index + (4bits) MetaType(1) + (6bits) info data (0 - owner, 1 - bidder, 2 - biddingAmount, 3 - reserved)

## Circom Plan

Assue admin's account index is 0.

## Common Args

- op - 8 bits
- sign(3) - 384 bits
- nonce - 64 bits

## Commands and Args

- deposit(0) - accountIndex(32 bits) tokenIndex(32 bits) amount(256 bits) l1_tx_hash(256bits)
- withdraw(1) - accountIndex(32 bits) tokenIndex(32 bits) amount(256 bits) l1address(256bits)
- swap(2) - accountIndex(32 bits) poolIndex(32 bits) reverse(255 reserved bits + 1bits) amount(256 bits)
- supply(4)/retrieve(3) - accountIndex(32 bits) poolIndex(32 bits) amount0(256 bits) amount1(256 bits)
- addpool(5) - tokenIndex0(32 bits) tokenIndex1(32bits) reserved(256 bits) reserved(256bits)
- setkey(6) - accountIndex(32 bits) reserve(32 bits) x(256 bits) y(256bits)
- deposit_nft(7) - owner(32 bits) bidder(32 bits) biddingAmount(256 bits) nftIndex(32bits)
- withdraw_nft(8) - owner(32 bits) bidder(32 bits) biddingAmount(256 bits) nftIndex(32bits)
- transfer_nft(9) - owner(32 bits) bidder(32 bits) biddingAmount(256 bits) nftIndex(32bits)
- bid_nft(10) - owner(32 bits) bidder(32 bits) biddingAmount(256 bits) nftIndex(32bits)
- finalize_nft(11) - owner(32 bits) bidder(32 bits) biddingAmount(256 bits) nftIndex(32bits)

## Additional Args (not in circuits)

- addpool(5) - poolIndex(u32)

## Prerequisites

- install rust, circom and snarkjs, see <https://docs.circom.io/getting-started/installation/>
- in `circom` folder, run `bash tools/setup.sh`
- in `circom` folder, run `bash tools/compile.sh`

## How to contribute

- Run `bash circom_test.sh ${path of config.json}` to see how many tests would fail.
- Implement circom/main.circom to pass those test.
- We would continuously add more tests.
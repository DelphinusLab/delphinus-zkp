# Delphinus ZKP Design

## Storage - 32bits markle tree - 4 nodes per layer - 4G Item [field = U252]

### To get value from storage

Giving root hash and item path (with neighbor's hash) for validation

### Namespace

(2bits) Class

1. b00 Balance: (20bits) account index + (10bits) token index
2. b01 Pool: (10bits) pool index + (18bits) 0 + (2bits) poolinfo (token0index, token1index, amount0, amount1)
3. b10 Share: (20bits) account index + (10bits) pool index

## Circom Plan

Assue admin's account index is 0.

## Common Args

- op - 8 bits
- sign(3) - 384 bits
- nonce - 64 bits

## Commands and Args

- deposit - accountIndex(32 bits) tokenIndex(32 bits) amount(256 bits) 0(256bits)
- withdraw - accountIndex(32 bits) tokenIndex(32 bits) amount(256 bits) l1address(256bits)
- swap - accountIndex(32 bits) poolIndex + direction(31 + 1 bits) amount(256 bits)
- withdraw/supply - accountIndex(32 bits) poolIndex(32 bits) amount0(256 bits)
- addpool - poolIndex(32 bits) tokenIndexPair(16 + 16bits) amount0(256 bits) amount1(256bits)
- setkey - accountIndex(32 bits) reserve(32 bits) x(256 bits) y(256bits)

## Prerequisites

- install rust, circom and snarkjs, see <https://docs.circom.io/getting-started/installation/>
- in `circom` folder, run `bash tools/setup.sh`
- in `circom` folder, run `bash tools/compile.sh`

## How to contribute

- Run `node dist/tests/circom.test.js` to see how many tests would fail.
- Implement circom/main.circom to pass those test.
- We would continuously add more tests.

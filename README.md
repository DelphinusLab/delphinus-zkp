# Delphinus ZKP Design

## Storage - 32bits markle tree - 4 nodes per layer - 4G Item [field = U252]

### To get value from storage

Giving root hash and item path (with neighbor's hash) for validation

### Namespace
(2bits) Class

1. b00 Balance: (20bits) account index + (10bits) token index
2. b01 Pool: (10bits) pool index + (18bits) 0 + (2bits) poolinfo (token0index, token1index, amount0, amount1)
3. b10 Share: (20bits) account index + (10bits) pool index


## Command
command has 1 opcode + 8 args (padding 0 if not reach 8).
Each opcode is 128bits and args are 256bits (TB compact)

For L1, first sha the command op + args and check the sha input of zkp.
Then if it is Withdraw or Addpool, handle it accordingly, 

opcode:

(* most command has first 3 args reserved for signature *)

(* Swap direction is - 0 = save token 0 and take token 1, 1 = reverse *)

* 0 Deposit  - accountIndex tokenIndex amount
* 1 Withdraw - 0 0 0 accountIndex tokenIndex amount l1address nonce
* 2 Swap     - 0 0 0 accountIndex poolIndex amount direction nonce
* 3 Supply   - 0 0 0 accountIndex poolIndex amount0 amount1 nonce
* 4 Retrieve - 0 0 0 accountIndex poolIndex amount0 amount1 nonce
* 5 AddPool  - poolindex token0index token1index
* 6 setkey   - reserved
* 7 AddToken - tokenAddress tokenIndex
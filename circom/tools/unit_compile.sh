pushd $1
circom main.circom --r1cs --wasm --sym -c
npx snarkjs groth16 setup main.r1cs pot20_final.ptau main_0000.zkey
popd

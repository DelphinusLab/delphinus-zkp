circom main.circom --r1cs --wasm --sym
npx snarkjs groth16 setup main.r1cs ../../pot20_final.ptau main_0000.zkey
npx snarkjs zkey export verificationkey main_0000.zkey verification_key.json
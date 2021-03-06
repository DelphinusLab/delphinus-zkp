folders=($1)

for folder in folders;
do
    cd $1
        circom main.circom --r1cs --wasm --sym
        npx snarkjs groth16 setup main.r1cs ../../pot20_final.ptau main_0000.zkey
        npx snarkjs zkey export verificationkey main_0000.zkey verification_key.json
        npx snarkjs zkey export solidityverifier main_0000.zkey verifier.sol
        node main_js/generate_witness.js main_js/main.wasm input.json witness.wtns
        echo run $(basename $1) passed
    cd -
done

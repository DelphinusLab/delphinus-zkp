basename=$(basename $1 .circom)
circom $1 --r1cs --wasm --sym -c
node ${basename}_js/generate_witness.js ${basename}_js/${basename}.wasm ${basename}.input.json witness.wtns

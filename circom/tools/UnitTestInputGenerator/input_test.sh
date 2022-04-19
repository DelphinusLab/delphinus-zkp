node main_js/generate_witness.js main_js/main.wasm input.json witness.wtns
npx snarkjs groth16 prove main_0000.zkey witness.wtns proof.json public.json
npx snarkjs groth16 verify verification_key.json public.json proof.json
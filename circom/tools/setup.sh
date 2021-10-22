#snarkjs powersoftau contribute pot20_0000.ptau pot20_0001.ptau --name="Delphinus" -v
snarkjs powersoftau new bn128 12 pot20_0000.ptau -v
snarkjs powersoftau contribute pot20_0000.ptau pot20_0001.ptau --name="Second Delphinus contribution" -v -e="mcisanJJNDUINisudajdno@$#@%@#$%#$@%nfisdanSAMpo"
snarkjs powersoftau verify pot20_0001.ptau
snarkjs powersoftau prepare phase2 pot20_0001.ptau pot20_final.ptau -v

# proof and verify
# snarkjs groth16 prove main_0000.zkey witness.wtns proof.json public.json
# snarkjs groth16 verify verification_key.json public.json proof.json

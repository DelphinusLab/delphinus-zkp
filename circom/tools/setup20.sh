if [ ! -f pot20_final.ptau ];
then
    npx snarkjs powersoftau new bn128 17 pot20_0000.ptau -v
    npx snarkjs powersoftau contribute pot20_0000.ptau pot20_0001.ptau --name="Second Delphinus contribution" -v -e="mcisanJJNDUINisudajdno@$#@%@#$%#$@%nfisdanSAMpo"
    npx snarkjs powersoftau verify pot20_0001.ptau
    npx snarkjs powersoftau prepare phase2 pot20_0001.ptau pot20_final.ptau -v
fi


PTAUNUM=23;
if [ ! -z $1 ]
then
    PTAUNUM=$1
fi

echo "PATUNUM is $1"

if [ ! -f pot${1}_final.ptau ]
then
    npx snarkjs powersoftau new bn128 ${1} pot${1}_0000.ptau -v
    npx snarkjs powersoftau contribute pot${1}_0000.ptau pot${1}_0001.ptau --name="Second Delphinus contribution" -v -e="mcisanJJNDUINisudajdno@$#@%@#$%#$@%nfisdanSAMpo"
    npx snarkjs powersoftau verify pot${1}_0001.ptau
    npx snarkjs powersoftau prepare phase2 pot${1}_0001.ptau pot${1}_final.ptau -v
fi


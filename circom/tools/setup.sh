PTAUNUM=23;
if [ ! -z $1 ]
then
    PTAUNUM=$1
fi

echo "PATUNUM is $PTAUNUM"

if [ ! -f pot${PTAUNUM}_final.ptau ]
then
    npx snarkjs powersoftau new bn128 ${PTAUNUM} pot${PTAUNUM}_0000.ptau -v
    npx snarkjs powersoftau contribute pot${PTAUNUM}_0000.ptau pot${PTAUNUM}_0001.ptau --name="Second Delphinus contribution" -v -e="mcisanJJNDUINisudajdno@$#@%@#$%#$@%nfisdanSAMpo"
    npx snarkjs powersoftau verify pot${PTAUNUM}_0001.ptau
    npx snarkjs powersoftau prepare phase2 pot${PTAUNUM}_0001.ptau pot${PTAUNUM}_final.ptau -v
fi


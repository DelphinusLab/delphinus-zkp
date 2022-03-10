# ${1} config.json location
RED=$'\033[1;31m'
GREEN=$'\033[1;32m'

npx tsc
node ../../../dist/circom/tools/UnitTestInputGenerator/Circom.test.js ${1}
for input in *.json; do
    if [[ "$input" == *"Addpool"* ]]; then
        cp $input ../../unit_tests/addpool/input.json
        if test -f "../../unit_tests/addpool/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/addpool
        else
            echo "${RED}testing addpool"
            bash ../unit_run_full.sh ../../unit_tests/addpool
        fi
    elif [[ "$input" == *"Setkey"* ]]; then
        cp $input ../../unit_tests/setkey/input.json
        if test -f "../../unit_tests/setkey/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/setkey
        else
            echo "${RED}testing setkey"
            bash ../unit_run_full.sh ../../unit_tests/setkey
        fi
    elif [[ "$input" == *"Deposit"* ]]; then
        cp $input ../../unit_tests/deposit/input.json
        if test -f "../../unit_tests/deposit/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/deposit
        else
            echo "${RED}testing deposit"
            bash ../unit_run_full.sh ../../unit_tests/deposit
        fi
    elif [[ "$input" == *"Depo_NFT"* ]]; then
        cp $input ../../unit_tests/deposit_nft/input.json
        if test -f "../../unit_tests/deposit_nft/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/deposit_nft
        else
            echo "${RED}testing deposit nft"
            bash ../unit_run_full.sh ../../unit_tests/deposit_nft
        fi
    elif [[ "$input" == *"Bid_NFT"* ]]; then
        cp $input ../../unit_tests/bid_nft/input.json
        if test -f "../../unit_tests/bid_nft/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/bid_nft
        else
            echo "${RED}testing bid nft"
            bash ../unit_run_full.sh ../../unit_tests/bid_nft
        fi
    elif [[ "$input" == *"Trans_NFT"* ]]; then
        cp $input ../../unit_tests/transfer_nft/input.json
        if test -f "../../unit_tests/transfer_nft/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/transfer_nft
        else
            echo "${RED}testing transfer nft"
            bash ../unit_run_full.sh ../../unit_tests/transfer_nft
        fi
    elif [[ "$input" == *"Finali_NFT"* ]]; then
        cp $input ../../unit_tests/finalize_nft/input.json
        if test -f "../../unit_tests/finalize_nft/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/finalize_nft
        else
            echo "${RED}finalize nft"
            bash ../unit_run_full.sh ../../unit_tests/finalize_nft
        fi
    elif [[ "$input" == *"Withd_NFT"* ]]; then
        cp $input ../../unit_tests/withdraw_nft/input.json
        if test -f "../../unit_tests/withdraw_nft/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/withdraw_nft
        else
            echo "${RED}testing withdraw nft"
            bash ../unit_run_full.sh ../../unit_tests/withdraw_nft
        fi
    fi
done
echo "${GREEN}All unit tests passed"
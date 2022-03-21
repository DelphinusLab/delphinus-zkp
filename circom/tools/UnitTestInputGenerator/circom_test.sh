# ${1} config.json location
RED=$'\033[1;31m'
GREEN=$'\033[1;32m'

npx tsc
node ../../../dist/circom/tools/UnitTestInputGenerator/Circom.test.js config.json
for input in *.json; do
    if [[ "$input" == *"Addpool"* ]]; then
        cp $input ../../unit_tests/addpool/input.json
        if test -f "../../unit_tests/addpool/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/addpool
        else
            echo "${RED}testing addpool"
            bash ../unit_run_full.sh ../../unit_tests/addpool
        fi
    elif [[ "$input" == *"Swap"* ]]; then
        cp $input ../../unit_tests/swap/input.json
        if test -f "../../unit_tests/swap/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/swap
        else
            echo "${RED}testing swap"
            bash ../unit_run_full.sh ../../unit_tests/swap
        fi
    elif [[ "$input" == *"Supply"* ]]; then
        cp $input ../../unit_tests/supply/input.json
        if test -f "../../unit_tests/supply/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/supply
        else
            echo "${RED}testing supply"
            bash ../unit_run_full.sh ../../unit_tests/supply
        fi
    elif [[ "$input" == *"Retrieve"* ]]; then
        cp $input ../../unit_tests/retrieve/input.json
        if test -f "../../unit_tests/retrieve/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/retrieve
        else
            echo "${RED}testing retrieve"
            bash ../unit_run_full.sh ../../unit_tests/retrieve
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
    elif [[ "$input" == *"Withdraw"* ]]; then
        cp $input ../../unit_tests/withdraw/input.json
        if test -f "../../unit_tests/withdraw/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/withdraw
        else
            echo "${RED}testing withdraw"
            bash ../unit_run_full.sh ../../unit_tests/withdraw
        fi
    elif [[ "$input" == *"DepoNFT"* ]]; then
        cp $input ../../unit_tests/deposit_nft/input.json
        if test -f "../../unit_tests/deposit_nft/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/deposit_nft
        else
            echo "${RED}testing deposit nft"
            bash ../unit_run_full.sh ../../unit_tests/deposit_nft
        fi
    elif [[ "$input" == *"BidNFT"* ]]; then
        cp $input ../../unit_tests/bid_nft/input.json
        if test -f "../../unit_tests/bid_nft/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/bid_nft
        else
            echo "${RED}testing bid nft"
            bash ../unit_run_full.sh ../../unit_tests/bid_nft
        fi
    elif [[ "$input" == *"TransNFT"* ]]; then
        cp $input ../../unit_tests/transfer_nft/input.json
        if test -f "../../unit_tests/transfer_nft/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/transfer_nft
        else
            echo "${RED}testing transfer nft"
            bash ../unit_run_full.sh ../../unit_tests/transfer_nft
        fi
    elif [[ "$input" == *"FinaliNFT"* ]]; then
        cp $input ../../unit_tests/finalize_nft/input.json
        if test -f "../../unit_tests/finalize_nft/main_0000.zkey"; then
            bash input_test.sh ../../unit_tests/finalize_nft
        else
            echo "${RED}finalize nft"
            bash ../unit_run_full.sh ../../unit_tests/finalize_nft
        fi
    elif [[ "$input" == *"WithdNFT"* ]]; then
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
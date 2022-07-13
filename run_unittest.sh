# Run ts unittests
echo "Begin Typescript unittests."
npx jest --verbose
echo "Typescript unittests finished."

# Run circom unit test
echo "Begin Circom unittests"
cd circom

## Check pot23_final.ptau exists, if not, run setup.sh
if [ ! -f pot23_final.ptau ]
    bash setup.sh
fi

## Run the shell script to run all tests under CircomTestTool tests directory
cd tools/CircomTestTool
bash unit_test.sh

echo "Circom unittests finished"

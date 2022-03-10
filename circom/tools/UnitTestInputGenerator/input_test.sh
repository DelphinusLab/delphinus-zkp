folders=($1)

for folder in folders;
do
    cd $1
        node main_js/generate_witness.js main_js/main.wasm input.json witness.wtns
        echo run $(basename $1) passed
    cd -
done
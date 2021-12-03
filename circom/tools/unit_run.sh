pushd $1
node main_js/generate_witness.js main_js/main.wasm input.json witness.wtns
popd

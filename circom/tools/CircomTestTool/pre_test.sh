circom main.circom --r1cs --wasm --sym -c

NODE_OPTIONS=--max-old-space-size=50096 snarkjs groth16 setup main.r1cs ../../pot23_final.ptau main_0000.zkey

snarkjs zkey contribute main_0000.zkey main_0001.zkey --name="First Delphinus Contribution" -v -e="njsdT&^(&67vb 7rt%^rb56r8b5^^rb568RBTGBrv5vfdaufY&Y*^hn6R"

snarkjs zkey contribute main_0001.zkey main_0002.zkey --name="Second Delphinus Contribution" -v -e="fnasjiovak@^&%^&#fdsaHN&nclkzjmimcua8f%$^&(67643%@^fds&%4fdsU"

snarkjs zkey export bellman main_0002.zkey challenge_phase2_0003
snarkjs zkey bellman contribute bn128 challenge_phase2_0003 response_phase2_0003 -e="hdsanvaiy79678TGCBF(^&BT(B^&gn0NG^(EG#D(^&U)*787yy-FDSF"
snarkjs zkey import bellman main_0002.zkey response_phase2_0003 main_0003.zkey -n="Third Delphinus Contribution"

snarkjs zkey export verificationkey main_0003.zkey verification_key.json
import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../src/circom/address-space";
import { runZkp } from "../src/circom/main";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";

const storage = new L2Storage(true);

let n1 = new Field(100);
for (let i = 0; i<4; i++){
    n1 = n1.mul(new Field(1000000000000000));
}
n1 = n1.mul(new Field(142037759195404));

let n2 = new Field(100);
for (let i = 0; i<3; i++){
    n2 = n2.mul(new Field(1000000000000000));
}
n2 = n2.mul(new Field(43811187575295));

let n3 = new Field(100);
for (let i = 0; i<2; i++){
    n3 = n3.mul(new Field(1000000000000000));
}
n3 = n3.mul(new Field(503305615467955));

let n4 = new Field(100);
for (let i = 0; i<1; i++){
    n4 = n4.mul(new Field(1000000000000000));
}
n4 = n4.mul(new Field(342053499607914));

let n5 = new Field(100);
n5 = n5.mul(new Field(582256909697054));

let n = n1.add(n2).add(n3).add(n4).add(n5).add(new Field(72));

let m1 = new Field(100);
for (let i = 0; i<4; i++){
    m1 = m1.mul(new Field(1000000000000000));
}
m1 = m1.mul(new Field(182865560066249));

let m2 = new Field(100);
for (let i = 0; i<3; i++){
    m2 = m2.mul(new Field(1000000000000000));
}
m2 = m2.mul(new Field(881884590764397));

let m3 = new Field(100);
for (let i = 0; i<2; i++){
    m3 = m3.mul(new Field(1000000000000000));
}
m3 = m3.mul(new Field(541664255041537));

let m4 = new Field(100);
for (let i = 0; i<1; i++){
    m4 = m4.mul(new Field(1000000000000000));
}
m4 = m4.mul(new Field(298578320937673));

let m5 = new Field(100);
m5 = m5.mul(new Field(517994162143696));

let m = m1.add(m2).add(m3).add(m4).add(m5).add(new Field(37));

async function main() {
  await storage.startSnapshot("1");
  const _0 = await runZkp(
    [[new Field(CommandOp.SetKey),[new Field(0),new Field(0),new Field(0),
    new Field(0),new Field(0),new Field(0), m , n ,new Field(0),
    new Field(0)]]],
    storage,
    "0",
  );
  const _1 = await runZkp(
    [[new Field(CommandOp.DepositNFT),[new Field(1),new Field(2),new Field(3),
    new Field(1),new Field(1),new Field(0),new Field(0),new Field(1),
    new Field(0),new Field(0)]]],
    storage,
    "1",
  ); 

  const _2 = await runZkp(
    [[new Field(CommandOp.TransferNFT),[new Field(1),new Field(2),new Field(3),
    new Field(2),new Field(1),new Field(0),new Field(0),new Field(1),
    new Field(0),new Field(0)]]],
    storage,
    "2",
  );

  const _3 = await runZkp(
    [[new Field(CommandOp.BidNFT),[new Field(1),new Field(2),new Field(3),
    new Field(3),new Field(0),new Field(2),new Field(100),new Field(1),
    new Field(0),new Field(0)]]],
    storage,
    "3",
  );

  const _4 = await runZkp(
    [[new Field(CommandOp.FinalizeNFT),[new Field(1),new Field(2),new Field(3),
    new Field(4),new Field(0),new Field(0),new Field(0),new Field(1),
    new Field(0),new Field(0)]]],
    storage,
    "4",
  );

  const _5 = await runZkp(
    [[new Field(CommandOp.WithdrawNFT),[new Field(1),new Field(2),new Field(3),
    new Field(5),new Field(0),new Field(0),new Field(0),new Field(1),
    new Field(0),new Field(0)]]],
    storage,
    "5",
  );
  
  await storage.endSnapshot();
}
main();
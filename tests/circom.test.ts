import { Field} from "delphinus-curves/src/field";
import { L2Storage } from "../src/circom/address-space";
import { runZkp } from "../src/circom/main";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";
import { BN } from "bn.js";

const storage = new L2Storage(true);

let x = new BN("18286556006624988188459076439754166425504153729857832093767351799416214369637",10);
let y = new BN("14203775919540404381118757529550330561546795534205349960791458225690969705472",10);
let m = new Field(x);
let n = new Field(y);

async function main() {
  await storage.startSnapshot("1");
  const _0 = await runZkp(
    [[new Field(CommandOp.SetKey),[new Field(1),new Field(2),new Field(3),
    new Field(0),new Field(1),new Field(0), m , n ,new Field(0),
    new Field(0)]]],
    storage,
    "0",
  );

  const _1 = await runZkp(
    [[new Field(7),[new Field(1),new Field(2),new Field(3),
    new Field(1),new Field(1),new Field(0),new Field(0),new Field(1),
    new Field(1),new Field(0)]]],
    storage,
    "1",
  ); 

  const _2 = await runZkp(
    [[new Field(9),[new Field(1),new Field(2),new Field(3),
    new Field(2),new Field(2),new Field(0),new Field(0),new Field(1),
    new Field(1),new Field(0)]]],
    storage,
    "2",
  );

  // const _3 = await runZkp(
  //   [[new Field(CommandOp.BidNFT),[new Field(1),new Field(2),new Field(3),
  //   new Field(3),new Field(0),new Field(2),new Field(100),new Field(1),
  //   new Field(0),new Field(0)]]],
  //   storage,
  //   "3",
  // );

  // const _4 = await runZkp(
  //   [[new Field(CommandOp.FinalizeNFT),[new Field(1),new Field(2),new Field(3),
  //   new Field(4),new Field(0),new Field(0),new Field(0),new Field(1),
  //   new Field(0),new Field(0)]]],
  //   storage,
  //   "4",
  // );

  // const _5 = await runZkp(
  //   [[new Field(CommandOp.WithdrawNFT),[new Field(1),new Field(2),new Field(3),
  //   new Field(5),new Field(0),new Field(0),new Field(0),new Field(1),
  //   new Field(0),new Field(0)]]],
  //   storage,
  //   "5",
  // );
  
  await storage.endSnapshot();
}
main();
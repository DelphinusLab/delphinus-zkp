import { Field } from "delphinus-curves/src/field";
import { CommandOp, L2Storage } from "../src/zokrates/command";
import { runZkp } from "../src/zokrates/main";

const storage = new L2Storage();

async function main() {
  const _0 = await runZkp(
    new Field(CommandOp.AddPool),
    [new Field(0), new Field(4), new Field(5)],
    storage
  );

  const _1 = await runZkp(
    new Field(CommandOp.Deposit),
    [new Field(0), new Field(4), new Field(100)],
    storage
  );

  const _2 = await runZkp(
    new Field(CommandOp.Deposit),
    [new Field(0), new Field(5), new Field(100)],
    storage
  );

  const _3 = await runZkp(
    new Field(CommandOp.Supply),
    [
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(10),
      new Field(10),
      new Field(0),
    ],
    storage
  );

  const _4 = await runZkp(
    new Field(CommandOp.Swap),
    [
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(5),
      new Field(0),
      new Field(1),
    ],
    storage
  );

  const _5 = await runZkp(
    new Field(CommandOp.Retrieve),
    [
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(15),
      new Field(5),
      new Field(2),
      new Field(0),
    ],
    storage
  );

  const _6 = await runZkp(
    new Field(CommandOp.Withdraw),
    [
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(4),
      new Field(100),
      new Field(0xdeadbeaf),
      new Field(3),
    ],
    storage
  );

  const _7 = await runZkp(
    new Field(CommandOp.Withdraw),
    [
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(5),
      new Field(100),
      new Field(0xdeadbeaf),
      new Field(4),
    ],
    storage
  );
}

main();

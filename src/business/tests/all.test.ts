import { Field } from "delphinus-curves/src/field";
import { CommandOp, L2Storage } from "../command";
import { genZKPInput } from "../main";
import { exec } from "child_process";

const storage = new L2Storage();

const _0 = genZKPInput(
  new Field(CommandOp.AddPool),
  [
    new Field(0),
    new Field(4),
    new Field(5)
  ],
  storage
)

const _1 = genZKPInput(
  new Field(CommandOp.Deposit),
  [
    new Field(0),
    new Field(4),
    new Field(100)
  ],
  storage
);


const _2 = genZKPInput(
  new Field(CommandOp.Deposit),
  [
    new Field(0),
    new Field(5),
    new Field(100)
  ],
  storage
);

const _3 = genZKPInput(
  new Field(CommandOp.Supply),
  [
    new Field(0),
    new Field(0),
    new Field(0),
    new Field(0),
    new Field(0),
    new Field(10),
    new Field(10),
    new Field(0)
  ],
  storage
);

const _4 = genZKPInput(
  new Field(CommandOp.Swap),
  [
    new Field(0),
    new Field(0),
    new Field(0),
    new Field(0),
    new Field(0),
    new Field(5),
    new Field(0),
    new Field(1)
  ],
  storage
);

const _5 = genZKPInput(
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
    new Field(0)
  ],
  storage
);

const _6 = genZKPInput(
  new Field(CommandOp.Withdraw),
  [
    new Field(0),
    new Field(0),
    new Field(0),
    new Field(0),
    new Field(4),
    new Field(100),
    new Field(3),
    new Field(0)
  ],
  storage
);

const _7 = genZKPInput(
  new Field(CommandOp.Withdraw),
  [
    new Field(0),
    new Field(0),
    new Field(0),
    new Field(0),
    new Field(5),
    new Field(100),
    new Field(4)
  ],
  storage
);

async function testInput(data : Field[]) {
  console.log(`zokrates compute-witness -a ${data.map((f: Field) => f.v.toString(10)).join(" ")}`);

  return new Promise((resolve, reject) =>
    exec(
      `zokrates compute-witness -a ${data.map((f: Field) => f.v.toString(10)).join(" ")}`,
      (error, stdout, stderr) => {
        console.log('stdout\n', stdout);

        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        //console.log('error\n', error);
        //console.log('stderr\n', stderr);
        resolve(undefined);
      }
    )
  );
}

async function main() {
  await testInput(_0);
  await testInput(_1);
  await testInput(_2);
  await testInput(_3);
  await testInput(_4);
  await testInput(_5);
  await testInput(_6);
  await testInput(_7);
}

main()

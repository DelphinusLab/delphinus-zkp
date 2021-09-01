import { Field } from "delphinus-curves/src/field";
import { CommandOp, L2Storage } from "../command";
import { genZKPInput } from "../main";
import { exec } from "child_process";

const storage = new L2Storage();

const _0 = genZKPInput(
  new Field(CommandOp.AddPool),
  [
    new Field(0),
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

const data = genZKPInput(
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

console.log(`zokrates compute-witness -a ${data.map((f: Field) => f.v.toString(10)).join(" ")}`);

exec(
  `zokrates compute-witness -a ${data.map((f: Field) => f.v.toString(10)).join(" ")}`,
  {
    cwd: "/home/shindar/Projects/delphinus/delphinus-zkp"
  },
  (error, stdout, stderr) => {
    //console.log('error\n', error);
    console.log('stdout\n', stdout);
    //console.log('stderr\n', stderr);
  }
);

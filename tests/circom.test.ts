import BN from "bn.js";
import path from "path";
import { exec } from "child_process";
import { Field } from "delphinus-curves/src/field";
import { runZkp, writeInput } from "../src/circom/main";
import { L2Storage } from "../src/circom/address-space";
import { genZKPInput } from "../src/circom/generate-zkinput";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";

const storage = new L2Storage(true);

async function runCircom(name: string, error = false) {
  try {
    await new Promise((resolve, reject) =>
      exec(
        "bash tools/test.sh",
        {
          cwd: path.resolve(__dirname, "..", "..", "circom"),
        },
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
          }
          console.log(stdout);
          resolve(stdout);
        }
      )
    );
  } catch (e) {
    console.log(e);
    if (error) {
      console.log(`[SUCCESS] Run ${name} succeeded.`);
    } else {
      console.error(`[FAILURE] Run ${name} failed.`);
    }
    return;
  }

  if (!error) {
    console.log(`[SUCCESS] Run ${name} succeeded.`);
  } else {
    console.error(`[FAILURE] Run ${name} failed.`);
  }
}

async function testAddPool() {
  await storage.startSnapshot("1");

  const _0 = await runZkp(
    new Field(CommandOp.AddPool),
    [
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(4),
      new Field(5),
      new Field(0),
      new Field(0),
    ],
    storage
  );

  await storage.endSnapshot();

  await runCircom("testAddPool");
}

async function testAddPoolWrong() {
  const input = await genZKPInput(
    [
      [
        new Field(CommandOp.AddPool),
        [
          new Field(0),
          new Field(0),
          new Field(0),
          new Field(0),
          new Field(4),
          new Field(5),
          new Field(0),
          new Field(0),
        ],
      ],
    ],
    storage
  );

  input.commands[0][4] = new BN(input.commands[0][4]).addn(1).toString(10);
  await writeInput(input);
  await runCircom("testAddPoolWrong", true);
}

async function testShaWrong() {
  const input = await genZKPInput(
    [
      [
        new Field(CommandOp.AddPool),
        [
          new Field(0),
          new Field(0),
          new Field(0),
          new Field(0),
          new Field(4),
          new Field(5),
          new Field(0),
          new Field(0),
        ],
      ],
    ],
    storage
  );

  input.commandHash[0] = new BN(input.commandHash[0]).addn(1).toString(10);
  await writeInput(input);
  await runCircom("testShaWrong", true);
}

async function testKeyPathWrong() {
  const input = await genZKPInput(
    [
      [
        new Field(CommandOp.AddPool),
        [
          new Field(0),
          new Field(0),
          new Field(0),
          new Field(0),
          new Field(4),
          new Field(5),
          new Field(0),
          new Field(0),
        ],
      ],
    ],
    storage
  );

  input.keyPath[0][65] = new BN(input.keyPath[0][65]).addn(1).toString(10);
  await writeInput(input);
  await runCircom("testKeyPathWrong", true);
}

async function testDataPathWrong() {
  const input = await genZKPInput(
    [
      [
        new Field(CommandOp.AddPool),
        [
          new Field(0),
          new Field(0),
          new Field(0),
          new Field(0),
          new Field(4),
          new Field(5),
          new Field(0),
          new Field(0),
        ],
      ],
    ],
    storage
  );

  input.dataPath[0][0][65] = new BN(input.dataPath[0][0][65])
    .addn(1)
    .toString(10);
  await writeInput(input);
  await runCircom("testDataPathWrong", true);
}

async function main() {
  await storage.loadSnapshot("0");
  await storage.startSnapshot("1");

  await storage.loadSnapshot("0");
  await testShaWrong();

  await storage.loadSnapshot("0");
  await testKeyPathWrong();

  await storage.loadSnapshot("0");
  await testDataPathWrong();

  await storage.loadSnapshot("0");
  await testAddPoolWrong();

  await storage.loadSnapshot("0");
  await testAddPool();
}

main();

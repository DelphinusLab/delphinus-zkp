import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";

import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "./address-space";
import { genZKPInput, Input } from "./generate-zkinput";

let date = new Date();
let time = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`

const unitTestRoot = path.join(__dirname, "..", "..", "..", "circom", "unit_tests", `Unit_Test_at_${time}`)
const InputsFolderRoot = path.join(unitTestRoot, "Test_input")
if (!fs.existsSync(unitTestRoot)) {
  fs.mkdirSync(unitTestRoot);
  fs.mkdirSync(InputsFolderRoot);
}

const circomRoot = path.join(__dirname, "..", "..", "..", "circom", "unit_tests", "main.circom")
const circomTestingRoot = path.join(unitTestRoot, "main.circom")

fs.copyFile(circomRoot, circomTestingRoot, (err) => {
  if (err) throw err;
});

export async function writeInput(input: Input, rid: string) {
  await fs.writeJSON(path.join(InputsFolderRoot, `input.${rid}_${time}.json`), input);
}

export async function preTest() {
  await new Promise((resolve, reject) =>
    exec(
      "bash ../../tools/UnitTestInputGenerator/pre_test.sh",
      {
        cwd: unitTestRoot,
      },
      (error, stdout, stderr) => {
        if (error) {
          fs.appendFile(resultRoot, `Aborted: Circom compile \n`);
          console.log(`Compile Aborted:`)
          console.log(`${stderr}`)
        } else {
          resolve(stdout);
          console.log(`${stdout}`)
          fs.appendFile(resultRoot, `Passed: Circom compile \n`);
        }
      }
    )
  );
}

const resultRoot = path.join(unitTestRoot, "test_result.txt");

export async function CreateResultFile() {
  let resultFile = fs.createWriteStream(resultRoot, { flags: 'a' });
  await resultFile.write('Unit Test Results: \n')
}

export async function runZkp(
  commands: [Field, Field[]][],
  storage: L2Storage,
  rid: string,
  runProof = true
) {
  const input = await genZKPInput(commands, storage);

  if (!runProof) {
    return;
  }

  await writeInput(input, rid);

  const singleTestFilesRoot = path.join(unitTestRoot, `testedFiles`, `testFiles_input.${rid}_${time}`);

  if (!fs.existsSync(`${unitTestRoot}/testedFiles`)) {
    fs.mkdirSync(`${unitTestRoot}/testedFiles`);
  }

  if (!fs.existsSync(singleTestFilesRoot)) {
    fs.mkdirSync(singleTestFilesRoot);
  }

  const inputRoot = path.join(unitTestRoot, "Test_input", `input.${rid}_${time}.json`);
  const inputTestingRoot = path.join(unitTestRoot, "input.json");

  fs.copyFile(inputRoot, inputTestingRoot, (err) => {
    if (err) throw err;
  });

  fs.copyFile(inputRoot, `${singleTestFilesRoot}/input.${rid}_${time}.json`, (err) => {
    if (err) throw err;
  });

  try {
    await new Promise((resolve, reject) =>
      exec(
        "bash ../../tools/UnitTestInputGenerator/input_test.sh",
        {
          cwd: unitTestRoot,
        },
        (error, stdout, stderr) => {
          if (error) {
            fs.appendFile(resultRoot, `Aborted: input.${rid}_${time}.json \n ${stderr} \n`);
            reject(error);
          } else {
            resolve(stdout);
            console.log(`${stdout}`)
            fs.appendFile(resultRoot, `Passed: input.${rid}_${time}.json \n`)
            fs.rename(`${unitTestRoot}/proof.json`, `${singleTestFilesRoot}/proof.json`, (err) => {
              if (err) throw err;
            });
            fs.rename(`${unitTestRoot}/public.json`, `${singleTestFilesRoot}/public.json`, (err) => {
              if (err) throw err;
            });
            fs.rename(`${unitTestRoot}/witness.wtns`, `${singleTestFilesRoot}/witness.wtns`, (err) => {
              if (err) throw err;
            })
          };
        }
      )
    );
  } catch (e) {
    console.log(`Test Aborted: input.${rid}_${time}.json`)
    console.log(`${e}`)
  }
}
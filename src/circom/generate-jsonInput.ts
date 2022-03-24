import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";

import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "./address-space";
import { genZKPInput, Input } from "./generate-zkinput";

let date = new Date();
let time = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`

let dir = `../../unit_tests/Unit_Test_at_${time}`;
let inputsfolder = `../../unit_tests/Unit_Test_at_${time}/Test_input`
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
  fs.mkdirSync(inputsfolder);
}

const circomRoot = path.join(__dirname, "..", "..", "..", "circom","unit_tests","main.circom")
const circomTestingRoot = path.join(__dirname, "..", "..", "..", "circom","unit_tests",`Unit_Test_at_${time}`,"main.circom")

fs.copyFile(circomRoot, circomTestingRoot, (err) => {
  if (err) throw err;
});

const genInputRoot = path.join(__dirname, "..", "..", "..", "circom","tools","UnitTestInputGenerator",`${dir}`,"Test_input");

export async function writeInput(input: Input, rid: string) {
  await fs.writeJSON(path.join(genInputRoot, `input.${rid}_${time}.json`), input);
}

const ZKPPath = path.join(__dirname, "..", "..", "..", "circom","tools","UnitTestInputGenerator",`${dir}`);

export async function preTest(){
  await new Promise((resolve, reject) =>
    exec(
      "bash ../../tools/UnitTestInputGenerator/pre_test.sh",
      {
        cwd: ZKPPath,
      },
      (error, stdout, stderr) => {
        if (error) {
          fs.appendFile(resultRoot,`Aborted: Circom compile \n`);
          console.log(`Compile Aborted:`)
          console.log(`${stderr}`)
        } else {
          resolve(stdout);
          console.log(`${stdout}`)
          fs.appendFile(resultRoot,`Passed: Circom compile \n`);
        }
      }
    ) 
  );
}

const resultRoot = path.join(__dirname, "..", "..", "..", "circom","tools","UnitTestInputGenerator",`${dir}`, "test_result.txt");

export async function CreateResultFile() {
  let resultFile = fs.createWriteStream(resultRoot, {flags:'a'});
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

  const singleTestFilesRoot = path.join(__dirname, "..", "..", "..", "circom","tools","UnitTestInputGenerator",`${dir}`, `testedFiles`,`testFiles_input.${rid}_${time}`);

  if (!fs.existsSync(`${ZKPPath}/testedFiles`)){
    fs.mkdirSync(`${ZKPPath}/testedFiles`);
  }

  if (!fs.existsSync(singleTestFilesRoot)){
    fs.mkdirSync(singleTestFilesRoot);
  }

  const inputRoot = path.join(__dirname, "..", "..", "..", "circom","tools","UnitTestInputGenerator",`${dir}`,"Test_input",`input.${rid}_${time}.json`);
  const inputTestingRoot = path.join(__dirname, "..", "..", "..", "circom","tools","UnitTestInputGenerator",`${dir}`, "input.json");

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
          cwd: ZKPPath,
        },
        (error, stdout, stderr) => {
          if (error) {
            fs.appendFile(resultRoot,`Aborted: input.${rid}_${time}.json \n ${stderr} \n`);
            reject(error);
          } else {
          resolve(stdout);
          console.log(`${stdout}`)
          fs.appendFile(resultRoot,`Passed: input.${rid}_${time}.json \n`)
          fs.rename(`${dir}/proof.json`, `${singleTestFilesRoot}/proof.json`, (err) => {
            if (err) throw err;
          });
          fs.rename(`${dir}/public.json`, `${singleTestFilesRoot}/public.json`, (err) => {
            if (err) throw err;
          });
          fs.rename(`${dir}/witness.wtns`, `${singleTestFilesRoot}/witness.wtns`, (err) => {
            if (err) throw err;
          })};
        }
      )
    );
    } catch(e){
        console.log(`Test Aborted: input.${rid}_${time}.json`)
        console.log(`${e}`)
    }
}
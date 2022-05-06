import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";

import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "../../../src/circom/address-space";
import { genZKPInput, Input } from "../../../src/circom/generate-zkinput";
import { option } from "./main";

export async function writeInput(input: Input, rid: string, unitTestRoot:string, time: string) {
  await fs.writeJSON(path.join(`${unitTestRoot}/Test_input`, `input.${rid}_${time}.json`), input);
}

export async function preTest(circomRoot: string, unitTestRoot:string, time: string) {
  // if (!fs.existsSync(`${circomRoot}/unit_tests`)) {
  //   fs.mkdirSync(`${circomRoot}/unit_tests`);
  // }
  if (!fs.existsSync(`${unitTestRoot}`)) {
    fs.mkdirSync(`${unitTestRoot}`);
    fs.mkdirSync(`${unitTestRoot}/Test_input`);
  }
  fs.copyFile(`${circomRoot}/unit_tests/main.circom`, `${unitTestRoot}/main.circom`, (err) => {
    if (err) throw err;
  });
    await new Promise((resolve, reject) =>
     exec(
        `bash ../../tools/CircomTestTool/pre_test.sh`,
        {
          cwd: unitTestRoot,
        },
        (error, stdout, stderr) => {
          if (error) {
            fs.appendFile(`${unitTestRoot}/test_result.txt`, `Aborted: Circom compile\n`);
            console.log(`Aborted: Circom compile:`);
            console.log(error);
            console.log(stdout.toString());
          } else {
            resolve(stdout);
            console.log(`${stdout}`)
            fs.appendFile(`${unitTestRoot}/test_result.txt`, `Passed: Circom compile \n`);
          }
        },
      )
  );
}

export async function CreateResultFile(unitTestRoot:string, time:string) {
  let resultFile = fs.createWriteStream(`${unitTestRoot}/test_result.txt`, { flags: 'a' });
  await resultFile.write('Unit Test Results: \n')
}

export async function unitTestSingleOp(
  commands: [Field, Field[]][],
  storage: L2Storage,
  rid: string,
  unitTestRoot: string,
  time: string,
  runProof = true
) {
  const input = await genZKPInput(commands, storage);

  if (!runProof) {
    return;
  }

  await writeInput(input, rid, unitTestRoot, time);

  let singleTestFilesRoot = path.join(unitTestRoot, `testedFiles`, `testFiles_input.${rid}_${time}`);
  let inputRoot = path.join(unitTestRoot, "Test_input", `input.${rid}_${time}.json`);
  let inputTestingRoot = path.join(unitTestRoot, "input.json");

  if (!fs.existsSync(`${unitTestRoot}/testedFiles`)) {
    fs.mkdirSync(`${unitTestRoot}/testedFiles`);
  }

  if (!fs.existsSync(singleTestFilesRoot)) {
    fs.mkdirSync(singleTestFilesRoot);
  }

  fs.copyFile(inputRoot, inputTestingRoot, (err) => {
    if (err) throw err;
  });

  fs.copyFile(inputRoot, `${singleTestFilesRoot}/input.${rid}_${time}.json`, (err) => {
    if (err) throw err;
  });

  console.log(`Testing input.${rid}_${time}.json`);

  if(option == "--rapidsnark" || option == "-rs"){
    try {
      await new Promise((resolve, reject) =>
        exec(
          "echo 'Generate Witness'; bash ../../tools/run.sh; echo 'Generate Proof'; bash ../../tools/rapidsnarkProof.sh; echo 'Verify Proof'; bash ../../tools/verify.sh",
          {
            cwd: unitTestRoot,
          },
          (error, stdout, stderr) => {
            if (error) {
              fs.appendFile(`${unitTestRoot}/test_result.txt`, `Aborted: input.${rid}_${time}.json \n ${stderr} \n`);
              reject(error);
            } else {
              resolve(stdout);
              console.log(`${stdout}`)
              fs.appendFile(`${unitTestRoot}/test_result.txt`, `Passed: input.${rid}_${time}.json \n`)
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
  }else{
    try {
      await new Promise((resolve, reject) =>
        exec(
          "echo 'Generate Witness'; bash ../../tools/run.sh; echo 'Generate Proof'; bash ../../tools/proof.sh; echo 'Verify Proof'; bash ../../tools/verify.sh",
          {
            cwd: unitTestRoot,
          },
          (error, stdout, stderr) => {
            if (error) {
              fs.appendFile(`${unitTestRoot}/test_result.txt`, `Aborted: input.${rid}_${time}.json \n ${stderr} \n`);
              reject(error);
            } else {
              resolve(stdout);
              console.log(`${stdout}`)
              fs.appendFile(`${unitTestRoot}/test_result.txt`, `Passed: input.${rid}_${time}.json \n`)
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
}
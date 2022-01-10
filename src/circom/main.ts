import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";

import { Field } from "delphinus-curves/src/field";
import { L2Storage } from "./address-space";
import { genZKPInput, Input } from "./generate-zkinput";

const circomRoot = path.join(__dirname, "..", "..", "..", "circom");

export interface Groth16Proof {
  proof: {
    a: string[];
    b: string[][];
    c: string[];
  };
  inputs: string[];
}

export function zkpProofToArray(proof: Groth16Proof) {
  return proof.proof.a
    .concat(proof.proof.b[0])
    .concat(proof.proof.b[1])
    .concat(proof.proof.c)
    .concat(proof.inputs);
}

export async function writeInput(input: Input, rid: string) {
  await fs.writeJSON(path.join(circomRoot, "input.json"), input);
  await fs.writeJSON(path.join(circomRoot, `input.${rid}.json`), input);
}

export const ZKPPath = path.resolve(__dirname, "..", "..", "..", "circom");

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

  await new Promise((resolve, reject) =>
    exec(
      "bash tools/run.sh",
      {
        cwd: ZKPPath,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      }
    )
  );

  await new Promise((resolve, reject) =>
    exec(
      "bash tools/proof.sh",
      {
        cwd: ZKPPath,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      }
    )
  );

  const proof: any = await fs.readJson(path.resolve(ZKPPath, "proof.json"));

  const publicInput: any = await fs.readJSON(
    path.resolve(ZKPPath, "public.json")
  );

  return {
    proof: {
      a: proof.pi_a.slice(0, 2),
      // see https://github.com/iden3/snarkjs/issues/13
      b: proof.pi_b.slice(0, 2).map((x: string[]) => x.reverse()),
      c: proof.pi_c.slice(0, 2),
    },
    inputs: publicInput,
  } as Groth16Proof;
}

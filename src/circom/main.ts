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
}

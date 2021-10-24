import { Field } from "delphinus-curves/src/field";
import { MerkleTree, PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "./address-space";

export class Command {
  args: Field[];

  constructor(args: Field[]) {
    this.args = args.concat(Array(8).fill(new Field(0))).slice(0, 8);
  }

  get callerAccountIndex(): number {
    throw new Error("Not Implemented yet");
  };

  async run(storage: L2Storage): Promise<PathInfo[]> {
    throw new Error("Not Implemented yet");
  }
}

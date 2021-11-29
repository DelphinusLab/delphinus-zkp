import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/merkle-tree-large";
import { L2Storage } from "./address-space";0

export class Command {
  args: Field[];

  constructor(args: Field[]) {
    this.args = args;
  }

  get callerAccountIndex(): number {
    return 0;
  };

  async run(storage: L2Storage): Promise<PathInfo[]> {
    return [];
  }
}

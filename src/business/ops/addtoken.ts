import { Field } from "delphinus-curves/src/field";
import { PathInfo } from "delphinus-curves/src/markle-tree";
import { Command, L2Storage } from "../command";

export class AddTokenCommand extends Command {
  run(storage: L2Storage): PathInfo[] {
    return [];
  }
}

import { Field } from "delphinus-curves/src/field";
import { AddPoolCommand } from "./ops/addpool";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";
import { Command } from "./command";

export function createCommand(op: Field, args: Field[]) {
  if (op.v.eqn(CommandOp.AddPool)) {
    return new AddPoolCommand(args);
  } else {
    return new Command(args);
  }

  throw new Error('Not implemented yet');
}
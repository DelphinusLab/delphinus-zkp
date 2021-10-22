import { Field } from "delphinus-curves/src/field";
import { CommandOp } from "./command";
import { AddPoolCommand } from "./ops/addpool";

export function createCommand(op: Field, args: Field[]) {
  if (op.v.eqn(CommandOp.AddPool)) {
    return new AddPoolCommand(args);
  }

  throw new Error('Not implemented yet');
}
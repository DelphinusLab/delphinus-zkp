import { Field } from "delphinus-curves/src/field";
import { AddPoolCommand } from "./ops/addpool";

export enum CommandOp {
  Deposit = 0,
  Withdraw = 1,
  Swap = 2,
  Supply = 3,
  Retrieve = 4,
  AddPool = 5,
  AddToken = 7,
};

export function createCommand(op: Field, args: Field[]) {
  if (op.v.eqn(CommandOp.AddPool)) {
    return new AddPoolCommand(args);
  }

  throw new Error('Not implemented yet');
}
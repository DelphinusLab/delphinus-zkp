import { Field } from "delphinus-curves/src/field";
import { CommandOp } from "./command";
import { AddPoolCommand } from "./ops/addpool";
import { AddTokenCommand } from "./ops/addtoken";
import { DepositCommand } from "./ops/deposit";
import { RetrieveCommand } from "./ops/retrieve";
import { SupplyCommand } from "./ops/supply";
import { SwapCommand } from "./ops/swap";
import { WithdrawCommand } from "./ops/withdraw";

export function createCommand(op: Field, args: Field[]) {
  if (op.v.eqn(CommandOp.Deposit)) {
    return new DepositCommand(args);
  }

  if (op.v.eqn(CommandOp.Withdraw)) {
    return new WithdrawCommand(args);
  }

  if (op.v.eqn(CommandOp.Swap)) {
    return new SwapCommand(args);
  }

  if (op.v.eqn(CommandOp.Supply)) {
    return new SupplyCommand(args);
  }

  if (op.v.eqn(CommandOp.Retrieve)) {
    return new RetrieveCommand(args);
  }

  if (op.v.eqn(CommandOp.AddPool)) {
    return new AddPoolCommand(args);
  }

  if (op.v.eqn(CommandOp.AddToken)) {
    return new AddTokenCommand(args);
  }

  throw new Error('Not implemented yet');
}
import { Field } from "delphinus-curves/src/field";
import { AddPoolCommand } from "./ops/addpool";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";
import { SetKeyCommand } from "./ops/setkey";
import { DepositCommand } from "./ops/deposit";
import { WithdrawCommand } from "./ops/withdraw";
import { SwapCommand } from "./ops/swap";
import { RetrieveCommand } from "./ops/retrieve";
import { SupplyCommand } from "./ops/supply";
import { DepositNFTCommand } from "./ops/deposit_nft";
import { TransferNFTCommand } from "./ops/transfer_nft";
import { BidNFTCommand } from "./ops/bid_nft";

export function createCommand(op: Field, args: Field[]) {
  if (op.v.eqn(CommandOp.AddPool)) {
    return new AddPoolCommand(args);
  }

  if (op.v.eqn(CommandOp.SetKey)) {
    return new SetKeyCommand(args);
  }

  if (op.v.eqn(CommandOp.Deposit)) {
    return new DepositCommand(args);
  }

  if (op.v.eqn(CommandOp.Withdraw)) {
    return new WithdrawCommand(args);
  }

  if (op.v.eqn(CommandOp.Swap)) {
    return new SwapCommand(args);
  }

  if (op.v.eqn(CommandOp.Retrieve)) {
    return new RetrieveCommand(args);
  }

  if (op.v.eqn(CommandOp.Supply)) {
    return new SupplyCommand(args);
  }

  if (op.v.eqn(7)) {
    return new DepositNFTCommand(args);
  }

  if (op.v.eqn(9)) {
    return new TransferNFTCommand(args);
  }

  if (op.v.eqn(10)) {
    return new BidNFTCommand(args);
  }

  throw new Error("Not implemented yet");
}
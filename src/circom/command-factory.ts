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
import { FinalizeNFTCommand } from "./ops/finalize_nft";
import { WithdrawNFTCommand } from "./ops/withdraw_nft"

export enum NftCommandOp {
  DepositNFT = 7,
  WithdrawNFT = 8,
  TransferNFT = 9,
  BidNFT = 10,
  FinalizeNFT = 11,
}

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

  if (op.v.eqn(NftCommandOp.DepositNFT)) {
    return new DepositNFTCommand(args);
  }

  if (op.v.eqn(NftCommandOp.WithdrawNFT)) {
    return new WithdrawNFTCommand(args);
  }

  if (op.v.eqn(NftCommandOp.TransferNFT)) {
    return new TransferNFTCommand(args);
  }

  if (op.v.eqn(NftCommandOp.BidNFT)) {
    return new BidNFTCommand(args);
  }

  if (op.v.eqn(NftCommandOp.FinalizeNFT)) {
    return new FinalizeNFTCommand(args);
  }

  throw new Error("Not implemented yet");
}
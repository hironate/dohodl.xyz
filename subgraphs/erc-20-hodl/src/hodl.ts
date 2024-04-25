import {
  Deposited as DepositedEvent,
  Withdrawn as WithdrawnEvent,
} from "../generated/Hodl/Hodl";
import { Deposited } from "../generated/schema";

export function handleDeposited(event: DepositedEvent): void {
  let entity = new Deposited(event.params.id.toString());
  entity.unlockTime = event.params.unlockTime;
  entity.lockedTime = event.params.lockedTime;
  entity.owner = event.params.owner;
  entity.tokenAddress = event.params.tokenAddress;
  entity.amount = event.params.amount;
  entity.withdrawn = event.params.withdrawn;
  entity.transationHash = event.transaction.hash.toHex();
  entity.save();
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  let entity = Deposited.load(event.params.id.toString());
  entity!.withdrawn = true;
  entity!.save();
}

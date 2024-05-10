import { BigInt } from "@graphprotocol/graph-ts";
import {
  Deposited as DepositedEvent,
  Withdrawn as WithdrawnEvent,
} from "../generated/Hodl/Hodl";
import { Activity, Deposited, Stat, Withdrawn } from "../generated/schema";

export function handleDeposited(event: DepositedEvent): void {
  let entity = new Deposited(event.params.id.toString());
  entity.unlockTime = event.params.unlockTime;
  entity.lockedTime = event.params.lockedTime;
  entity.owner = event.params.owner;
  entity.amount = event.params.amount;
  entity.withdrawn = event.params.withdrawn;
  entity.transationHash = event.transaction.hash.toHex();
  entity.save();

  let activityEntity = new Activity(event.params.id.toString() + "_Deposit");
  activityEntity.activityType = "Deposit";
  activityEntity.depositId = event.params.id.toString();
  activityEntity.timestamp = event.block.timestamp;
  activityEntity.user = event.params.owner;
  activityEntity.amount = event.params.amount;
  activityEntity.transctionHash = event.transaction.hash.toHex();
  activityEntity.save();

  let stateEntity = Stat.load("hodl-locked-values");
  if (!stateEntity) {
    stateEntity = new Stat("hodl-locked-values");
    stateEntity.totalLocked = BigInt.fromI32(0);
    stateEntity.activeLocked = BigInt.fromI32(0);
    stateEntity.totalWithdrawn = BigInt.fromI32(0);
  }
  stateEntity.totalLocked = stateEntity.totalLocked.plus(event.params.amount);

  stateEntity.activeLocked = stateEntity.totalLocked.minus(
    stateEntity.totalWithdrawn
  );

  stateEntity.save();
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  let depositEntity = Deposited.load(event.params.id.toString());
  if (!depositEntity) return;
  depositEntity.withdrawn = true;
  depositEntity.save();

  let withdrawnEntity = new Withdrawn(event.params.id.toString());
  withdrawnEntity.unlockTime = depositEntity.unlockTime;
  withdrawnEntity.lockedTime = depositEntity.lockedTime;
  withdrawnEntity.unlockedAt = event.block.timestamp;
  withdrawnEntity.owner = depositEntity.owner;
  withdrawnEntity.amount = event.params.amount;
  withdrawnEntity.transationHash = event.transaction.hash.toHex();
  withdrawnEntity.save();

  let activityEntity = new Activity(event.params.id.toString() + "_Withdraw");
  activityEntity;
  activityEntity.activityType = "Withdraw";
  activityEntity.depositId = event.params.id.toString();
  activityEntity.timestamp = event.block.timestamp;
  activityEntity.user = depositEntity.owner;
  activityEntity.amount = event.params.amount;
  activityEntity.transctionHash = event.transaction.hash.toHex();
  activityEntity.save();

  let stateEntity = Stat.load("hodl-locked-values");
  if (!stateEntity) {
    stateEntity = new Stat("hodl-locked-values");
    stateEntity.totalLocked = BigInt.fromI32(0);
    stateEntity.activeLocked = BigInt.fromI32(0);
    stateEntity.totalWithdrawn = BigInt.fromI32(0);
  }
  stateEntity.totalWithdrawn = stateEntity.totalWithdrawn.plus(
    event.params.amount
  );

  stateEntity.activeLocked = stateEntity.totalLocked.minus(
    stateEntity.totalWithdrawn
  );

  stateEntity.save();
}

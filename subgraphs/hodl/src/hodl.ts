import { BigInt } from "@graphprotocol/graph-ts";
import {
  Deposited as DepositedEvent,
  Withdrawn as WithdrawnEvent,
} from "../generated/Hodl/Hodl";
import {
  Activity,
  Deposit,
  Stat,
  UserStat,
  Withdrawal,
} from "../generated/schema";

export function handleDeposited(event: DepositedEvent): void {
  let entity = new Deposit(event.params.id.toString() + "_Native");
  entity.unlockTime = event.params.unlockTime;
  entity.lockedTime = event.params.lockedTime;
  entity.owner = event.params.owner;
  entity.amount = event.params.amount;
  entity.withdrawn = event.params.withdrawn;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  let activityEntity = new Activity(
    event.params.id.toString() + "_Native_Deposit"
  );
  activityEntity.activityType = "Deposit";
  activityEntity.depositId = event.params.id.toString();
  activityEntity.timestamp = event.block.timestamp;
  activityEntity.user = event.params.owner;
  activityEntity.amount = event.params.amount;
  activityEntity.transactionHash = event.transaction.hash;
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

  let userStatEntity = UserStat.load(event.params.owner.toHexString());
  if (!userStatEntity) {
    userStatEntity = new UserStat(event.params.owner.toHexString());
    userStatEntity.totalLocked = BigInt.fromI32(0);
    userStatEntity.activeLocked = BigInt.fromI32(0);
    userStatEntity.totalWithdrawn = BigInt.fromI32(0);
  }
  userStatEntity.totalLocked = userStatEntity.totalLocked.plus(
    event.params.amount
  );
  userStatEntity.activeLocked = userStatEntity.totalLocked.minus(
    userStatEntity.totalWithdrawn
  );
  userStatEntity.save();
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  let depositEntity = Deposit.load(event.params.id.toString() + "_Native");
  if (!depositEntity) return;
  depositEntity.withdrawn = true;
  depositEntity.save();

  let withdrawnEntity = new Withdrawal(event.params.id.toString() + "_Native");
  withdrawnEntity.unlockTime = depositEntity.unlockTime;
  withdrawnEntity.lockedTime = depositEntity.lockedTime;
  withdrawnEntity.unlockedAt = event.block.timestamp;
  withdrawnEntity.owner = depositEntity.owner;
  withdrawnEntity.amount = event.params.amount;
  withdrawnEntity.transactionHash = event.transaction.hash;
  withdrawnEntity.save();

  let activityEntity = new Activity(
    event.params.id.toString() + "_Native_Withdraw"
  );
  activityEntity.activityType = "Withdraw";
  activityEntity.depositId = event.params.id.toString();
  activityEntity.timestamp = event.block.timestamp;
  activityEntity.user = depositEntity.owner;
  activityEntity.amount = event.params.amount;
  activityEntity.transactionHash = event.transaction.hash;
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

  let userStatEntity = UserStat.load(depositEntity.owner.toHexString());
  if (!userStatEntity) {
    userStatEntity = new UserStat(depositEntity.owner.toHexString());
    userStatEntity.totalLocked = BigInt.fromI32(0);
    userStatEntity.activeLocked = BigInt.fromI32(0);
    userStatEntity.totalWithdrawn = BigInt.fromI32(0);
  }
  userStatEntity.totalWithdrawn = userStatEntity.totalWithdrawn.plus(
    event.params.amount
  );

  userStatEntity.activeLocked = userStatEntity.totalLocked.minus(
    userStatEntity.totalWithdrawn
  );
  userStatEntity.save();
}

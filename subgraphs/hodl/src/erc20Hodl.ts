import {
  Deposited as DepositedEvent,
  Withdrawn as WithdrawnEvent,
} from "../generated/ERC20Hodl/ERC20Hodl";
import {
  ERC20Activity,
  ERC20Deposit,
  ERC20Withdrawal,
} from "../generated/schema";

export function handleDeposited(event: DepositedEvent): void {
  let entity = new ERC20Deposit(event.params.id.toString());
  entity.unlockTime = event.params.unlockTime;
  entity.lockedTime = event.params.lockedTime;
  entity.owner = event.params.owner;
  entity.tokenAddress = event.params.tokenAddress;
  entity.amount = event.params.amount;
  entity.withdrawn = event.params.withdrawn;
  entity.transationHash = event.transaction.hash.toHex();
  entity.save();

  let activityEntity = new ERC20Activity(
    event.params.id.toString() + "_Deposit"
  );
  activityEntity.activityType = "Deposit";
  activityEntity.depositId = event.params.id.toString();
  activityEntity.timestamp = event.block.timestamp;
  activityEntity.user = event.params.owner;
  activityEntity.tokenAddress = event.params.tokenAddress;
  activityEntity.amount = event.params.amount;
  activityEntity.transctionHash = event.transaction.hash.toHex();
  activityEntity.save();
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  let depositEntity = ERC20Deposit.load(event.params.id.toString());
  if (!depositEntity) return;
  depositEntity.withdrawn = true;
  depositEntity.save();

  let withdrawnEntity = new ERC20Withdrawal(event.params.id.toString());
  withdrawnEntity.unlockTime = depositEntity.unlockTime;
  withdrawnEntity.lockedTime = depositEntity.lockedTime;
  withdrawnEntity.unlockedAt = event.block.timestamp;
  withdrawnEntity.owner = depositEntity.owner;
  withdrawnEntity.tokenAddress = event.params.tokenAddress;
  withdrawnEntity.amount = event.params.amount;
  withdrawnEntity.transationHash = event.transaction.hash.toHex();
  withdrawnEntity.save();

  let activityEntity = new ERC20Activity(
    event.params.id.toString() + "_Withdraw"
  );
  activityEntity;
  activityEntity.activityType = "Withdraw";
  activityEntity.depositId = event.params.id.toString();
  activityEntity.timestamp = event.block.timestamp;
  activityEntity.user = depositEntity.owner;
  activityEntity.tokenAddress = event.params.tokenAddress;
  activityEntity.amount = event.params.amount;
  activityEntity.transctionHash = event.transaction.hash.toHex();
  activityEntity.save();
}

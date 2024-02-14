export function maxAmountToLock(accountbalance) {
  let gasLimit = 0.01;
  if (accountbalance > 0) {
    const maxAmount = Number(accountbalance) - gasLimit;
    return maxAmount.toString();
  }
}

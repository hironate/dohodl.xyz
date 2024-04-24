export function maxAmountToLock(accountbalance) {
  let gasLimit = 0.0001;
  if (accountbalance > 0) {
    const maxAmount = Number(accountbalance) - gasLimit;
    return maxAmount ? maxAmount.toString() : "0";
  }
}

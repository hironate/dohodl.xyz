import { ERC20HodlContractAddress, contractAddress } from "../constant";

export const getContractAddress = (chainId, isERC20Hodl) => {
  if (isERC20Hodl) {
    return ERC20HodlContractAddress;
  }
  return contractAddress;
};

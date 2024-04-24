import {
  ERC20HodlContractAddress,
  contractAddress,
  erc20HodlBaseSepolia,
} from "../constant";

export const getContractAddress = (chainId, isERC20Hodl) => {
  if (isERC20Hodl) {
    switch (chainId) {
      case 1:
      case 5:
      case 137:
      case 80001:
      case 56:
      case 97:
        return ERC20HodlContractAddress;
      case 8453:
      case 84532:
        return erc20HodlBaseSepolia;
    }
  }
  return contractAddress;
};

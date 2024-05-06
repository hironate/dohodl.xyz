import {
  ERC20HodlContractAddress,
  contractAddress,
  ERC20HodlMainnetContractAddress,
  ERC20HodlPolygonContractAddress,
} from "../constant";

export const getContractAddress = (chainId, isERC20Hodl) => {
  if (isERC20Hodl) {
    switch (chainId) {
      case 11155111:
      case 80002:
      case 97:
      case 84532:
        return ERC20HodlContractAddress;

      case 137:
        return ERC20HodlPolygonContractAddress;
      case 1:
      case 56:
      case 8453:
        return ERC20HodlMainnetContractAddress;
      default:
        return ERC20HodlContractAddress;
    }
  }
  return contractAddress;
};

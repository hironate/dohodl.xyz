import Hodl from "../artifacts/contracts/abis/Hodl.json";
import ERC20 from "../artifacts/contracts/abis/ERC20.json";
import ERC20Hodl from "../artifacts/contracts/abis/ERC20Hodl.json";
export const getContractAbi = (contractName) => {
  let abi;
  switch (contractName) {
    case "ERC20":
      abi = ERC20;
      break;
    case "ERC20Hodl":
      abi = ERC20Hodl;
      break;
    case "Hodl":
      abi = Hodl.abi;
      break;
    default:
      abi = Hodl.abi;
      break;
  }
  return abi;
};

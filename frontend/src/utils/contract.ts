import Hodl from "@/../artifacts/contracts/abis/Hodl.json";
import ERC20 from "@/../artifacts/contracts/abis/ERC20.json";
import ERC20Hodl from "@/../artifacts/contracts/abis/ERC20Hodl.json";
import { Contract } from "./contractService";
import { Config } from "wagmi";
import { ethers } from "ethers";

export const contractAddress = "0x3E7824b8ec5F60B8C18494617a3AAa518DAd2F25";

export const ERC20HodlContractAddress =
  "0xb355534407E51ea8f0FB525DB6Fc4Af6404dB551";

export const ERC20HodlMainnetContractAddress =
  "0x4b75f6eC17A019fC61B8f442243B665fFC8bC233";

export const ERC20HodlPolygonContractAddress =
  "0xc57022656b095093441117974C015166569E953d";

export const getContractAddress = (isERC20Hodl: boolean, chainId?: number) => {
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

export const getContractAbi = (
  contractName: "ERC20" | "ERC20Hodl" | "Hodl",
) => {
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

export const getHodlContract = ({
  config,
  isErc20 = false,
  chainId,
}: {
  config: Config;
  isErc20?: boolean;
  chainId?: number;
}) => {
  const contractAddress = getContractAddress(isErc20, chainId);
  const contractAbi = getContractAbi(isErc20 ? "ERC20Hodl" : "Hodl");
  const contract = Contract(contractAddress, contractAbi, config);

  async function deposit({
    duration,
    lockAmount,
    tokenAddress,
  }: {
    duration: number;
    lockAmount: string;
    tokenAddress?: string;
  }) {
    if (isErc20)
      await contract.write("deposit", [
        duration,
        Number(lockAmount),
        tokenAddress,
      ]);
    else
      await contract.write(
        "deposit",
        [duration],
        ethers.parseEther(lockAmount),
      );
  }

  const withdraw = async (depositId: number) =>
    contract.write("withdraw", [depositId]);

  return { deposit, withdraw };
};

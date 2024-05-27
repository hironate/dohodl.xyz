import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  Config,
} from "@wagmi/core";
import { getContractAbi } from "./contract";

export const Contract = (
  address: `0x${string}` | string,
  abi: any,
  config: Config,
  chainId?: number,
) => {
  return {
    read: async (functionName: string, args: any = []) => {
      const data = await readContract(config, {
        address,
        abi,
        functionName,
        args,
        ...(chainId ? { chainId } : {}),
      });

      return data;
    },
    write: async (
      functionName: string,
      args: any[] = [],
      value = BigInt(0),
    ) => {
      try {
        const hash = await writeContract(config, {
          address,
          abi,
          functionName,
          args,
          value,
          ...(chainId ? { chainId } : {}),
        });

        const result = await waitForTransactionReceipt(config, { hash });
        return result;
      } catch (error) {
        throw error;
      }
    },
    writeWithoutWaiting: async (
      functionName: string,
      args: any = [],
      value = BigInt(0),
    ) => {
      const tx = await writeContract(config, {
        address,
        abi,
        functionName,
        args,
        value,
      });

      return tx;
    },
  };
};

export const TokenContract = (
  address: `0x${string}` | string,
  config: Config,
  chainId?: number,
) => {
  const contract = Contract(address, getContractAbi("ERC20"), config, chainId);

  return {
    getDecimal: async () => contract.read("decimals"),
    getSymbol: async () => contract.read("symbol"),
    ...contract,
  };
};

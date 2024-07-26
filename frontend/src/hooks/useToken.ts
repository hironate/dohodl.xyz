import { getCoinsDataById } from "@/helper/coingecko-helper";
import { getContractAddress } from "@/utils/contract";
import { TokenContract } from "@/utils/contractService";
import { formatAmount, parseAmount } from "@/utils/ethers";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BigNumberish } from "ethers";
import { ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { useAccount, useConfig } from "wagmi";

const useToken = (tokenAddress: string, spendingContractAddress: string) => {
  const { address, isConnected } = useAccount();

  const config = useConfig();

  const isEnabled = useMemo(
    () => !!address && !!tokenAddress && isConnected,
    [address, tokenAddress, isConnected],
  );

  const contract = useMemo(
    () => TokenContract(tokenAddress, config),
    [tokenAddress],
  );

  const { data: userBalance, refetch: refetBalance } = useQuery({
    queryKey: ["balanceOf", address, contract, tokenAddress],
    queryFn: async (): Promise<any> => {
      const data = await contract.read("balanceOf", [address]);
      return data;
    },
    enabled: isEnabled && !!tokenAddress,
  });

  const { data: tokenPredefinedData } = useQuery({
    queryKey: ["decimals", tokenAddress],
    queryFn: async (): Promise<{
      decimals: any;
      symbol: any;
      totalSupply: any;
      name: any;
    }> => {
      const decimals = await contract.read("decimals");
      const symbol = await contract.read("symbol");
      const totalSupply = await contract.read("totalSupply");
      const name = await contract.read("name");

      return { decimals, symbol, totalSupply, name };
    },
    enabled: !!tokenAddress,
  });

  const { data: tokenAllowance, refetch: refetchAllowance } = useQuery({
    queryKey: ["allowance", address, spendingContractAddress],
    queryFn: async (): Promise<BigInt> => {
      let data: any = await contract.read("allowance", [
        address,
        spendingContractAddress,
      ]);
      const allowance = BigInt(data || 0);
      return allowance;
    },
    enabled: isEnabled && !!spendingContractAddress,
  });

  const { mutateAsync: approve, isSuccess: isApproved } = useMutation({
    mutationFn: async ({ value }: { value: BigInt }) =>
      await contract.write("approve", [spendingContractAddress, value]),
  });

  const { symbol, decimals, totalSupply, name } = useMemo(
    () =>
      tokenPredefinedData
        ? tokenPredefinedData
        : { decimals: "", symbol: "", totalSupply: "", name: "" },
    [tokenPredefinedData],
  );

  const balance = useMemo(
    () => ({
      balance: userBalance || "0",
      formatedBalance:
        userBalance && decimals
          ? ethers.formatUnits(userBalance, Number(decimals))
          : "0",
      decimals: decimals || "0",
    }),
    [userBalance, decimals],
  );

  const checkOrSetAllowance = useCallback(
    async (tokenAmount: BigNumberish, isItParsed = false) => {
      const parsedAmount = isItParsed
        ? tokenAmount
        : parseAmount({
            amount: tokenAmount,
            decimals,
          });
      console.log({ parsedAmount, tokenAllowance });

      if (
        typeof tokenAllowance !== "undefined" &&
        parsedAmount > tokenAllowance
      ) {
        console.log("init allowance proccess");

        await approve({
          value: BigInt(parsedAmount),
        });

        let newAllowance: any = (await refetchAllowance()).data?.toString();

        if (newAllowance) newAllowance = BigInt(newAllowance);

        if (!newAllowance || newAllowance < parsedAmount) {
          throw new Error("Insufficient Allowance");
        }
        return "valid";
      }
    },
    [tokenAllowance, approve, decimals, refetchAllowance],
  );

  return useMemo(
    () => ({
      balance,
      allowance: tokenAllowance,
      approve,
      refetchAllowance,
      checkOrSetAllowance,
      name,
      symbol,
      decimals,
      totalSupply,
      refetBalance,
    }),
    [
      tokenAllowance,
      approve,
      balance,
      checkOrSetAllowance,
      refetchAllowance,
      name,
      symbol,
      decimals,
      totalSupply,
      refetBalance,
    ],
  );
};

export default useToken;

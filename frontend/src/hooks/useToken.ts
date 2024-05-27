import { getCoinsDataById } from "@/helper/coingecko-helper";
import { ERC20HodlContractAddress, getContractAbi } from "@/utils/contract";
import { TokenContract } from "@/utils/contractService";
import { formatAmount, parseAmount } from "@/utils/ethers";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { useAccount, useConfig } from "wagmi";

const useToken = (tokenAddress: string) => {
  const { address, isConnected } = useAccount();
  const config = useConfig();

  const isEnabled = useMemo(
    () => !!address && !!tokenAddress && isConnected,
    [address, tokenAddress, isConnected],
  );

  const contract = TokenContract(tokenAddress, config);

  const { data: userBalance, refetch: refetBalance } = useQuery({
    queryKey: ["balanceOf", address],
    queryFn: async (): Promise<any> => {
      const data = await contract.read("balanceOf", [address]);
      return data;
    },
    enabled: isEnabled,
  });

  const { data: tokenPredefinedData } = useQuery({
    queryKey: ["decimals", tokenAddress],
    queryFn: async (): Promise<{ decimals: any; symbol: any }> => {
      const decimals = await contract.read("decimals");
      const symbol = await contract.read("symbol");

      return { decimals, symbol };
    },
    enabled: !!tokenAddress,
  });

  const { data: tokenAllowance, refetch: refetchAllowance } = useQuery({
    queryKey: ["allowance", address],
    queryFn: async (): Promise<BigInt> => {
      let data = await contract.read("allowance", [
        address,
        ERC20HodlContractAddress,
      ]);
      const allowance = BigInt(data || 0);
      return allowance;
    },
    enabled: isEnabled,
  });

  const { mutateAsync: approve, isSuccess: isApproved } = useMutation({
    mutationFn: async ({ value }: { value: BigInt }) =>
      await contract.write("approve", [ERC20HodlContractAddress, value]),
  });

  const { symbol, decimals } = useMemo(
    () =>
      tokenPredefinedData ? tokenPredefinedData : { decimals: "", symbol: "" },
    [tokenPredefinedData],
  );

  const balance = useMemo(
    () => ({
      balance: userBalance || "0",
      formatedBalance:
        Number(userBalance) && decimals
          ? ethers.formatUnits(userBalance, Number(decimals))
          : "0",
      decimals: decimals || "0",
    }),
    [userBalance, decimals],
  );

  const allowance = useMemo(
    () =>
      tokenAllowance && decimals
        ? formatAmount({
            amount: tokenAllowance,
            decimals,
          })
        : "0",
    [tokenAllowance, decimals],
  );

  const checkOrSetAllowance = useCallback(
    async (tokenAmount: string | number) => {
      if (Number(tokenAmount) > Number(allowance)) {
        await approve({
          value: parseAmount({
            amount: tokenAmount,
            decimals,
          }),
        });

        let newAllowance = (await refetchAllowance()).data?.toString();

        if (newAllowance)
          newAllowance = formatAmount({
            amount: newAllowance,
            decimals,
          });

        if (!newAllowance || newAllowance < tokenAmount) {
          throw new Error("Insufficient Allowance");
        }
        return "valid";
      }
    },
    [allowance, approve, decimals, refetchAllowance],
  );

  return useMemo(
    () => ({
      balance,
      allowance,
      approve,
      refetchAllowance,
      checkOrSetAllowance,
      symbol,
      refetBalance,
    }),
    [
      allowance,
      approve,
      balance,
      checkOrSetAllowance,
      refetchAllowance,
      symbol,
      refetBalance,
    ],
  );
};

export default useToken;

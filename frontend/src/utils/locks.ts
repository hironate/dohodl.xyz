import { DataByChainName, LockDataStats } from "@/types/locks";
import {
  CHAINID_TO_SUBGRAPHURL,
  getLocksValuesFromSubgraphData,
} from "./subgraph";
import { DocumentNode } from "graphql";
import { queryData } from "./apollo-query";
import { NetworkMode } from "@/types/web3";
import {
  CHAIN_ID_TO_CHAIN_NAME,
  CHAIN_NAME_TO_CHAIN_NATTIVE_SYMBOL,
  MAINNET_CHAINS,
  TESTNET_CHAINS,
  getChainIdByChainName,
} from "./constant";
import { BigNumberish, formatEther } from "ethers";
import { TokenContract } from "./contractService";
import { Config } from "wagmi";
import { getContractAbi } from "./contract";
import { formatAmount } from "./ethers";

export enum STATUS_FILTERS {
  ALL = "All",
  LOCKED = "Locked",
  UNLOCKED = "Unlocked",
  WITHDRAWN = "Withdrawn",
}

export const formatLocksDataToStats = (locksData: any): LockDataStats => {
  const { lockedAmount, totalLocks, withdrawn } =
    getLocksValuesFromSubgraphData(locksData);
  return {
    activeLockedAmount: lockedAmount,
    totalLockedAmount: totalLocks,
    totalWithdrawnAmount: withdrawn,
  };
};
export const formatTokenDepositsToStats = async (
  deposits: any,
  config: Config,
  chainId?: number,
) => {
  const tokensDataByTokenAddress = deposits.reduce(
    (acc: { [tokenAddress: string]: any[] }, lockData: any) => {
      const address = lockData.tokenAddress;
      if (!acc[address]) {
        acc[address] = [];
      }
      acc[address].push(lockData);
      return acc;
    },
    {},
  );

  let totalTokenValuesLocked: {
    [tokenAddress: string]: {
      symbol: string;
      amount: number;
      decimals: number;
    };
  } = {};

  const fetchTokenData = async (tokenAddress: string) => {
    const contract = TokenContract(tokenAddress, config, chainId);
    const [symbol, decimals] = await Promise.all([
      contract.getSymbol(),
      contract.getDecimal(),
    ]);

    const totalLockedValue = getLocksValuesFromSubgraphData(
      tokensDataByTokenAddress[tokenAddress],
      Number(decimals),
    ).lockedAmount;

    totalTokenValuesLocked[tokenAddress] = {
      symbol: symbol?.toString() || "unknown",
      amount: Number(totalLockedValue),
      decimals: Number(decimals),
    };
  };

  await Promise.all(Object.keys(tokensDataByTokenAddress).map(fetchTokenData));

  const sortedValuesByLockAmount = Object.values(totalTokenValuesLocked)
    .map((data) => data)
    .sort((a, b) => b.amount - a.amount);

  return {
    totalTokenValuesLocked: sortedValuesByLockAmount,
    totalTokensLocked: Object.keys(tokensDataByTokenAddress).length,
  };
};

export const formatTokenDepositsToStatsByChainName = async (
  tokensData: DataByChainName,
  config: Config,
  isTestnet: boolean,
) => {
  const totalTokenValuesLocked: {
    symbol: string;
    amount: number;
    decimals: number;
  }[] = [];
  let totalTokensLocked: number = 0;

  const promises = Object.keys(tokensData).map(async (chainName) => {
    const formattedTokenDeposits = await formatTokenDepositsToStats(
      tokensData[chainName],
      config,
      getChainIdByChainName(chainName, isTestnet),
    );
    totalTokenValuesLocked.push(
      ...formattedTokenDeposits.totalTokenValuesLocked,
    );
    totalTokensLocked += formattedTokenDeposits.totalTokensLocked;
  });

  await Promise.all(promises);

  return { totalTokenValuesLocked, totalTokensLocked };
};

export const getDataFromAllChains = async ({
  networkMode = "mainnet",
  query,
  variables,
  filterBy = "deposits",
  setDataAs = "lockedData",
}: {
  networkMode?: NetworkMode;
  query: DocumentNode;
  variables?: Record<string, any>;
  filterBy?: string;
  setDataAs?: string;
}) => {
  const chainWithTotalValueLocked: {
    chainName: string;
    [setDataAs: string]: any;
  }[] = [];

  const CHAINS = networkMode === "mainnet" ? MAINNET_CHAINS : TESTNET_CHAINS;
  const requests = CHAINS.map(async (chain) => {
    const chainId = chain.id;
    const { data } = await queryData({
      uri: CHAINID_TO_SUBGRAPHURL[chainId],
      query,
      ...(variables ? { variables } : {}),
    });

    chainWithTotalValueLocked.push({
      chainName: CHAIN_ID_TO_CHAIN_NAME[chain.id],
      [setDataAs]: data?.[filterBy],
    });
  });

  await Promise.all(requests);

  return chainWithTotalValueLocked;
};

export const formatLockAmountToEth = (amount: BigNumberish) => {
  if (amount) {
    const formatedAmount = Number(formatEther(amount));
    return formatedAmount >= 0.01
      ? formatedAmount.toFixed(2)
      : formatedAmount.toString();
  } else return "0";
};

export const formatActivityData = async (
  activities: any,
  config: Config,
  chainName: string = "Ethereum",
  isTestnet: boolean = false,
) => {
  const activityWithCurrencySymbol: any[] = [];
  const promises = activities.map(async (activity: any) => {
    let currencySymbol: any = CHAIN_NAME_TO_CHAIN_NATTIVE_SYMBOL[chainName];
    let currencyDecimal: any = 18;
    if (activity.tokenAddress) {
      const contract = TokenContract(
        activity.tokenAddress,
        config,
        getChainIdByChainName(chainName, isTestnet) || 1,
      );
      currencyDecimal = await contract.getDecimal();
      currencySymbol = await contract.getSymbol();
    }
    const amount = formatAmount({
      amount: Number(activity.amount),
      decimals: currencyDecimal,
    });

    activityWithCurrencySymbol.push({
      ...activity,
      currencySymbol,
      currencyDecimal,
      amount,
    });
  });
  await Promise.all(promises);
  return activityWithCurrencySymbol;
};

export const formatActivityByChainName = async (
  activitiesByChainName: DataByChainName,
  config: Config,
  isTestnet?: boolean,
) => {
  const formatedActivityByChainName: DataByChainName = {};

  const promises = Object.keys(activitiesByChainName).map(async (chainName) => {
    const fomratedActivity = await formatActivityData(
      activitiesByChainName[chainName],
      config,
      chainName,
      isTestnet,
    );

    formatedActivityByChainName[chainName] = fomratedActivity;
  });

  await Promise.all(promises);
  return formatedActivityByChainName;
};

export const combineDataFromChainName = (data: DataByChainName) => {
  const combinedData: any[] = [];

  Object.keys(data).map((chainName) => {
    if (Array.isArray(data[chainName]))
      data[chainName].map((activityData: any) => {
        combinedData.push({ ...activityData, chainName });
      });
    else {
      combinedData.push(data[chainName]);
    }
  });

  return combinedData;
};

export function formatNumber(num: number) {
  if (num === 0 || num % 1 !== 0) {
    if (num < 0.01) return "<0.01";
    return num.toFixed(2);
  } else {
    return num.toFixed(0);
  }
}

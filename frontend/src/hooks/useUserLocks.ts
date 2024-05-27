import { getDataFromAllChains } from "@/utils/locks";
import {
  CHAINID_TO_SUBGRAPHURL,
  QUERY_KEYS,
  userStatsQuery,
  upComingUnlockQuery,
  UserActivityQuery,
  despositsQueryForUser,
  usersTokenQuery,
} from "@/utils/subgraph";
import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import useNetworkMode from "./useNetworkMode";
import { ApolloClient, InMemoryCache, useQuery } from "@apollo/client";
import { DataByChainName } from "@/types/locks";
import {
  CHAIN_ID_TO_CHAIN_NAME,
  getChainIdByChainName,
} from "@/utils/constant";

const useUserLocks = () => {
  const [networkMode] = useNetworkMode();
  const { address, chainId } = useAccount();
  const account = useMemo(() => address?.toLowerCase(), [address]);

  const url = useMemo(
    () =>
      chainId
        ? CHAINID_TO_SUBGRAPHURL[chainId]
        : CHAINID_TO_SUBGRAPHURL[networkMode === "mainnet" ? 1 : 11155111],
    [chainId, networkMode],
  );

  const client = useMemo(
    () =>
      new ApolloClient({
        uri: url,
        cache: new InMemoryCache(),
      }),
    [url],
  );

  const {
    loading: fetchingUpcomingUnlock,
    data: upcomingUnlockData,
    error: upcomingUnlockFetchingError,
  } = useQuery(upComingUnlockQuery, {
    client,
    variables: { account, currentTime: Math.floor(Date.now() / 1000) },
    skip: !account,
  });

  const {
    data: userStatsData,
    loading: fetchingUserStats,
    error: userStatsFetchingError,
  } = useQuery(userStatsQuery, {
    client,
    variables: {
      account,
    },
    skip: !account,
  });

  const { data: userAllStats, isLoading: fetchingUserStatsOfAllChain } =
    useTanstackQuery({
      queryFn: async () => {
        const chainWithTotalValueLocked = await getDataFromAllChains({
          query: userStatsQuery,
          variables: { account },
          networkMode,
          filterBy: "userStats",
        });

        return chainWithTotalValueLocked;
      },
      queryKey: [QUERY_KEYS.USER_STATS_OF_ALL_CHAINS, account],
      enabled: !!account,
    });

  const { data: activityDataByChainName } = useTanstackQuery({
    queryKey: ["all-chain-users-activities", account],
    queryFn: async () => {
      const activityDataByChainName: DataByChainName = {};
      const data = await getDataFromAllChains({
        query: UserActivityQuery,
        filterBy: "activities",
        networkMode,
        setDataAs: "activityData",
        variables: { account },
      });
      data.map((dataByChainName) => {
        activityDataByChainName[dataByChainName.chainName] =
          dataByChainName.activityData;
      });
      return activityDataByChainName;
    },
    enabled: !!account,
  });

  const { data: userTokensData } = useQuery(usersTokenQuery, {
    client,
    variables: { account },
    skip: !account,
  });

  const {
    data: userAllLocks,
    isLoading: fetchingUserAllLocks,
    refetch: refetchAllLocks,
  } = useTanstackQuery({
    queryFn: async () => {
      const chainWithTotalValueLocked: DataByChainName = {};
      const data = await getDataFromAllChains({
        query: despositsQueryForUser,
        variables: { account },
        networkMode,
        filterBy: "deposits",
      });

      data.map((dataByChainName) => {
        chainWithTotalValueLocked[dataByChainName.chainName] =
          dataByChainName?.lockedData;
      });

      return chainWithTotalValueLocked;
    },
    queryKey: [QUERY_KEYS.ALL_CHAIN_USER_LOCKS, account],
    enabled: !!address,
  });

  const { data: userActivityData, loading: fetchingUserActivity } = useQuery(
    UserActivityQuery,
    {
      client,
      variables: {
        account: account?.toLowerCase(),
      },
      skip: !account,
    },
  );

  const upComingUnlockTime = useMemo(
    () => upcomingUnlockData?.deposits?.[0]?.unlockTime,
    [upcomingUnlockData],
  );

  const userStats = useMemo(
    () => ({
      totalLocked: userStatsData?.userStats?.[0]?.totalLocked || "0",
      totalWithdrawn: userStatsData?.userStats?.[0]?.totalWithdrawn || "0",
      activeLocked: userStatsData?.userStats?.[0]?.activeLocked || "0",
    }),
    [userStatsData],
  );

  const userActivity = useMemo(() => {
    return userActivityData
      ? { ["Ethereum"]: userActivityData.activities }
      : undefined;
  }, [userActivityData]);

  const tokens = useMemo(() => userTokensData?.deposits, [userTokensData]);

  const statsDataByChainName = useMemo(
    () =>
      userAllStats?.map(({ chainName, lockedData }) => ({
        chainName,
        lockedData: {
          activeLockedAmount: lockedData[0]?.activeLocked || "0",
          totalLockedAmount: lockedData[0]?.totalLocked || "0",
          totalWithdrawnAmount: lockedData[0]?.totalWithdrawn || "0",
        },
      })),
    [userAllStats],
  );

  return useMemo(
    () => ({
      userStats,
      upcomingUnlockData,
      upComingUnlockTime,
      userActivity,
      userAllLocks,
      statsDataByChainName,
      activityDataByChainName,
      tokens,
      refetchAllLocks,
    }),
    [
      userStats,
      upComingUnlockTime,
      upcomingUnlockData,
      userActivity,
      userAllLocks,
      statsDataByChainName,
      activityDataByChainName,
      tokens,
      refetchAllLocks,
    ],
  );
};

export default useUserLocks;

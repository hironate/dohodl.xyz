import {
  CHAINID_TO_SUBGRAPHURL,
  allLocksQuery,
  depositsQuery,
  despositsQueryForUser,
  statsQuery,
  ActivityQuery,
  QUERY_KEYS,
  TokenQuery,
} from "@/utils/subgraph";
import { useMemo } from "react";
import { useQuery, ApolloClient, InMemoryCache } from "@apollo/client";
import { useAccount } from "wagmi";
import {
  useMutation,
  useQuery as useTanstackQuery,
} from "@tanstack/react-query";
import useNetworkMode from "./useNetworkMode";
import { formatLockAmountToEth, getDataFromAllChains } from "@/utils/locks";
import { DataByChainName } from "@/types/locks";
import {
  CHAIN_ID_TO_CHAIN_NAME,
  getChainIdByChainName,
} from "@/utils/constant";

const useLocks = () => {
  const { chainId } = useAccount();
  const [networkMode] = useNetworkMode();

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
    loading: fetchingStats,
    data: statsData,
    error: fetchingStatsError,
    refetch: refetchStats,
  } = useQuery(statsQuery, {
    client,
  });

  const {
    isLoading: fetchingStatsOfAllChain,
    data: statsDataByChainName,
    error: fetchingStatsOfAllChainError,
    refetch: refetchStatsDataByChainName,
  } = useTanstackQuery({
    queryKey: [QUERY_KEYS.STATS_OF_ALL_CHAIN, networkMode],
    queryFn: async () => {
      const data = await getDataFromAllChains({
        query: statsQuery,
        filterBy: "stats",
        networkMode,
      });
      const statsDataByChainName = data.map(({ chainName, lockedData }) => ({
        chainName,
        lockedData: {
          activeLockedAmount: lockedData[0]?.activeLocked || "0",
          totalLockedAmount: lockedData[0]?.totalLocked || "0",
          totalWithdrawnAmount: lockedData[0]?.totalWithdrawn || "0",
        },
      }));
      return statsDataByChainName;
    },
  });

  const {
    loading: fetchingAllLocks,
    data: allLocksData,
    error: allLocksFetchingError,
  } = useQuery(allLocksQuery, {
    client,
  });

  const { data: activityData } = useQuery(ActivityQuery, { client });

  const { data: activityDataByChainName } = useTanstackQuery({
    queryKey: ["all-chain-activities"],
    queryFn: async () => {
      const activityDataByChainName: DataByChainName = {};
      const data = await getDataFromAllChains({
        query: ActivityQuery,
        filterBy: "activities",
        networkMode,
        setDataAs: "activityData",
      });
      data.map((dataByChainName) => {
        activityDataByChainName[dataByChainName.chainName] =
          dataByChainName.activityData;
      });
      return activityDataByChainName;
    },
  });

  const isFetching = useMemo(() => fetchingAllLocks, [fetchingAllLocks]);

  const stats = useMemo(() => {
    return {
      activeLockedAmount: formatLockAmountToEth(
        statsData?.stats[0]?.activeLocked,
      ),
      totalLockedAmount: formatLockAmountToEth(
        statsData?.stats[0]?.totalLocked,
      ),
      totalWithdrawnAmount: formatLockAmountToEth(
        statsData?.stats[0]?.totalWithdrawn,
      ),
    };
  }, [statsData]);

  const { data: tokensData } = useQuery(TokenQuery, {
    client,
  });

  const activities = activityData?.activities;
  const tokens = useMemo(() => tokensData?.deposits, [tokensData]);

  return useMemo(
    () => ({
      isFetching,
      stats,
      statsDataByChainName,
      activities,
      activityDataByChainName,
      tokens,
      refetchStats,
      refetchStatsDataByChainName,
    }),
    [
      activities,
      activityDataByChainName,
      isFetching,
      stats,
      statsDataByChainName,
      tokens,
      refetchStats,
      refetchStatsDataByChainName,
    ],
  );
};

export default useLocks;

import {
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  mainnet,
  polygon,
  polygonAmoy,
  sepolia,
} from "wagmi/chains";
import { formatAmount, weiToEthFormate } from "./ethers";
import { gql } from "@apollo/client";

export const CHAINID_TO_ERC20_SUBGRAPHURL = {
  [mainnet.id + "ERC20"]:
    process.env.NEXT_PUBLIC_MAINNET_ERC20_HODL_SUBGRAPH_URL,
  [polygon.id + "ERC20"]:
    process.env.NEXT_PUBLIC_POLYGON_ERC20_HODL_SUBGRAPH_URL,
  [base.id + "ERC20"]: process.env.NEXT_PUBLIC_BASE_ERC20_HODL_SUBGRAPH_URL,
  [bsc.id + "ERC20"]: process.env.NEXT_PUBLIC_BINANCE_ERC20_HODL_SUBGRAPH_URL,

  // -----------------TESTNET - CHAINS ---------------
  [sepolia.id + "ERC20"]:
    process.env.NEXT_PUBLIC_SEPOLIA_ERC20_HODL_SUBGRAPH_URL,
  [polygonAmoy.id + "ERC20"]:
    process.env.NEXT_PUBLIC_POLYGON_ERC20_HODL_SUBGRAPH_URL,
  [baseSepolia.id + "ERC20"]:
    process.env.NEXT_PUBLIC_BASE_TESTNET_ERC20_HODL_SUBGRAPH_URL,
  [bscTestnet.id + "ERC20"]:
    process.env.NEXT_PUBLIC_BINANCE_TESTNET_ERC20_HODL_SUBGRAPH_URL,
};

type ChainIdSubgraphURLType = {
  [key: number]: string | undefined;
};

export const CHAINID_TO_SUBGRAPHURL: ChainIdSubgraphURLType = {
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_SUBGRAPH_URL,
  [polygon.id]: process.env.NEXT_PUBLIC_POLYGON_SUBGRAPH_URL,
  [base.id]: process.env.NEXT_PUBLIC_BASE_SUBGRAPH_URL,
  [bsc.id]: process.env.NEXT_PUBLIC_BINANCE_SUBGRAPH_URL,

  // -----------------TESTNET - CHAINS ---------------
  [sepolia.id]: process.env.NEXT_PUBLIC_SEPOLIA_SUBGRAPH_URL,
  [polygonAmoy.id]: process.env.NEXT_PUBLIC_AMOY_SUBGRAPH_URL,
  [baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_TESTNET_SUBGRAPH_URL,
  [bscTestnet.id]: process.env.NEXT_PUBLIC_BINANCE_TESTNET_SUBGRAPH_URL,
};

export const upComingUnlockQuery = gql`
  query UpComingUnlockQuery($account: String!, $currentTime: BigInt!) {
    deposits(
      where: { owner: $account, unlockTime_gt: $currentTime }
      orderBy: unlockTime
      orderDirection: asc
      first: 1
    ) {
      lockedTime
      unlockTime
    }
  }
`;

export const statsQuery = gql`
  query {
    stats {
      totalLocked
      activeLocked
      totalWithdrawn
    }
  }
`;

export const userStatsQuery = gql`
  query userStatsQuery($account: String!) {
    userStats(where: { id: $account }) {
      id
      totalLocked
      activeLocked
      totalWithdrawn
    }
  }
`;

export const allLocksQuery = gql`
  query {
    deposits(orderBy: id, orderDirection: desc) {
      id
      unlockTime
      lockedTime
      owner
      amount
      withdrawn
      transactionHash
    }
  }
`;

export const depositsQuery = gql`
  query {
    deposits {
      id
      unlockTime
      lockedTime
      owner
      amount
      withdrawn
      transactionHash
      tokenAddress
    }
  }
`;

export const despositsQueryForUser = gql`
  query despositsQueryForUser($account: String!) {
    deposits(where: { owner: $account }) {
      id
      unlockTime
      lockedTime
      owner
      amount
      withdrawn
      transactionHash
      tokenAddress
    }
  }
`;

export const ActivityQuery = gql`
  query {
    activities(orderBy: timestamp, orderDirection: desc) {
      id
      activityType
      depositId
      timestamp
      user
      amount
      transactionHash
      tokenAddress
    }
  }
`;

export const UserActivityQuery = gql`
  query UserActivityQuery($account: String!) {
    activities(
      where: { user: $account }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      activityType
      depositId
      timestamp
      user
      amount
      transactionHash
      tokenAddress
    }
  }
`;

export const userLocksQuery = gql`
  query userLocksQuery($account: String!) {
    deposits(
      where: { owner: $account }
      orderBy: lockedTime
      orderDirection: desc
    ) {
      id
      unlockTime
      lockedTime
      owner
      amount
      withdrawn
      transactionHash
    }
  }
`;

export const usersTokenQuery = gql`
  query usersTokenQuery($account: String!) {
    deposits(where: { owner: $account, tokenAddress_not: null }) {
      id
      unlockTime
      lockedTime
      amount
      withdrawn
      transactionHash
      tokenAddress
    }
  }
`;

export const TokenQuery = gql`
  query {
    deposits(where: { tokenAddress_not: null }) {
      id
      unlockTime
      lockedTime
      amount
      withdrawn
      transactionHash
      tokenAddress
    }
  }
`;

export const QUERY_KEYS = {
  UPCOMING_UNLOCK_QUERY_KEY: "user's-upcoming-unlock",
  ALL_LOCKS: "all-locks",
  ALL_CHAIN_LOCKS: "all-chain-locks",
  ALL_CHAIN_USER_LOCKS: "all-chain-user-locks",
  ALL_CHAIN_TOKENS: "all-chain-tokens",
  STATS: "stats",
  STATS_OF_ALL_CHAIN: "all-chain-stats",
  USER_STATS: "user-stats",
  USER_STATS_OF_ALL_CHAINS: "user-stats-of-all-chains",
  ACTIVITY: "activity",
  USER_ACTIVITY: "user-activity",
};

export const getLocksValuesFromSubgraphData = (
  data: any,
  decimals?: number,
) => {
  let totalLocks: number | string = 0;
  let lockedAmount: number | string = 0;
  let withdrawn: number | string = 0;

  if (data)
    for (let i = 0; i < data.length; i++) {
      let amount = parseInt(data[i].amount);

      totalLocks += amount;
      if (data[i].withdrawn) {
        withdrawn += amount;
      } else {
        lockedAmount += amount;
      }
    }

  totalLocks = decimals
    ? formatAmount({ amount: totalLocks, decimals })
    : weiToEthFormate(totalLocks);
  lockedAmount = decimals
    ? formatAmount({ amount: lockedAmount, decimals })
    : weiToEthFormate(lockedAmount);
  withdrawn = decimals
    ? formatAmount({ amount: withdrawn, decimals })
    : weiToEthFormate(withdrawn);

  return { totalLocks, lockedAmount, withdrawn };
};

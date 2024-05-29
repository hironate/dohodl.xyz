"use client";
import React, { useEffect, useMemo, useState } from "react";
import USDLineChart from "../Charts/USDLineChart";
import useLocks from "@/hooks/useLocks";
import { useAccount, useConfig } from "wagmi";
import CardDataStats from "../CardDataStats";
import {
  AccountBalanceWallet,
  LockClockTwoTone,
  LockPerson,
  MonetizationOnTwoTone,
} from "@mui/icons-material";
import {
  CHAIN_ID_TO_CHAIN_NAME,
  CHAIN_NAME_TO_CHAIN_NATTIVE_SYMBOL,
  CHAIN_NAME_TO_COINGECKO_COIN_ID,
} from "@/utils/constant";
import HodleLocksPieChart from "../Charts/HodlLocksPieChart";
import { getNattiveAmountValueInUsd } from "@/utils/coingecko";
import ActivityTable from "../activity/HodleActivity";
import useCoinPrices from "@/hooks/useCoinPrices";
import { formatEther } from "ethers";
import UsersTokenChart from "../Charts/UserTokenChart";
import { Stats } from "@/types/locks";
import { getDefaultChainID } from "@/utils/chains";
import { formatTokenDepositsToStatsByChainName } from "@/utils/locks";
import useNetworkMode from "@/hooks/useNetworkMode";

const Analytics = () => {
  const [chainsLockedValueInUsd, setChainsLockedValueInUsd] = useState<
    { chainName: string; valueLockedInUsd: string | number }[]
  >([]);
  const {
    statsDataByChainName,
    activityDataByChainName,
    tokens,
    tokensDepositsByChainName,
  } = useLocks();
  const { chartDataWithChainName } = useCoinPrices();
  const { chain } = useAccount();
  const config = useConfig();
  const [networkMode] = useNetworkMode();
  const [tokensData, setTokensData] = useState<any>({});

  const { activeLockedAmount, totalLockedAmount, totalWithdrawnAmount } =
    useMemo(() => {
      const statsOfAllChain: Stats = {
        activeLockedAmount: 0,
        totalLockedAmount: 0,
        totalWithdrawnAmount: 0,
      };
      if (chartDataWithChainName && statsDataByChainName) {
        statsDataByChainName?.map(({ chainName, lockedData }) => {
          chainName = chainName === "Base" ? "Ethereum" : chainName;

          statsOfAllChain.activeLockedAmount +=
            Number(formatEther(lockedData.activeLockedAmount)) *
            Number(chartDataWithChainName[chainName].current_price);
          statsOfAllChain.totalLockedAmount +=
            Number(formatEther(lockedData.totalLockedAmount)) *
            Number(chartDataWithChainName[chainName].current_price);
          statsOfAllChain.totalWithdrawnAmount +=
            Number(formatEther(lockedData.totalWithdrawnAmount)) *
            Number(chartDataWithChainName[chainName].current_price);
        });
      }
      return statsOfAllChain;
    }, [chartDataWithChainName, statsDataByChainName]);

  useEffect(() => {
    async function formatTokensDeposits() {
      if (!tokensDepositsByChainName) return;
      const formatedDataByChainName =
        await formatTokenDepositsToStatsByChainName(
          tokensDepositsByChainName,
          config,
          networkMode === "testnet",
        );

      setTokensData(formatedDataByChainName);
    }
    formatTokensDeposits();
  }, [config, networkMode, tokensDepositsByChainName]);

  useEffect(() => {
    async function getData() {
      if (statsDataByChainName) {
        const LocksData = statsDataByChainName.map(
          ({ chainName, lockedData }) => ({
            chainName,
            lockedAmount: lockedData.activeLockedAmount,
          }),
        );
        if (chartDataWithChainName) {
          const prices: { [chainName: string]: number } = {};
          Object.keys(chartDataWithChainName).map((chainName) => {
            prices[CHAIN_NAME_TO_COINGECKO_COIN_ID[chainName]] = Number(
              chartDataWithChainName[chainName].current_price,
            );
          });

          const chainsLockedValue = await getNattiveAmountValueInUsd({
            LocksData,
            prices,
          });
          if (chainsLockedValue) {
            setChainsLockedValueInUsd(chainsLockedValue);
          }
        }
      }
    }
    getData();
  }, [
    chain,
    statsDataByChainName,
    activityDataByChainName,
    chartDataWithChainName,
  ]);

  return (
    <div>
      <div className="grid w-full grid-cols-12 gap-4  md:gap-6 2xl:gap-7.5">
        <HodleLocksPieChart LocksData={chainsLockedValueInUsd} />
        <USDLineChart statsDataByChainName={statsDataByChainName} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:mt-7.5 2xl:gap-7.5">
        <CardDataStats
          title="Total Lock value"
          amount={totalLockedAmount.toFixed(2)}
          currency={"USD"}
        >
          <LockPerson className="text-primary dark:text-white" />
        </CardDataStats>
        <CardDataStats
          title="Current Locked Value"
          amount={activeLockedAmount.toFixed(2)}
          currency={"USD"}
        >
          <LockClockTwoTone className="text-primary dark:text-white" />
        </CardDataStats>
        <CardDataStats
          title="Withdrawn"
          amount={totalWithdrawnAmount.toFixed(2)}
          currency={"USD"}
        >
          <AccountBalanceWallet className="text-primary dark:text-white" />
        </CardDataStats>
        <div className="relative flex gap-2 rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          {!!tokens?.length && (
            <div className="absolute flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2  dark:bg-primary ">
              <MonetizationOnTwoTone className="text-primary dark:text-white" />
            </div>
          )}
          <div className="flex w-full flex-col justify-center md:-mt-4 md:ml-3 2xl:m-0">
            <UsersTokenChart tokensData={tokensData} isForCard isFormated />
            {!!tokens?.length && (
              <div className="w-full text-center text-base font-semibold text-primary-neon ">
                Locked tokens
              </div>
            )}
          </div>
        </div>
      </div>

      <ActivityTable activities={activityDataByChainName} />
    </div>
  );
};

export default Analytics;

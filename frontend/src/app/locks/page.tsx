"use client";
import React, { useEffect, useState } from "react";
import { AccountBalanceWalletTwoTone, LockPerson } from "@mui/icons-material";
import useLocks from "@/hooks/useLocks";
import { useAccount } from "wagmi";
import { CHAIN_NAME_TO_COINGECKO_COIN_ID } from "@/utils/constant";
import { getNattiveAmountValueInUsd } from "@/utils/coingecko";
import useCoinPrices from "@/hooks/useCoinPrices";
import useUserLocks from "@/hooks/useUserLocks";
import CreateHodl from "@/components/Hodl/CreateHodl";
import CardDataStats from "@/components/CardDataStats";
import dynamic from "next/dynamic";
const HodleLocksPieChart = dynamic(
  () => import("@/components/Charts/HodlLocksPieChart"),
  {
    ssr: false,
  },
);
import MyLocks from "@/components/Locks/MyLocks";

const LocksPage = () => {
  const { chain, address } = useAccount();
  const {
    statsDataByChainName,
    stats,
    refetchStats,
    refetchStatsDataByChainName,
  } = useLocks();
  const { userAllLocks, refetchAllLocks } = useUserLocks();

  const [chainsLockedValueInUsd, setChainsLockedValueInUsd] = useState<
    { chainName: string; valueLockedInUsd: number | string }[]
  >([]);
  const { chartDataWithChainName, price } = useCoinPrices();

  useEffect(() => {
    async function getLocksData() {
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
    getLocksData();
  }, [address, statsDataByChainName, chartDataWithChainName]);

  const onHodl = async () => {
    await refetchAllLocks();
    await refetchStats();
    await refetchStatsDataByChainName();
  };

  return (
    <div>
      <div className="flex flex-col gap-10  md:px-15 xl:p-0">
        <div className="flex flex-col gap-10 xl:flex-row xl:justify-between xl:p-0">
          <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:w-1/2">
            <div className="flex flex-col gap-9">
              <CreateHodl onHodl={onHodl} />
            </div>
          </div>
          <div className="flex h-full w-full flex-col items-start justify-between gap-5 xl:w-1/2">
            <div className="flex h-full w-full flex-grow gap-5 xsm:!h-1/3">
              <CardDataStats
                title="Current Locked value"
                amount={stats.activeLockedAmount || "0"}
                currency={chain?.nativeCurrency.symbol}
                usdPricePerUnit={price}
                className="h-full w-1/2"
              >
                <LockPerson className="text-primary dark:text-white" />
              </CardDataStats>
              <CardDataStats
                className="h-full w-1/2"
                title="Total Withdrawn"
                amount={stats.totalWithdrawnAmount || "0"}
                currency={chain?.nativeCurrency.symbol}
              >
                <AccountBalanceWalletTwoTone className="text-primary dark:text-white" />
              </CardDataStats>
            </div>
            <HodleLocksPieChart
              LocksData={chainsLockedValueInUsd}
              className="h-2/3"
            />
          </div>
        </div>

        {userAllLocks && (
          <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 ">
            <MyLocks deposits={userAllLocks} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LocksPage;

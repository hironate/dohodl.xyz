"use client";
import React, { useMemo } from "react";
import ChartOne from "../Charts/USDLineChart";
import CardDataStats from "../CardDataStats";
import {
  LockClockTwoTone,
  LockPerson,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { useAccount } from "wagmi";
import FirstUnlockCountDown from "../FirstUnlockCountDown";
import ActivityTable from "../activity/HodleActivity";
import { formatLockAmountToEth } from "@/utils/locks";
import useCoinPrices from "@/hooks/useCoinPrices";
import useUserLocks from "@/hooks/useUserLocks";
import UsersTokenChart from "../Charts/UserTokenChart";

const Dashboard: React.FC = () => {
  const { chain, isConnected, status } = useAccount();
  const {
    upComingUnlockTime,
    userStats,
    activityDataByChainName,
    statsDataByChainName,
    tokens,
  } = useUserLocks();
  const { price } = useCoinPrices();
  const upcomingUnlockDate = useMemo(
    () =>
      upComingUnlockTime ? new Date(Number(upComingUnlockTime) * 1000) : null,
    [upComingUnlockTime],
  );

  const lockData = useMemo(() => {
    return {
      lockedAmount: formatLockAmountToEth(userStats.activeLocked),
      withdrawnAmount: formatLockAmountToEth(userStats.totalWithdrawn),
      totalLockedAmount: formatLockAmountToEth(userStats.totalLocked),
    };
  }, [userStats]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Total Lock value"
          amount={lockData.totalLockedAmount}
          currency={chain?.nativeCurrency.symbol}
        >
          <LockPerson className="text-primary dark:text-white" />
        </CardDataStats>
        <CardDataStats
          title="Current Locked Value"
          amount={lockData.lockedAmount}
          currency={chain?.nativeCurrency.symbol}
          usdPricePerUnit={price}
        >
          <LockClockTwoTone className="text-primary dark:text-white" />
        </CardDataStats>
        <CardDataStats
          title="Withdrawn"
          amount={lockData.withdrawnAmount}
          currency={chain?.nativeCurrency.symbol}
        >
          <AccountBalanceWallet className="text-primary dark:text-white" />
        </CardDataStats>
        <div className="rounded-sm border border-stroke bg-white px-4  py-2 shadow-default dark:border-strokedark dark:bg-boxdark md:px-1">
          {upcomingUnlockDate ? (
            <FirstUnlockCountDown upcomingUnlockDateTime={upcomingUnlockDate} />
          ) : (
            <div className="flex h-full w-full items-center justify-center  backdrop-blur-3xl">
              <span className="text-center  text-primary-neon ">
                No token Locked
              </span>
            </div>
          )}
        </div>
      </div>

      {status === "connecting" || isConnected ? (
        <>
          <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
            <ChartOne
              showUsersdata
              statsDataByChainName={statsDataByChainName}
            />
            {tokens && <UsersTokenChart tokensData={tokens} />}
          </div>

          <ActivityTable activities={activityDataByChainName} isUserActivity />
        </>
      ) : (
        <div className="mt-4 flex h-full w-full items-center justify-center md:mt-6 2xl:mt-7.5 ">
          Connect Wallet
        </div>
      )}
    </>
  );
};

export default Dashboard;

import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { DURATIONS, DURATION_TO_DAY } from "@/utils/constant";
import { areaChartOptions } from "@/utils/chart-options";
import { useAccount } from "wagmi";
import { combineChartDataWithNattiveLockAmount } from "@/utils/coingecko";
import useLocks from "@/hooks/useLocks";
import { formatEther } from "ethers";
import useCoinPrices from "@/hooks/useCoinPrices";
import useUserLocks from "@/hooks/useUserLocks";

interface ChartOneState {
  series: {
    name: string;
    data: { x: Date; y: string }[];
  }[];
}

const USDLineChart = ({
  showUsersdata = false,
  statsDataByChainName,
  className = "",
}: {
  showUsersdata?: boolean;
  statsDataByChainName?: {
    chainName: string;
    lockedData: {
      activeLockedAmount: any;
      totalLockedAmount: any;
      totalWithdrawnAmount: any;
    };
  }[];
  className?: string;
}) => {
  const [state, setState] = useState<ChartOneState>({ series: [] });
  const [duration, setDuration] = useState<"Month" | "Year">(DURATIONS[1]);
  const { address } = useAccount();
  const {
    coin_prices_with_cordinates: coinPricesWithCordinates,
    setDurationDay,
  } = useCoinPrices();

  useEffect(() => {
    async function getChartData() {
      if (!statsDataByChainName || !coinPricesWithCordinates) return;
      const lockValueByChainName: { [chainName: string]: number } = {};
      statsDataByChainName.forEach(({ chainName, lockedData }) => {
        lockValueByChainName[chainName] = Number(
          formatEther(lockedData.activeLockedAmount),
        );
      });

      const ChartDataWithCurrentNativeValue =
        combineChartDataWithNattiveLockAmount({
          cordinatesByChainName: coinPricesWithCordinates,
          lockValueByChainName,
        });

      setState({
        series: [
          {
            name: "Current Value Locked",
            data: ChartDataWithCurrentNativeValue,
          },
        ],
      });
    }
    getChartData();
  }, [duration, address, statsDataByChainName, coinPricesWithCordinates]);

  useEffect(() => {
    setDurationDay(DURATION_TO_DAY[duration]);
  }, [duration, setDurationDay]);

  if (
    !statsDataByChainName?.length ||
    !coinPricesWithCordinates ||
    !Object.keys(coinPricesWithCordinates).length
  )
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark  xl:col-span-8">
        <div className="flex h-full w-full animate-pulse">
          <div className="h-full w-full  bg-bodydark1 dark:bg-slate-700"></div>
        </div>
      </div>
    );

  return (
    <div
      className={`col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8 ${className}`}
    >
      <div className="flex flex-nowrap items-start justify-between gap-3">
        <div className="flex w-full flex-wrap gap-3 font-bold text-primary-neon sm:gap-5 sm:text-xl">
          Historical Value In USD
        </div>

        {/* Duration selection */}
        <div className="flex w-full max-w-25 items-start justify-end sm:max-w-45">
          <div className="flex items-center gap-1 rounded-md bg-whiter p-1 dark:bg-meta-4 sm:p-1.5">
            {DURATIONS.map(
              (durationTime, index: number) =>
                durationTime !== "Week" && (
                  <button
                    key={index}
                    className={`rounded  px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card  dark:text-white dark:hover:bg-boxdark ${duration === durationTime && "bg-white dark:bg-boxdark"}`}
                    onClick={() => setDuration(durationTime)}
                  >
                    {durationTime}
                  </button>
                ),
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div id="chartOne" className="-ml-5">
        {state.series.length > 0 && (
          <ReactApexChart
            series={state.series}
            options={areaChartOptions}
            type="area"
            height={350}
            width={"100%"}
          />
        )}
      </div>
    </div>
  );
};

export default USDLineChart;

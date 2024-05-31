import { PieChartOption, tickColors } from "@/utils/chart-options";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

interface ChartState {
  series: number[];
  labels: string[];
}

type LockData = {
  chainName: string;
  valueLockedInUsd: string | number;
};

const HodleLocksPieChart = ({
  LocksData = [],
  className,
}: {
  LocksData: LockData[];
  className?: string;
}) => {
  const [state, setState] = useState<ChartState>({
    series: [],
    labels: [],
  });
  const [totalValueLocked, setTotalValueLocked] = useState<number>(0);

  useEffect(() => {
    let totalValueInUSD: number = 0;
    let totalValuesLocked: number[] = [];
    let labels: string[] = [];
    LocksData.map((lockData: LockData, index: number) => {
      const { chainName, valueLockedInUsd } = lockData;
      const valueLockedInUSD =
        typeof valueLockedInUsd === "number"
          ? valueLockedInUsd
          : Number(lockData.valueLockedInUsd);

      totalValueInUSD += valueLockedInUSD;
      totalValuesLocked.push(valueLockedInUSD);
      labels.push(chainName);
    });
    setState({ series: totalValuesLocked, labels });
    setTotalValueLocked(totalValueInUSD);
  }, [LocksData]);

  const _className = `col-span-12 w-full rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4 ${className}`;

  if (!state.series.length || !LocksData.length) {
    return (
      <div className={_className}>
        <div className="flex h-full w-full animate-pulse">
          <div className="h-full w-full  bg-bodydark1 dark:bg-slate-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={_className}>
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Locked Value
          </h5>
        </div>
      </div>

      <div className="-mt-3 flex h-full w-full flex-col justify-evenly pb-3">
        <div className="realtive mb-2 flex w-full items-center">
          <div
            id="chartThree"
            className="relative mx-auto flex justify-center gap-2"
          >
            <ReactApexChart
              options={{ ...PieChartOption, labels: state.labels }}
              series={state.series}
              type="donut"
            />
            <div className="absolute -bottom-7 text-lg font-semibold text-primary-neon sm:top-1/2">
              <span>≈</span>
              <span> {totalValueLocked.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-y-3 pt-7.5 sm:p-0">
          {LocksData?.map((lockData: LockData, index: number) => {
            const colorHash = tickColors[index];

            return (
              <div key={index} className="w-full sm:w-1/2">
                <div className="flex w-full items-center justify-evenly">
                  <span
                    className={`mr-2 block h-3 w-full max-w-3 rounded-full bg-[${colorHash}]`}
                  ></span>
                  <p className="flex w-full items-center justify-between text-sm font-medium text-black dark:text-white">
                    <span> {lockData.chainName} </span>
                    <span>
                      {" "}
                      {Math.round(
                        100 /
                          (totalValueLocked /
                            Number(lockData.valueLockedInUsd)),
                      )}
                      %{" "}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HodleLocksPieChart;

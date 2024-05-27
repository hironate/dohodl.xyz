import { formatTokenDepositsToStats } from "@/utils/locks";
import {
  ResponsivPieChartOpetionForCard,
  PieChartOption,
  tickColors,
} from "@/utils/chart-options";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useConfig } from "wagmi";

interface ChartState {
  series: number[];
  labels: string[];
}

const UsersTokenChart = ({
  tokensData,
  isForCard = false,
}: {
  tokensData: any;
  isForCard?: boolean;
}) => {
  const [state, setState] = useState<ChartState>({
    series: [],
    labels: [],
  });

  const [totalValueLocked, setTotalValueLocked] = useState<number>(0);
  const [totalTokensLocked, setTotalTokensLocked] = useState<number>(0);
  const config = useConfig();

  useEffect(() => {
    async function formatActivity() {
      const { totalTokenValuesLocked, totalTokensLocked } =
        await formatTokenDepositsToStats(tokensData, config);

      setTotalTokensLocked(totalTokensLocked);

      const formatedChartDataValues: { symbol: string; amount: number }[] = [];
      let otherAmount = 0;

      totalTokenValuesLocked.forEach((data, index) => {
        if (index < 3) {
          formatedChartDataValues.push(data);
        } else {
          otherAmount += data.amount;
        }
      });

      if (otherAmount > 0) {
        formatedChartDataValues.push({ symbol: "other", amount: otherAmount });
      }

      const totalTokenValueLocked = formatedChartDataValues.reduce(
        (acc, { amount }) => acc + amount,
        0,
      );

      const labels = formatedChartDataValues.map(({ symbol }) => symbol);
      const series = formatedChartDataValues.map(({ amount }) => amount);

      setTotalValueLocked(totalTokenValueLocked);
      setState({ labels, series });
    }
    formatActivity();
  }, [config, tokensData]);

  const outterClassName = `w-full ${!isForCard ? "col-span-12 border border-stroke px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4 rounded-sm  bg-white" : "flex justify-center items-center"}`;

  if (!tokensData?.length) {
    return (
      <div className={outterClassName}>
        <div className="flex h-full w-full items-center justify-center gap-3 py-10">
          <div className="text-body dark:text-bodydark">
            No Locked Token Found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={outterClassName}>
      {!isForCard && (
        <div className="mb-3 justify-between gap-4 sm:flex">
          <div>
            <h5 className="text-xl font-semibold text-black dark:text-white">
              Locked Tokens
            </h5>
          </div>
        </div>
      )}

      <div
        className={`flex h-full w-full flex-col justify-evenly ${!isForCard && "pb-3"}`}
      >
        <div className={`realtive flex w-full items-center justify-center`}>
          <div
            id="chartThree"
            className="relative mx-auto flex items-center justify-center"
          >
            <ReactApexChart
              options={{
                ...PieChartOption,
                labels: state.labels,
                ...(isForCard ? ResponsivPieChartOpetionForCard : {}),
              }}
              series={state.series}
              type="donut"
            />
            {/* {isForCard && (
              <div className="absolute text-center text-base font-semibold text-primary-neon ">
                Tokens
              </div>
            )} */}
          </div>
        </div>

        {!isForCard && (
          <div
            className={`flex w-full flex-wrap items-center gap-y-3 ${isForCard && "flex-col"}`}
          >
            {!!state.series.length &&
              state.labels?.map((label, index: number) => {
                return (
                  <div key={index} className="w-full px-8 sm:w-1/2">
                    <div className="flex w-full items-center">
                      <span
                        className={`mr-2 block h-3 w-full max-w-3 rounded-full bg-[${tickColors[index]}]`}
                      ></span>
                      <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                        <span> {label} </span>
                        <span>
                          {" "}
                          {Math.round(
                            100 / (totalValueLocked / state.series[index]),
                          )}
                          %{" "}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTokenChart;
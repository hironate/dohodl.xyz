import { getChartDataByCoinId } from "@/helper/coingecko-helper";
import {
  CHAIN_ID_TO_CHAIN_NAME,
  CHAIN_ID_TO_PRICE_CHAIN_NAME,
  CHAIN_NAME_TO_COINGECKO_COIN_ID,
} from "@/utils/constant";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { useAccount } from "wagmi";

const useCoinPrices = () => {
  const [durationDay, setDurationDay] = useState<number>(30);
  const { chain } = useAccount();
  const { data: chartDataWithChainName, refetch } = useQuery({
    queryKey: ["historical-chart-data", durationDay],
    queryFn: async () => {
      const chartData: {
        [chainName: string]: { current_price: string; prices: any[] };
      } = {};
      const chartDataResponses = Object.keys(
        CHAIN_NAME_TO_COINGECKO_COIN_ID,
      ).map(async (chainName) => {
        const chartDataResponse = await getChartDataByCoinId({
          id: CHAIN_NAME_TO_COINGECKO_COIN_ID[chainName],
          days: durationDay.toString(),
          interval: "daily",
        });
        const prices: any[] = chartDataResponse?.["prices"];

        chartData[chainName] = {
          current_price: prices[prices.length - 1]?.[1],
          prices,
        };
      });

      await Promise.all(chartDataResponses);
      return chartData;
    },
  });

  const price = useMemo(
    () =>
      chartDataWithChainName?.[CHAIN_ID_TO_PRICE_CHAIN_NAME[chain?.id || 1]]
        .current_price,
    [chain?.id, chartDataWithChainName],
  );

  const coin_prices_with_cordinates = useMemo(() => {
    if (chartDataWithChainName) {
      const prices_with_cordinates: {
        [chainName: string]: { x: Date; y: string }[];
      } = {};
      Object.keys(chartDataWithChainName).map((chainName) => {
        prices_with_cordinates[chainName] = chartDataWithChainName[
          chainName
        ].prices?.map((price_with_timestamp) => {
          return {
            x: new Date(price_with_timestamp[0]),
            y: Number(price_with_timestamp[1]).toFixed(2),
          };
        });
      });

      return prices_with_cordinates;
    }
  }, [chartDataWithChainName]);

  return {
    chartDataWithChainName,
    setDurationDay,
    price,
    coin_prices_with_cordinates,
  };
};

export default useCoinPrices;

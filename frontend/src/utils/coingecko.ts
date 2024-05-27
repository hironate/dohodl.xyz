import { getChartDataByCoinId } from "@/helper/coingecko-helper";
import { CHAIN_NAME_TO_COINGECKO_COIN_ID } from "./constant";
import { getCoinsPriceInUSD } from "./ethers";
import { formatEther } from "ethers";

type ChartDataByChainReturn_TYPE = {
  x: Date;
  y: string;
};

export const getChartDataOfNattiveValueByChainName = async ({
  nativeValue = 1,
  chainName = "Ethereum",
  days = "7",
}: {
  nativeValue: number;
  chainName: string;
  days?: string;
}): Promise<ChartDataByChainReturn_TYPE[]> => {
  const chartData = await getChartDataByCoinId({
    id: CHAIN_NAME_TO_COINGECKO_COIN_ID[chainName],
    days: days,
    interval: "daily",
  });

  const chartDataPrices: { x: Date; y: string }[] = chartData.prices.map(
    (price: any) => {
      return {
        x: new Date(price[0]),
        y: (Number(price[1]) * nativeValue).toFixed(2),
      };
    },
  );

  return chartDataPrices;
};

export const combineChartDataWithNattiveLockAmount = ({
  cordinatesByChainName,
  lockValueByChainName,
}: {
  cordinatesByChainName: {
    [chainName: string]: ChartDataByChainReturn_TYPE[];
  };
  lockValueByChainName: { [chainName: string]: number };
}) => {
  const ChartDataWithCurrentNativeValue: { x: Date; y: string }[] = [];

  // Combine chart data with native lock amounts
  Object.keys(cordinatesByChainName).map((chainName) => {
    cordinatesByChainName[chainName].map(({ x, y }, index) => {
      let modifiedValue = Number(y) * lockValueByChainName[chainName];

      // For Base chain only
      if (chainName === "Ethereum") {
        modifiedValue += Number(y) * lockValueByChainName["Base"];
      }

      const preValues = ChartDataWithCurrentNativeValue[index];

      if (preValues) {
        ChartDataWithCurrentNativeValue[index] = {
          x: preValues.x,
          y: (Number(preValues.y) + modifiedValue).toFixed(2),
        };
      } else {
        ChartDataWithCurrentNativeValue.push({
          x,
          y: modifiedValue.toFixed(2),
        });
      }
    });
  });

  return ChartDataWithCurrentNativeValue;
};

export const getNattiveAmountValueInUsd = async ({
  LocksData,
  prices,
  isAmountFormated = false,
}: {
  LocksData: {
    chainName: string;
    lockedAmount: number | string;
  }[];
  isAmountFormated?: boolean;
  prices?: { [chainName: string]: number };
}) => {
  if (!prices) {
    prices = await getCoinsPriceInUSD({
      coins: Object.values(CHAIN_NAME_TO_COINGECKO_COIN_ID),
    });
  }

  if (prices) {
    const chainsLockedValue = LocksData.map(({ chainName, lockedAmount }) => {
      const amount = !isAmountFormated
        ? formatEther(lockedAmount.toString())
        : lockedAmount;
      if (chainName === "Base") {
        return {
          chainName,
          valueLockedInUsd:
            (Number(amount) * prices["ethereum"]).toFixed(2) || "0",
        };
      }
      return {
        chainName,
        valueLockedInUsd:
          (
            Number(amount) * prices[CHAIN_NAME_TO_COINGECKO_COIN_ID[chainName]]
          ).toFixed(2) || "0",
      };
    });

    return chainsLockedValue;
  }
};

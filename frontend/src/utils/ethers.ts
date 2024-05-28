import { getCoinsMarketDataByIds } from "@/helper/coingecko-helper";
import { BigNumberish, ethers, toBigInt } from "ethers";
import { resolvePromisesInBatches } from "./promise";

export function weiToEthFormate(wei?: BigNumberish) {
  let eth = ethers.formatEther("" + wei);
  const value = parseFloat(eth).toFixed(2);
  return value;
}

export const getCoinsPriceInUSD = async ({
  coins = [],
}: {
  coins: string[];
}) => {
  let responses = coins.map((coin) => {
    return getCoinsMarketDataByIds({ id: coin });
  });

  const coinsMarketData = await Promise.all(responses);

  let coinsPriceInUSD: { [key: string]: number } = {};
  coinsMarketData.map((coinMarketData: any) => {
    coinsPriceInUSD[coinMarketData.id] = Number(
      coinMarketData?.["market_data"]?.["current_price"]?.["usd"],
    );
  });

  return coinsPriceInUSD;
};

export const parseAmount = ({
  amount,
  decimals,
}: {
  amount: string | bigint | number | BigInt;
  decimals: string | bigint | number | BigInt;
}) => ethers.parseUnits(amount.toString(), toBigInt(decimals.toString()));

export const formatAmount = ({
  amount,
  decimals = 18,
  returnType = "string",
}: {
  amount: string | bigint | number | BigInt;
  decimals?: string | bigint | number | BigInt;
  returnType?: "number" | "string";
}) => {
  const formatedAmount = ethers.formatUnits(
    amount.toString(),
    toBigInt(decimals.toString()),
  );
  return returnType === "string" ? formatedAmount : Number(formatedAmount);
};

const getTx = ({
  txHash,
  chainName,
}: {
  txHash: string;
  chainName: string;
}) => {};

import axios from "axios";

const x_cg_demo_api_key = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

const getChartDataByCoinId = async ({
  id = "ethereum",
  days = "7",
  interval = "",
}: {
  id: string | undefined;
  days: string | undefined;
  interval: string | undefined;
}) => {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
    {
      params: {
        vs_currency: "usd",
        days,
        ...(interval ? { interval } : {}),
        x_cg_demo_api_key,
      },
      headers: {
        accept: "application/json",
      },
    },
  );
  return response.data;
};

export const getCoinsMarketDataByIds = async ({
  id = "ethereum",
  localization = false,
  tickers = false,
  market_data = true,
  community_data = false,
  developer_data = false,
  sparkline = false,
}: {
  id: string;
  localization?: boolean;
  tickers?: boolean;
  market_data?: boolean;
  community_data?: boolean;
  developer_data?: boolean;
  sparkline?: boolean;
}) => {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${id}`,
    {
      params: {
        localization: `${localization}`,
        tickers: `${tickers}`,
        market_data: `${market_data}`,
        community_data: `${community_data}`,
        developer_data: `${developer_data}`,
        sparkline: `${sparkline}`,
        x_cg_demo_api_key,
      },
      headers: {
        accept: "application/json",
      },
    },
  );
  return response.data;
};

export const getCoinsDataById = async (id: string = "ethereum") => {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${id}`,
    {
      params: { x_cg_demo_api_key },
      headers: { accept: "application/json" },
    },
  );
  return response.data;
};

export { getChartDataByCoinId };

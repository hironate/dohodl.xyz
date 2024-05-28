import { Metadata } from "next";
import { http } from "wagmi";
import {
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  mainnet,
  polygon,
  polygonAmoy,
  sepolia,
} from "wagmi/chains";

export const LOCAL_STORAGE_KEYS = {
  NETWORK_MODE: "network-mode",
  COLOR_MODER: "color-theme",
};

export const MAINNET_CHAINS = [mainnet, polygon, base, bsc] as const;
export const TESTNET_CHAINS = [
  sepolia,
  polygonAmoy,
  baseSepolia,
  bscTestnet,
] as const;

export const TESTNET_TRANSPORTS = {
  [sepolia.id]: http(
    `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  ),
  [polygonAmoy.id]: http(
    `https://polygon-amoy.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  ),
  [baseSepolia.id]: http(`https://sepolia.base.org`),
  [bscTestnet.id]: http("https://bsc-testnet.bnbchain.org"),
};

export const MAINNET_TRANSPORTS = {
  [mainnet.id]: http(
    `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  ),
  [polygon.id]: http(
    `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  ),
  [base.id]: http("https://mainnet.base.org"),
  [bsc.id]: http("https://bsc-dataseed1.binance.org"),
};

export const CHAIN_ID_TO_CHAIN_NAME: { [key: number]: string } = {
  [mainnet.id]: "Ethereum",
  [sepolia.id]: "Ethereum",
  [polygon.id]: "Polygon",
  [polygonAmoy.id]: "Polygon",
  [base.id]: "Base",
  [baseSepolia.id]: "Base",
  [bsc.id]: "BSC",
  [bscTestnet.id]: "BSC",
};

export const CHAIN_ID_TO_PRICE_CHAIN_NAME: { [key: number]: string } = {
  ...CHAIN_ID_TO_CHAIN_NAME,
  [base.id]: "Ethereum",
  [baseSepolia.id]: "Ethereum",
};

export const getChainIdByChainName = (
  chainName: string,
  isTestnet: boolean = false,
) => {
  switch (chainName) {
    case "Ethereum":
      return isTestnet ? sepolia.id : mainnet.id;
    case "Polygon":
      return isTestnet ? polygonAmoy.id : polygon.id;
    case "Base":
      return isTestnet ? baseSepolia.id : base.id;
    case "BSC":
      return isTestnet ? bscTestnet.id : bsc.id;
    default:
      return isTestnet ? sepolia.id : mainnet.id;
  }
};
export const CHAIN_NAME_TO_CHAIN_NATTIVE_SYMBOL: { [key: string]: string } = {
  Ethereum: mainnet.nativeCurrency.symbol,
  Polygon: polygon.nativeCurrency.symbol,
  Base: base.nativeCurrency.symbol,
  BSC: bsc.nativeCurrency.symbol,
};

export const DURATIONS: ["Week", "Month", "Year"] = ["Week", "Month", "Year"];

export const DURATION_TO_DAY = {
  Day: 1,
  ["Week"]: 7,
  ["Month"]: 30,
  ["Year"]: 365,
};

export const DefaultMetadata: Metadata = {
  title: "Hodl",
  description:
    "This is Next.js Calender page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

export const CHAIN_NAME_TO_COINGECKO_COIN_ID: { [key: string]: string } = {
  [mainnet.name]: "ethereum",
  BSC: "binancecoin",
  [polygon.name]: "matic-network",
};

export const COINGECKO_COIN_ID_TO_CHAIN_NAME: { [key: string]: string } = {
  ethereum: mainnet.name,
  binancecoin: "BSC",
  "matic-network": polygon.name,
  base: base.name,
};

export const CHAIN_ID_TO_EXPLORER_BASE_URI: { [chainId: number]: string } = {
  [sepolia.id]: "https://sepolia.etherscan.io",
  [mainnet.id]: "https://etherscan.io",
  [polygon.id]: "https://polygonscan.com",
  [polygonAmoy.id]: "https://amoy.polygonscan.com",
  [bsc.id]: "https://bscscan.com",
  [bscTestnet.id]: "https://testnet.bscscan.com",
  [base.id]: "https://basescan.org",
  [baseSepolia.id]: "https://sepolia.basescan.org",
};

export const WALLETCONNECT_PROJECT_ID = "918a5f599cd08ceda8a8fde864cdc062";

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

const CHAIN_DETAILS: { [chainID: number]: any } = {
  [mainnet.id]: {
    name: "Ethereum Mainnet",
    chain: "ETH",
    chainId: 1,
    nativeCurrencySymbol: "ETH",
    rpc: [
      `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    ],
    logoUrl: "/images/chainLogo/ethereum.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_MAINNET_SUBGRAPH_URL,
    etherscan: "https://etherscan.io",
  },
  [sepolia.id]: {
    name: "Sepolia",
    chain: "ETH",
    chainId: 11155111,
    nativeCurrencySymbol: "ETH",
    rpc: [
      `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    ],
    logoUrl: "/images/chainLogo/ethereum.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_SEPOLIA_SUBGRAPH_URL,
    etherscan: "https://sepolia.etherscan.io",
  },

  [polygon.id]: {
    name: "Polygon Mainnet",
    chain: "Polygon",
    chainId: 137,
    nativeCurrencySymbol: "MATIC",
    rpc: [
      `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    ],
    logoUrl: "/images/chainLogo/polygon.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_POLYGON_SUBGRAPH_URL,
    etherscan: "https://polygonscan.com",
  },
  [polygonAmoy.id]: {
    name: "Amoy",
    chain: "Polygon",
    chainId: 80002,
    nativeCurrencySymbol: "MATIC",
    rpc: [
      `https://polygon-amoy.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    ],
    logoUrl: "/images/chainLogo/polygon.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_AMOY_SUBGRAPH_URL,
    etherscan: "https://amoy.polygonscan.com",
  },
  [bsc.id]: {
    name: "Binance Mainnet",
    chain: "BSC",
    chainId: 56,
    nativeCurrencySymbol: "BNB",
    rpc: ["https://bsc-dataseed1.binance.org"],
    logoUrl: "/images/chainLogo/binance.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_BINANCE_SUBGRAPH_URL,
    etherscan: "https://bscscan.com",
  },
  [bscTestnet.id]: {
    name: "Binance Testnet",
    chain: "BSC",
    chainId: 97,
    nativeCurrencySymbol: "tBNB",
    rpc: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    logoUrl: "/images/chainLogo/binance.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_BINANCE_TESTNET_SUBGRAPH_URL,
    etherscan: "https://testnet.bscscan.com",
  },
  [base.id]: {
    name: "Base Mainnet",
    chain: "Base",
    chainId: 8453,
    nativeCurrencySymbol: "ETH",
    rpc: ["https://mainnet.base.org"],
    logoUrl: "/images/chainLogo/base.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_BASE_SUBGRAPH_URL,
    etherscan: "https://basescan.org",
  },
  [baseSepolia.id]: {
    name: "Base Sepolia Testnet",
    chain: "Base",
    chainId: 84532,
    nativeCurrencySymbol: "ETH",
    rpc: ["https://sepolia.base.org"],
    logoUrl: "/images/chainLogo/base.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_BASE_TESTNET_SUBGRAPH_URL,
    etherscan: "https://sepolia.basescan.org",
  },
};

export const getDefaultChainID = (isTestnet: boolean = false) =>
  isTestnet ? sepolia.id : mainnet.id;

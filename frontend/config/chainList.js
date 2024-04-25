export const chainList = [
  {
    name: "Ethereum Mainnet",
    chain: "ETH",
    chainId: 1,
    nativeCurrencySymbol: "ETH",
    rpc: [
      `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    ],
    logoUrl: "/images/chainLogo/ethereum.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_MAINNET_SUBGRAPH_URL,
    subgraphUrlErc20Hodl:
      process.env.NEXT_PUBLIC_MAINNET_ERC20_HODL_SUBGRAPH_URL,
    etherscan: "https://etherscan.io",
  },
  {
    name: "Sepolia",
    chain: "ETH",
    chainId: 11155111,
    nativeCurrencySymbol: "ETH",
    rpc: [
      `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    ],
    logoUrl: "/images/chainLogo/ethereum.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_SEPOLIA_SUBGRAPH_URL,
    subgraphUrlErc20Hodl:
      process.env.NEXT_PUBLIC_SEPOLIA_ERC20_HODL_SUBGRAPH_URL,
    etherscan: "https://goerli.etherscan.io",
  },

  {
    name: "Polygon Mainnet",
    chain: "Polygon",
    chainId: 137,
    nativeCurrencySymbol: "MATIC",
    rpc: [
      `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    ],
    logoUrl: "/images/chainLogo/polygon.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_POLYGON_SUBGRAPH_URL,
    subgraphUrlErc20Hodl:
      process.env.NEXT_PUBLIC_POLYGON_ERC20_HODL_SUBGRAPH_URL,
    etherscan: "https://polygonscan.com",
  },
  {
    name: "Mumbai",
    chain: "Polygon",
    chainId: 80001,
    nativeCurrencySymbol: "MATIC",
    rpc: [
      `https://polygon-mumbai.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    ],
    logoUrl: "/images/chainLogo/polygon.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_MUMBAI_SUBGRAPH_URL,
    subgraphUrlErc20Hodl:
      process.env.NEXT_PUBLIC_MUMBAI_ERC20_HODL_SUBGRAPH_URL,
    etherscan: "https://mumbai.polygonscan.com",
  },
  {
    name: "Binance Mainnet",
    chain: "BSC",
    chainId: 56,
    nativeCurrencySymbol: "BNB",
    rpc: ["https://bsc-dataseed1.binance.org"],
    logoUrl: "/images/chainLogo/binance.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_BINANCE_SUBGRAPH_URL,
    subgraphUrlErc20Hodl:
      process.env.NEXT_PUBLIC_BINANCE_ERC20_HODL_SUBGRAPH_URL,
    etherscan: "https://bscscan.com",
  },
  {
    name: "Binance Testnet",
    chain: "BSC",
    chainId: 97,
    nativeCurrencySymbol: "tBNB",
    rpc: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    logoUrl: "/images/chainLogo/binance.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_BINANCE_TESTNET_SUBGRAPH_URL,
    subgraphUrlErc20Hodl:
      process.env.NEXT_PUBLIC_BINANCE_TESTNET_ERC20_HODL_SUBGRAPH_URL,
    etherscan: "https://testnet.bscscan.com",
  },
  {
    name: "Base Mainnet",
    chain: "Base",
    chainId: 8453,
    nativeCurrencySymbol: "ETH",
    rpc: ["https://mainnet.base.org"],
    logoUrl: "/images/chainLogo/base.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_BASE_SUBGRAPH_URL,
    subgraphUrlErc20Hodl: process.env.NEXT_PUBLIC_BASE_ERC20_HODL_SUBGRAPH_URL,
    etherscan: "https://basescan.org",
  },
  {
    name: "Base Sepolia Testnet",
    chain: "Base",
    chainId: 84532,
    nativeCurrencySymbol: "ETH",
    rpc: ["https://sepolia.base.org"],
    logoUrl: "/images/chainLogo/base.png",
    subgraphApiUrl: process.env.NEXT_PUBLIC_BASE_TESTNET_SUBGRAPH_URL,
    subgraphUrlErc20Hodl:
      process.env.NEXT_PUBLIC_BASE_TESTNET_ERC20_HODL_SUBGRAPH_URL,
    etherscan: "https://sepolia.basescan.org",
  },
];

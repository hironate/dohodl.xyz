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
    subgraphApiUrl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/hodlmainnet",
    subgraphUrlErc20Hodl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/erc20hodlmumbai",
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
    subgraphApiUrl:
      "https://api.studio.thegraph.com/query/71227/hodlsepolia/version/latest",
    subgraphUrlErc20Hodl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/erc20hodlmumbai",
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
    subgraphApiUrl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/hodlpolygon",
    subgraphUrlErc20Hodl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/erc20hodlmumbai",
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
    subgraphApiUrl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/hodlmumbai",
    subgraphUrlErc20Hodl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/erc20hodlmumbai",
    etherscan: "https://mumbai.polygonscan.com",
  },
  {
    name: "Binance Mainnet",
    chain: "BSC",
    chainId: 56,
    nativeCurrencySymbol: "BNB",
    rpc: ["https://bsc-dataseed1.binance.org"],
    logoUrl: "/images/chainLogo/binance.png",
    subgraphApiUrl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/hodlbinance",
    subgraphUrlErc20Hodl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/erc20hodlmumbai",
    etherscan: "https://bscscan.com",
  },
  {
    name: "Binance Testnet",
    chain: "BSC",
    chainId: 97,
    nativeCurrencySymbol: "tBNB",
    rpc: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    logoUrl: "/images/chainLogo/binance.png",
    subgraphApiUrl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/hodlchapel",
    subgraphUrlErc20Hodl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/erc20hodlmumbai",
    etherscan: "https://testnet.bscscan.com",
  },
  {
    name: "Base Mainnet",
    chain: "Base",
    chainId: 8453,
    nativeCurrencySymbol: "ETH",
    rpc: ["https://mainnet.base.org"],
    logoUrl: "/images/chainLogo/base.png",
    subgraphApiUrl:
      "https://api.studio.thegraph.com/proxy/71227/hodlbasesepolia/version/latest",
    subgraphUrlErc20Hodl:
      "https://api.thegraph.com/subgraphs/name/tushar-simform/erc20hodlmumbai",
    etherscan: "https://basescan.org",
  },
  {
    name: "Base Sepolia Testnet",
    chain: "Base",
    chainId: 84532,
    nativeCurrencySymbol: "ETH",
    rpc: ["https://sepolia.base.org"],
    logoUrl: "/images/chainLogo/base.png",
    subgraphApiUrl:
      "https://api.studio.thegraph.com/proxy/71227/hodlbasesepolia/version/latest",
    subgraphUrlErc20Hodl:
      "https://api.studio.thegraph.com/proxy/71227/erc20hodlbasesepolia/version/latest",
    etherscan: "https://sepolia.basescan.org",
  },
];

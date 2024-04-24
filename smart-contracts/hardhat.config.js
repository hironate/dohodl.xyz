const { config } = require("dotenv");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
config();
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;
const SEPOLIA_ALCHEMY_API = process.env.SEPOLIA_ALCHEMY_API;
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 5,
      gas: "auto",
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${SEPOLIA_ALCHEMY_API}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 11155111,
      gas: "auto",
    },
    bscTestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 97,
      gas: "auto",
    },
    polygonMumbai: {
      url: `https://rpc-mumbai.maticvigil.com/`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 80001,
      gas: "auto",
    },

    mainnet: {
      url: `https://mainnet.infura.io/v3/${ALCHEMY_API_KEY}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 1,
      gas: "auto",
    },
    polygon: {
      url: `https://polygon-rpc.com/`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 137,
      gas: "auto",
    },
    bsc: {
      url: `https://bsc-dataseed.binance.org/`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 56,
      gas: "auto",
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 8453,
      gas: "auto",
    },
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_SEPOLIA_API_KEY}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 84532,
      gas: "auto",
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCANE_MAINNET_API_KEY,
      sepolia: process.env.ETHERSCANE_SEPOLIA_API_KEY,
      polygon: process.env.ETHERSCANE_POLYGON_API_KEY,
      bsc: process.env.ETHERSCANE_BSC_API_KEY,
      goerli: process.env.ETHERSCANE_GOERLI_API_KEY,
      polygonMumbai: process.env.ETHERSCANE_MUMBAI_API_KEY,
      bscTestnet: process.env.ETHERSCANE_BSC_TESTNET_API_KEY,
      base: process.env.ETHERSCANE_BASE_API_KEY,
      baseSepolia: process.env.ETHERSCANE_BASE_TESTNET_API_KEY,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
    ],
  },
};

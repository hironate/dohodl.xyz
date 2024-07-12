const { config } = require('dotenv');
require('@nomicfoundation/hardhat-toolbox');
require('@nomiclabs/hardhat-solhint');
config();

// import hardhat CLI tasks
require('./tasks/hodl');
require('./tasks/erc20-hodl');
require('./tasks/launchpad');

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;
const SEPOLIA_ALCHEMY_API = process.env.SEPOLIA_ALCHEMY_API;
const BASE_ALCHEMY_API = process.env.BASE_ALCHEMY_API;
const BASE_SEPOLIA_ALCHEMY_API = process.env.BASE_SEPOLIA_ALCHEMY_API;
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 50,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      },
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 5,
      gas: 'auto',
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${SEPOLIA_ALCHEMY_API}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 11155111,
      gas: 'auto',
    },
    bscTestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 97,
      gas: 'auto',
    },
    polygonMumbai: {
      url: `https://rpc-mumbai.maticvigil.com/`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 80001,
      gas: 'auto',
    },

    mainnet: {
      url: `https://mainnet.infura.io/v3/${ALCHEMY_API_KEY}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 1,
      gas: 'auto',
    },
    polygon: {
      url: `https://polygon-rpc.com/`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 137,
      gas: 'auto',
    },
    bsc: {
      url: `https://bsc-dataseed.binance.org/`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 56,
      gas: 'auto',
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${BASE_ALCHEMY_API}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 8453,
      gas: 'auto',
    },
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${BASE_SEPOLIA_ALCHEMY_API}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 84532,
      gas: 'auto',
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_MAINNET_API_KEY,
      sepolia: process.env.ETHERSCAN_SEPOLIA_API_KEY,
      goerli: process.env.ETHERSCAN_GOERLI_API_KEY,
      polygon: process.env.ETHERSCAN_POLYGON_API_KEY,
      polygonMumbai: process.env.ETHERSCAN_POLYGON_MUMBAI_API_KEY,
      bsc: process.env.ETHERSCAN_BINANCE_API_KEY,
      bscTestnet: process.env.ETHERSCAN_BINANCE_TESTNET_API_KEY,
      base: process.env.ETHERSCAN_BASE_API_KEY,
      baseSepolia: process.env.ETHERSCAN_BASE_SEPOLIA_API_KEY,
    },
    customChains: [
      {
        network: 'baseSepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org/',
        },
      },
    ],
  },
};

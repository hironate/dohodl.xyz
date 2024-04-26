const { config } = require('dotenv');
require('@nomicfoundation/hardhat-toolbox');
require('@nomiclabs/hardhat-solhint');
config();

// import hardhat CLI tasks
require('./tasks/hodl');
require('./tasks/erc20-hodl');

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;
const SEPOLIA_ALCHEMY_API = process.env.SEPOLIA_ALCHEMY_API;
const BASE_ALCHEMY_API = process.env.BASE_ALCHEMY_API;
const BASE_SEPOLIA_ALCHEMY_API = process.env.BASE_SEPOLIA_ALCHEMY_API;
module.exports = {
  solidity: '0.8.20',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mainnet: {
      url: `https://gateway.tenderly.co/public/mainnet`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 1,
      gas: 'auto',
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${SEPOLIA_ALCHEMY_API}`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 11155111,
      gas: 'auto',
    },
    amoy: {
      url: `https://rpc-amoy.polygon.technology/`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 80002,
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
    bscTestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      accounts: [`${ACCOUNT_PRIVATE_KEY}`],
      chainId: 97,
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
      mainnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_GOERLI_API_KEY,
      amoy: process.env.POLYSCAN_API_KEY,
      polygon: process.env.POLYSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
      base: process.env.BASESCAN_API_KEY,
      baseSepolia: process.env.BASESCAN_API_KEY,
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
      {
        network: 'amoy',
        chainId: 80002,
        urls: {
          apiURL: 'https://api-amoy.polygonscan.com/api',
          browserURL: 'https://amoy.polygonscan.com/',
        },
      },
    ],
  },
};

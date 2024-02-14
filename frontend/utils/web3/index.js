import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Fortmatic from 'fortmatic';
import { ethers } from 'ethers';

let web3Modal;
const customNetworkOptions = {
  rpcUrl: 'https://rpc-mainnet.maticvigil.com',
  chainId: 137,
};
const providerOptions = {
  coinbasewallet: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: 'uniswap', // Required
      infuraId: process.env.REACT_APP_INFURA_API_KEY, // Required
      rpc: '', // Optional if `infuraId` is provided; otherwise it's required
      chainId: 1, // Optional. It defaults to 1 if not provided
      darkMode: false, // Optional. Use dark theme, defaults to false
    },
  },
  fortmatic: {
    package: Fortmatic, // required
    options: {
      key: 'FORTMATIC_KEY', // required
      network: customNetworkOptions, // if we don't pass it, it will default to localhost:8454
    },
  },
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: { 42: process.env.NEXT_PUBLIC_RPC_URL }, // required
    },
  },
};
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    // theme: "dark",
    cacheProvider: false,
    providerOptions, // required
  });
}
export const getWalletData = async () => {
  try {
    const web3ModalProvider = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(web3ModalProvider);

    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      let balance = await provider.getBalance(account);

      balance = ethers.utils.formatEther(balance);

      const signer = provider.getSigner();

      const data = {
        currentAccount: account,
        accountBalance: balance,
        isConnected: account && true,
        provider: provider,
        signer: signer,
      };
      return data;
    }
  } catch (e) {}
};

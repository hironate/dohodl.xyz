import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import { setWalletData } from '../../../redux/action';
import { UserDetails } from './UserDetails';
import { ConnectWallet } from './ConnectWallet';
import { Icon } from '../../Atom/Icon';
import { AiOutlineLogout } from 'react-icons/ai';

export const UserAccount = () => {
  const dispatch = useDispatch();
  const walletData = useSelector((state) => state).WalletDataReducer;
  const chainData = useSelector((state) => state).ChainDataReducer;

  useEffect(() => {
    let walletStatus = JSON.parse(window.sessionStorage.getItem('walletData'));

    if (walletStatus && walletStatus.isConnected) {
      fetchWalletData();
    }
  }, []);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      ethereum.on('accountsChanged', async (accounts) => {
        await fetchWalletData();
      });
      ethereum.on('chainChanged', async (chainId) => {
        await fetchWalletData();
      });
    }
  }, []);
  const fetchWalletData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const [account] = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    let balance = await provider.getBalance(account);
    balance = ethers.utils.formatEther(balance);

    const data = {
      currentAccount: account,
      accountBalance: balance,
      isConnected: account && true,
      provider: provider,
      signer: signer,
    };
    window.sessionStorage.setItem(
      'walletData',
      JSON.stringify({
        currentAccount: account,
        accountBalance: balance,
        isConnected: account && true,
      }),
    );
    dispatch(setWalletData(data));
  };

  function handleLogout() {
    const data = {
      currentAccount: '',
      accountBalance: '',
      isConnected: false,
    };
    window.sessionStorage.setItem('walletData', JSON.stringify(data));
    dispatch(setWalletData(data));
  }

  return walletData.isConnected ? (
    <>
      <UserDetails
        walletData={walletData}
        currencySymbol={chainData.nativeCurrencySymbol}
        etherscan={chainData.etherscan}
      />
      <button onClick={handleLogout} title="Logout" className="cursor-pointer">
        <Icon icon={AiOutlineLogout} className="text-3xl pr-2 w-full h-full" />
      </button>
    </>
  ) : (
    <ConnectWallet />
  );
};

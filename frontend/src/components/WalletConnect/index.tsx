import { useAccount, useConnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import DropdownUser from "../Header/DropdownUser";

const WalletConnect = () => {
  const { isConnected, status } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <div className="relative ">
      {isConnected ? (
        <DropdownUser />
      ) : (
        <button
          className="text-bodydark3 rounded-xl bg-primary p-4 py-2 font-bold text-bodydark1 hover:text-white dark:hover:text-white"
          onClick={() => open({ view: "Connect" })}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;

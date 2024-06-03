import React from "react";
import { WagmiProvider, createStorage, cookieStorage } from "wagmi";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import {
  MAINNET_CHAINS,
  MAINNET_TRANSPORTS,
  TESTNET_CHAINS,
  TESTNET_TRANSPORTS,
  WALLETCONNECT_PROJECT_ID,
} from "@/utils/constant";
import { NetworkMode } from "@/types/web3";

const metadata = {
  name: "dohodl",
  description: "",
  url: "https://www.dohodl.xyz/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
export const queryClient = new QueryClient();

const WalletConnectProvider = ({
  networkMode,
  children,
}: {
  networkMode: NetworkMode;
  children: React.ReactNode;
}) => {
  const wagmiConfig = defaultWagmiConfig({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: networkMode === "mainnet" ? MAINNET_CHAINS : TESTNET_CHAINS,
    metadata,
    ssr: false,
  });

  createWeb3Modal({
    wagmiConfig,
    projectId: WALLETCONNECT_PROJECT_ID,
    metadata,
    allWallets: "SHOW",
  });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};

export default WalletConnectProvider;

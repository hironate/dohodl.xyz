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
} from "@/utils/constant";
import { NetworkMode } from "@/types/web3";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "dohodl",
  description: "",
  url: "localhost:/3000",
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
    projectId,
    chains: networkMode === "mainnet" ? MAINNET_CHAINS : TESTNET_CHAINS,
    transports:
      networkMode === "mainnet" ? MAINNET_TRANSPORTS : TESTNET_TRANSPORTS,
    metadata,
    ssr: false,
    storage: createStorage({
      storage: cookieStorage,
    }),
  });

  createWeb3Modal({
    wagmiConfig,
    projectId,
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

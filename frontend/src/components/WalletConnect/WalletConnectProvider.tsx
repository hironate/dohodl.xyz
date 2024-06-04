"use client";
import React, { useEffect, useState } from "react";
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
import { State } from "@wagmi/core";
import Loader from "../common/Loader";
import useNetworkMode from "@/hooks/useNetworkMode";

const metadata = {
  name: "dohodl",
  description: "",
  url: "localhost:/3000",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
export const queryClient = new QueryClient();

const WalletConnectProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: any;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [networkMode] = useNetworkMode();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const wagmiConfig = defaultWagmiConfig({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: networkMode === "mainnet" ? MAINNET_CHAINS : TESTNET_CHAINS,
    metadata,
    ssr: false,
    storage: createStorage({
      storage: cookieStorage,
    }),
  });

  createWeb3Modal({
    wagmiConfig,
    projectId: WALLETCONNECT_PROJECT_ID,
    metadata,
    allWallets: "SHOW",
  });

  return loading ? (
    <Loader />
  ) : (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};

export default WalletConnectProvider;

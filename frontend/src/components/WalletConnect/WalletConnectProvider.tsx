"use client";
import { WagmiProvider, createStorage, cookieStorage } from "wagmi";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import {
  MAINNET_CHAINS,
  TESTNET_CHAINS,
  WALLETCONNECT_PROJECT_ID,
} from "@/utils/constant";
import useNetworkMode from "@/hooks/useNetworkMode";

const metadata = {
  name: "dohodl",
  description: "",
  url: "https://www.dohodl.xyz/",
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
  const [networkMode] = useNetworkMode();

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

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};

export default WalletConnectProvider;

import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import WalletConnectProvider from "@/components/WalletConnect/WalletConnectProvider";
import useNetworkMode from "@/hooks/useNetworkMode";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { cookieStorage, cookieToInitialState, createStorage } from "wagmi";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { headers } from "next/headers";
import {
  MAINNET_CHAINS,
  TESTNET_CHAINS,
  WALLETCONNECT_PROJECT_ID,
} from "@/utils/constant";

const metadata = {
  name: "dohodl",
  description: "",
  url: "https://www.dohodl.xyz/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config: any = defaultWagmiConfig({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: [...MAINNET_CHAINS, ...TESTNET_CHAINS],
    ssr: true,
    metadata,
    storage: createStorage({
      storage: cookieStorage,
    }),
  });
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          <WalletConnectProvider initialState={initialState}>
            <DefaultLayout>{children}</DefaultLayout>
          </WalletConnectProvider>
        </div>
      </body>
    </html>
  );
}

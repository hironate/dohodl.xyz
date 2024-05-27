import React, { useMemo, useState } from "react";
import ChainLogo from "./ChainLogo";
import { useAccount, useSwitchChain } from "wagmi";
import { KeyboardArrowDownTwoTone } from "@mui/icons-material";
import useNetworkMode from "@/hooks/useNetworkMode";
import {
  CHAIN_ID_TO_CHAIN_NAME,
  MAINNET_CHAINS,
  TESTNET_CHAINS,
} from "@/utils/constant";

const ChainTracker = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { chain, isConnected } = useAccount();
  const [network] = useNetworkMode();
  const { switchChainAsync } = useSwitchChain();

  const CHAINS = useMemo(
    () => (network === "mainnet" ? MAINNET_CHAINS : TESTNET_CHAINS),
    [network],
  );

  if (!isConnected) return <></>;

  return (
    <div className="relative min-w-fit">
      <div
        className="flex w-full items-center gap-3 hover:cursor-pointer"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="flex w-fit items-center gap-2">
          <ChainLogo
            chainName={CHAIN_ID_TO_CHAIN_NAME[chain?.id || 1].toLowerCase()}
          />
          <span className="hidden md:block">
            {chain?.name === "BNB Smart Chain" ||
            chain?.name === "Binance Smart Chain Testnet"
              ? "BSC"
              : chain?.name}
          </span>
        </div>
        <KeyboardArrowDownTwoTone />
      </div>
      {/* <!-- Dropdown Start --> */}
      <div
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4  flex w-60 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark md:left-0 ${
          dropdownOpen === true ? "block" : "hidden"
        }`}
      >
        <ul className="flex min-w-fit flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
          {CHAINS.map((chain, index) => (
            <li
              key={index}
              className="flex cursor-pointer items-center gap-2 font-semibold hover:text-primary"
              onClick={() => {
                switchChainAsync({ chainId: chain?.id });
              }}
            >
              <ChainLogo
                chainName={CHAIN_ID_TO_CHAIN_NAME[chain?.id].toLowerCase()}
              />
              <span className="block">
                {chain.name === "BNB Smart Chain" ||
                chain.name === "Binance Smart Chain Testnet"
                  ? "BSC"
                  : chain?.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChainTracker;

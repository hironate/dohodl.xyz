import React, { useMemo, useState } from "react";
import ChainLogo from "./ChainLogo";
import { useAccount, useSwitchChain } from "wagmi";
import { KeyboardArrowDownTwoTone } from "@mui/icons-material";
import useNetworkMode from "@/hooks/useNetworkMode";
import {
  CHAIN_ID_TO_CHAIN_NAME,
  MAINNET_CHAINS,
  TESTNET_CHAINS,
  getChainIdByChainName,
} from "@/utils/constant";
import Dropdown from "../Dropdown";

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
      {/* <!-- Dropdown Start --> */}
      <Dropdown
        dropdownItems={CHAINS.map((chain) =>
          chain.name === "BNB Smart Chain" ||
          chain.name === "Binance Smart Chain Testnet"
            ? "BSC"
            : chain?.name,
        )}
        preRender={(item, index) => {
          return (
            <ChainLogo
              chainName={CHAIN_ID_TO_CHAIN_NAME[CHAINS[index].id].toLowerCase()}
            />
          );
        }}
        onItemClick={(item) =>
          switchChainAsync({
            chainId: getChainIdByChainName(item, network === "testnet"),
          })
        }
      >
        <div className="flex w-full items-center gap-3 hover:cursor-pointer">
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
      </Dropdown>
    </div>
  );
};

export default ChainTracker;

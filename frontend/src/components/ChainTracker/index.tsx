import React, { useCallback, useMemo, useState } from "react";
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
import { getDefaultChainID } from "@/utils/chains";

const ChainTracker = () => {
  const { chain, isConnected } = useAccount();
  const [network] = useNetworkMode();
  const { switchChainAsync } = useSwitchChain();

  const CHAINS = useMemo(
    () => (network === "mainnet" ? MAINNET_CHAINS : TESTNET_CHAINS),
    [network],
  );

  const handleSwitchChain = useCallback(async () => {
    if (!chain?.id)
      await switchChainAsync({
        chainId: getDefaultChainID(network === "testnet"),
      });
  }, [chain?.id, network, switchChainAsync]);

  if (!isConnected) return <></>;

  if (!chain?.id)
    return (
      <button
        className="text-bodydark3 rounded-xl bg-primary p-4 py-2 text-center font-bold text-white hover:text-bodydark1"
        onClick={() => handleSwitchChain()}
      >
        Switch Chain
      </button>
    );

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

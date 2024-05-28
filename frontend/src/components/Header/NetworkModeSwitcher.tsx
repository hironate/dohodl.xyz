"use client";
import React from "react";
import SwitcherOne from "../Switchers/SwitcherOne";
import useNetworkMode from "@/hooks/useNetworkMode";
import { NetworkMode } from "@/types/web3";
import SwitcherTwo from "../Switchers/SwitcherTwo";

const NetworkModeSwitcher = () => {
  const [networkMode, setNetworkMode] = useNetworkMode();

  const onNetworkChange = (network: NetworkMode) => {
    setNetworkMode(network);
    window.location.reload();
  };

  return (
    <li className="flex items-center gap-2">
      <SwitcherOne
        isEnable={networkMode === "testnet" ? true : false}
        onEnable={() => onNetworkChange("testnet")}
        onDisable={() => onNetworkChange("mainnet")}
      />
    </li>
  );
};

export default NetworkModeSwitcher;

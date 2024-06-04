"use Client";
import useLocalStorage from "./useLocalStorage";

export type NetworkMode = "testnet" | "mainnet";

const useNetworkMode = (): [NetworkMode, (mode: NetworkMode) => void] => {
  const [networkMode, setNetworkMode] = useLocalStorage<NetworkMode>(
    "network-mode",
    "mainnet",
  );

  return [networkMode, setNetworkMode];
};

export default useNetworkMode;

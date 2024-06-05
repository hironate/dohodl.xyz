import useNetworkMode from "@/hooks/useNetworkMode";
import { getDefaultChainID } from "@/utils/chains";
import React, { useCallback, useMemo, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";

const ChainButton = ({
  title,
  onClick,
  chainId,
  disabled = false,
  isLoading = false,
  buttonType,
}: {
  title: string;
  onClick?: () => void;
  chainId?: number;
  disabled?: boolean;
  isLoading?: boolean;
  buttonType?: "reset" | "button" | "submit";
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const currentChainId = useMemo(() => chain?.id, [chain]);
  const [networkMode] = useNetworkMode();

  const handleSwitchChain = useCallback(async () => {
    if (currentChainId === chainId) return;
    const chain_id =
      currentChainId && chainId
        ? chainId
        : getDefaultChainID(networkMode === "testnet");

    await switchChainAsync({
      chainId: chain_id,
    });
  }, [chainId, currentChainId, networkMode, switchChainAsync]);

  const handleClick = useCallback(async () => {
    if (chainId !== currentChainId) await handleSwitchChain();
    setIsProcessing(true);
    await onClick?.();
    setIsProcessing(false);
  }, [chainId, currentChainId, handleSwitchChain, onClick]);

  return (
    <button
      className="flex w-full justify-center rounded-lg bg-primary-neon py-3 text-center text-white disabled:cursor-not-allowed"
      onClick={handleClick}
      disabled={disabled}
      type={buttonType}
    >
      {isProcessing || isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"></div>
      ) : (
        <span>{title}</span>
      )}
    </button>
  );
};
export default ChainButton;

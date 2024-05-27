import React, { useCallback, useEffect, useState } from "react";
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
  const { chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const handleSwitchChain = useCallback(async () => {
    if (chainId === currentChainId || !chainId) return;
    else await switchChainAsync({ chainId });
  }, [chainId, currentChainId, switchChainAsync]);

  const handleClick = useCallback(async () => {
    if (chainId) await handleSwitchChain();
    setIsProcessing(true);
    await onClick?.();
    setIsProcessing(false);
  }, [chainId, handleSwitchChain, onClick]);

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

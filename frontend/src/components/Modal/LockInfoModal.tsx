import useColorMode from "@/hooks/useColorMode";
import useNetworkMode from "@/hooks/useNetworkMode";
import { Withdraw } from "@/utils/hodl";
import { Close } from "@mui/icons-material";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import { useConfig } from "wagmi";
import ChainButton from "../Button/ChainButton";
import {
  CHAIN_ID_TO_EXPLORER_BASE_URI,
  getChainIdByChainName,
} from "@/utils/constant";
import ChainLogo from "../ChainTracker/ChainLogo";
import useUserLocks from "@/hooks/useUserLocks";

const LockInfoModal = ({
  isOpen = false,
  lock,
  onClose,
}: {
  isOpen?: boolean;
  lock: any;
  onClose: () => void;
}) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [isProccessingWithdraw, setWithdrawProcess] = useState(false);

  const [colorMode] = useColorMode();
  const [networkMode] = useNetworkMode();

  const { refetchAllLocks } = useUserLocks();

  const chainId = getChainIdByChainName(
    lock?.chainName,
    networkMode === "testnet",
  );

  const config = useConfig();

  const customStyles: Modal.Styles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      zIndex: 20,
      backgroundColor: colorMode === "dark" ? "#24303F" : "white",
      color: colorMode === "dark" ? "white" : "black",
      border: "0px",
      borderRadius: "8px",
      padding: "10px",
    },
    overlay: {
      zIndex: 10000,
      backdropFilter: "transperent",
      backgroundColor: colorMode === "light" ? "#1d1d1db0" : "#ffffff1c",
    },
  };

  useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen]);

  function closeModal() {
    setIsOpen(false);
    onClose();
  }

  const depositId = useMemo(() => {
    return lock?.id.split("_")[0];
  }, [lock]);

  const unlockTime = Number(lock?.unlockTime) * 1000;
  const isAvailableForWithrawal =
    !lock?.withdrawn && new Date().getTime() > unlockTime;

  const onWithdraw = async () => {
    setWithdrawProcess(true);
    const isToken = !!lock.tokenAddress;
    try {
      await Withdraw(depositId, config, isToken);
      await refetchAllLocks();
    } catch (error) {
      console.log(error);
    }
    closeModal();
    setWithdrawProcess(false);
  };

  return (
    <div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        className=""
        contentLabel="Example Modal"
      >
        <div className="flex w-full  flex-col gap-5 p-3 md:w-125">
          <div className="flex  justify-between">
            <span className="text-lg font-semibold text-primary">
              Lock Info
            </span>
            <button
              onClick={closeModal}
              className="text-bodydark hover:text-body dark:hover:text-white"
            >
              <Close />
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-hidden px-4 text-body dark:text-bodydark">
            <div className="flex gap-3">
              <span>Hodl Id</span> :<span>{depositId}</span>
            </div>
            <div className="flex gap-3">
              <span>Hodl Date</span> :
              <span>
                {moment(new Date(Number(lock?.lockedTime) * 1000)).format("ll")}
              </span>
            </div>
            <div className="flex gap-3">
              <span>Upto</span> :
              <span>
                {moment(new Date(Number(lock?.unlockTime) * 1000)).format("ll")}
              </span>
            </div>
            <div className="flex gap-3">
              <span>Amount</span> :
              <span>
                {lock?.amount} <span>{lock.currencySymbol || "ETH"}</span>
              </span>
            </div>
            <div className="flex gap-3">
              <span>Chain</span> :{" "}
              <span className="flex items-center gap-2">
                {lock.chainName}{" "}
                <ChainLogo
                  chainName={lock.chainName.toLowerCase()}
                  width={20}
                  height={16}
                />
              </span>
            </div>
            {isAvailableForWithrawal && (
              <div className="flex gap-3">
                <span>Txn</span> :
                <a
                  className="text-primary underline"
                  href={`${getTransactionLinkByChainId(chainId, lock.transactionHash)}`}
                  target="_blank"
                >
                  Link
                </a>
              </div>
            )}
            <div className="w-full">
              <ChainButton
                title={isAvailableForWithrawal ? "Withdraw" : "View Txn"}
                onClick={() => {
                  isAvailableForWithrawal
                    ? onWithdraw()
                    : window.open(
                        `${getTransactionLinkByChainId(chainId, lock.transactionHash)}`,
                        "_blank",
                      );
                }}
                isLoading={isProccessingWithdraw}
                chainId={isAvailableForWithrawal ? chainId : undefined}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LockInfoModal;

const getTransactionLinkByChainId = (
  chainId: number,
  transactionHash: string,
) => `${CHAIN_ID_TO_EXPLORER_BASE_URI[chainId]}/tx/${transactionHash}`;

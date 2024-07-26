import ChainButton from "@/components/Button/ChainButton";
import useToken from "@/hooks/useToken";
import {
  formatAmount,
  formateValueToIndianNumberingSystem,
} from "@/utils/ethers";
import { InitialsPresaleTokenDetails } from "@/utils/presale";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const Step1 = ({
  onNext = () => {},
  initialTokenAddress = "",
  tokenDetails = InitialsPresaleTokenDetails,
  setTokenAddress = (tokenAddress: string) => {},
}) => {
  const formatedBalance = useMemo(
    () =>
      tokenDetails.decimals
        ? formatAmount({
            amount: tokenDetails.userBalance,
            decimals: tokenDetails.decimals,
            returnType: "number",
            fixed: 2,
          })
        : tokenDetails.userBalance,
    [tokenDetails.decimals, tokenDetails.userBalance],
  );

  return (
    <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark 2xl:w-3/4 3xl:w-2/3">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h2 className="font-bold text-black dark:text-white">Presale</h2>
      </div>
      <div className="flex h-full flex-col gap-5 p-6.5">
        <div className="mb-4.5">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Token Address
          </label>
          <input
            type="text"
            value={initialTokenAddress}
            name="tokenAddress"
            placeholder="Enter your token contract address"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            onChange={(e) => {
              setTokenAddress(e.target.value);
            }}
          />
        </div>
        <div className="mb-4.5 flex flex-col gap-3 p-2">
          <div className="flex border-spacing-1 justify-between border-b border-dashed py-2 ">
            <span>Name</span>
            <span className="font-medium text-black dark:text-white">
              {tokenDetails.name ?? ""}
            </span>
          </div>
          <div className="flex border-spacing-1 justify-between border-b border-dashed py-2 ">
            <span>Symbol</span>
            <span className="font-medium text-black dark:text-white">
              {tokenDetails.symbol ?? ""}
            </span>
          </div>
          <div className="flex border-spacing-1 justify-between border-b border-dashed py-2 ">
            <span>Decimals</span>
            <span className="font-medium text-black dark:text-white">
              {tokenDetails.decimals ?? ""}
            </span>
          </div>
          <div className="flex border-spacing-1 justify-between border-b border-dashed py-2 ">
            <span>Total Supply</span>
            <span className="text-lg font-medium text-black dark:text-white ">
              {formateValueToIndianNumberingSystem(tokenDetails.totalSupply) ??
                ""}
            </span>
          </div>
          <div className="flex border-spacing-1 justify-between border-b border-dashed py-2 ">
            <span>Your Balance</span>
            <span className="text-lg font-medium text-black dark:text-white ">
              {formateValueToIndianNumberingSystem(formatedBalance) ?? ""}
            </span>
          </div>
        </div>
        <div className="flex w-full items-center justify-end ">
          <button
            className="flex w-24 justify-center rounded-lg bg-primary py-2 text-center text-white hover:bg-primary-neon disabled:cursor-not-allowed"
            onClick={onNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1;

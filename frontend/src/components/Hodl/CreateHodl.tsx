import React, { useCallback, useMemo, useState } from "react";
import TokenToggle from "../TokenToggle";
import { Config, useAccount, useBalance, useConfig } from "wagmi";
import DatePicker from "../DatePicker";
import SelectGroupTwo from "../SelectGroup/SelectGroupTwo";
import { DURATIONS } from "@/utils/constant";
import moment from "moment";
import { formatAmount, parseAmount } from "@/utils/ethers";
import { getHodlContract } from "@/utils/contract";
import { Formik } from "formik";
import useToken from "@/hooks/useToken";
import { toShortString } from "@/utils/String";
import { generateTost } from "@/utils";
import flatpickr from "flatpickr";
import ChainButton from "../Button/ChainButton";
import useNetworkMode from "@/hooks/useNetworkMode";
import { getDefaultChainID } from "@/utils/chains";

const initialValues = {
  tokenAddress: "",
  lockAmount: "",
  date: new Date(),
  durationAmount: "",
  duration: 1,
};

const CreateHodl = ({ onHodl }: { onHodl?: () => Promise<void> }) => {
  const [isNativeSelected, setIsNativeSelected] = useState(true);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [isCreatingHodl, setIsCreatingHodl] = useState(false);
  const [networkMode] = useNetworkMode();
  const { isConnected, address, chainId } = useAccount();
  const { data: NativeBalance, refetch: refetchNativeBalance } = useBalance({
    address,
  });
  const config = useConfig();
  const {
    balance: tokenBalance,
    checkOrSetAllowance,
    symbol: tokenSymbol,
    refetBalance: refetchTokenBalance,
  } = useToken(tokenAddress);

  const balance = useMemo(() => {
    const balance = isNativeSelected
      ? NativeBalance
        ? formatAmount({ amount: NativeBalance?.value })
        : ""
      : tokenBalance.formatedBalance;
    return balance;
  }, [isNativeSelected, NativeBalance, tokenBalance.formatedBalance]);

  const symbol = useMemo(
    () =>
      isNativeSelected
        ? NativeBalance
          ? NativeBalance.symbol
          : "ETH"
        : tokenSymbol,
    [NativeBalance, isNativeSelected, tokenSymbol],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const create_hodl_succesor_process = async (success_message: string) => {
    generateTost({ message: success_message, toastType: "success" });

    // reseting all states
    setIsCreatingHodl(false);

    await onHodl?.();
    await refetchNativeBalance();
    await refetchTokenBalance();
  };

  const hodl_creation_failure_process = (err: any) => {
    if (err.message.includes("User rejected the request"))
      generateTost({
        message: "User rejected the request",
        toastType: "error",
      });
    else {
      generateTost({ message: err.message, toastType: "error" });
      console.log(err);
    }
    setIsCreatingHodl(false);
  };

  const onSubmit = useCallback(
    async ({
      tokenAddress,
      lockAmount,
      date,
      durationDate,
    }: {
      tokenAddress?: string;
      lockAmount: string;
      date?: Date;
      durationDate?: Date;
    }) => {
      setIsCreatingHodl(true);
      if (!isNativeSelected) {
        try {
          await checkOrSetAllowance(lockAmount);
        } catch (err: any) {
          hodl_creation_failure_process(err);
          return;
        }

        lockAmount = parseAmount({
          amount: lockAmount,
          decimals: tokenBalance.decimals,
        }).toString();
      }

      const duration = Math.floor(
        moment(date && date > new Date() ? date : durationDate).diff(moment()) /
          1000,
      );

      const contract = getHodlContract({
        config,
        isErc20: !isNativeSelected,
        chainId,
      });
      try {
        await contract.deposit({
          duration,
          lockAmount: lockAmount.toString(),
          tokenAddress,
        });
        await create_hodl_succesor_process(
          `Lock created for ${lockAmount} ${symbol}`,
        );
      } catch (error: any) {
        hodl_creation_failure_process(error);
        return;
      }
    },
    [
      isNativeSelected,
      config,
      chainId,
      tokenBalance.decimals,
      checkOrSetAllowance,
      create_hodl_succesor_process,
      symbol,
    ],
  );

  return (
    <Formik
      initialValues={initialValues}
      validate={(values) => {
        let errors = { lockAmount: "", tokenAddress: "" };
        if (values.lockAmount > balance)
          errors.lockAmount = "Insufficeint Balance";

        return errors;
      }}
      onSubmit={() => {}}
    >
      {({ values, setValues, handleChange, resetForm, errors }) => (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-bold text-black dark:text-white">Hodl</h3>
          </div>
          <div className="flex h-full flex-col gap-5 p-6.5">
            <TokenToggle
              onSelect={(mode: string) => {
                mode === "Native"
                  ? setIsNativeSelected(true)
                  : setIsNativeSelected(false);
                resetForm();
              }}
            />

            {!isNativeSelected && (
              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Token Address
                </label>
                <input
                  type="text"
                  name="tokenAddress"
                  placeholder="Enter your token contract address"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={values.tokenAddress}
                  onChange={(e) => {
                    setValues((prev) => ({
                      ...prev,
                      tokenAddress: e.target.value,
                    }));
                    setTokenAddress(e.target.value);
                  }}
                />
              </div>
            )}

            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Lock Amount
              </label>
              <div
                className="flex w-full flex-col items-center justify-between gap-2 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition dark:border-form-strokedark dark:bg-form-input dark:text-white md:flex-row
      md:gap-0"
              >
                <input
                  placeholder="0.0"
                  type="number"
                  name="lockAmount"
                  className="w-full border-none bg-transparent text-lg outline-none md:h-2/3 md:w-2/3 md:pl-2 lg:text-xl 2xl:w-2/3"
                  value={values.lockAmount}
                  onChange={handleChange}
                />
                <div className="z-1 flex w-full flex-row items-center justify-between gap-2 md:w-fit md:flex-col md:items-end">
                  <div className="flex gap-1 text-sm">
                    <span>balance:</span>
                    {balance ? (
                      <>
                        <span>{toShortString(balance.toString())}</span>
                        {symbol && (
                          <span className="ml-1  font-semibold text-body dark:text-bodydark">
                            {symbol}
                          </span>
                        )}
                      </>
                    ) : (
                      <>0</>
                    )}
                  </div>
                  <div>
                    <button
                      className="appearance-none rounded-md bg-body px-2 py-[2px] text-white hover:bg-opacity-90"
                      onClick={() => {
                        setValues((prev) => ({
                          ...prev,
                          lockAmount: Number(balance).toFixed(2),
                        }));
                      }}
                    >
                      Max
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex flex-col items-center justify-between  md:flex-row md:gap-4 xl:flex-col xl:gap-0 2xl:flex-row
      2xl:gap-4"
            >
              <div className="w-full md:w-1/2 xl:w-full 2xl:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Duration
                </label>
                <div className="flex w-full items-center justify-between gap-2 rounded border-[1.5px] border-stroke bg-transparent px-2 py-2  text-black outline-none transition dark:border-form-strokedark dark:bg-form-input dark:text-white md:flex-row md:gap-0 ">
                  <input
                    placeholder="Duration"
                    name="durationAmount"
                    type="number"
                    pattern="^\d+$"
                    className="w-full border-none bg-transparent pl-2 text-base outline-none md:h-2/3 md:w-2/3 md:text-lg"
                    value={values.durationAmount}
                    onChange={(e) => {
                      const pattern = /^\d+$/;
                      const value = e.target.value;
                      if (pattern.test(value))
                        setValues((prev) => ({
                          ...prev,
                          durationAmount: e.target.value,
                        }));
                    }}
                  />
                  <SelectGroupTwo
                    label=""
                    className="w-1/2 cursor-pointer"
                    options={["Day", ...DURATIONS]}
                    placeHolder="Duration"
                    onSelect={(duration) => {
                      setValues((prev) => ({ ...prev, duration }));
                    }}
                  />
                </div>
              </div>
              <div className="text-center md:pt-8 lg:p-0 2xl:pt-8">OR</div>
              <DatePicker
                label="Pick a Date"
                className="w-full md:w-1/2 xl:w-full 2xl:w-1/2"
                onSelect={(date: Date) => {
                  if (date)
                    setValues((prev) => ({
                      ...prev,
                      date,
                      durationAmount: "",
                    }));
                }}
                clearDate={values.durationAmount ? true : false}
              />
            </div>

            <ChainButton
              chainId={chainId || getDefaultChainID(networkMode === "testnet")}
              disabled={
                !isConnected ||
                balance < values.lockAmount ||
                !!errors.lockAmount ||
                isCreatingHodl ||
                !values.lockAmount ||
                (!values.durationAmount && values.date < new Date())
              }
              onClick={async () => {
                const durationDate = moment()
                  .add({ day: Number(values.durationAmount) * values.duration })
                  .toDate();
                await onSubmit({
                  tokenAddress: values.tokenAddress,
                  lockAmount: values.lockAmount,
                  date: values.date,
                  durationDate,
                });
                resetForm();
              }}
              title={
                isConnected
                  ? balance < values.lockAmount
                    ? "Insufficient Balance"
                    : "Create Hodl"
                  : "Connect Wallet"
              }
              isLoading={isCreatingHodl}
              buttonType="submit"
            />
          </div>
        </div>
      )}
    </Formik>
  );
};

export default CreateHodl;

type CreateHodl = {
  config: Config;
  lockAmount: string;
  durationDate: Date;
  tokenAddress?: `0x${string}`;
  isErc20?: boolean;
};

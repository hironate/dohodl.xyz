// import DatePicker from "@/components/DatePicker";
import { parseAmount } from "@/utils/ethers";
import {
  InitialsPresaleTokenDetails,
  calculateRequiredTokens,
  initialPresaleDetails as InitialPresaleDetails,
} from "@/utils/presale";
import { parseEther, toBigInt } from "ethers";
import { Formik } from "formik";
import React from "react";
import { useAccount } from "wagmi";
import Datepicker from "react-tailwindcss-datepicker";
import moment from "moment";

const Step2 = ({
  onNext = (details: typeof InitialPresaleDetails) => {},
  tokenDetails = InitialsPresaleTokenDetails,
  initialPresaleDetails = InitialPresaleDetails,
}) => {
  const { chain } = useAccount();

  const getRequiredTokens = (values: typeof InitialPresaleDetails) => {
    const { hardCap, liquidityPercentage, liquidityRate, presaleRate } = values;
    const requiredTokenAmount = calculateRequiredTokens({
      hardCap,
      liquidityPercentage,
      liquidityRate: parseAmount({
        amount: liquidityRate,
        decimals: tokenDetails.decimals,
      }),
      presaleRate: parseAmount({
        amount: presaleRate,
        decimals: tokenDetails.decimals,
      }),
    });

    return requiredTokenAmount.split(".")[0];
  };

  const validateValues = (values: any) => {
    const {
      presaleDuration,
      hardCap,
      liquidityPercentage,
      liquidityRate,
      maximumBuy,
      minimumBuy,
      presaleRate,
      softCap,
      startTime,
    } = values;

    let errors = {
      startTime: "",
      duration: "",
      softCap: "",
      minimumBuy: "",
      presaleRate: "",
      liquidityPercentage: "",
    };

    if (startTime && new Date(startTime).getSeconds() > new Date().getSeconds())
      errors.startTime = "Start Time must be in the future";
    else if (presaleDuration && presaleDuration < 24 * 60 * 60)
      errors.duration = "Atleast 1 day is require for presale to end";

    if (
      liquidityPercentage &&
      (Number(liquidityPercentage) < 51 || Number(liquidityPercentage) > 100)
    )
      errors.liquidityPercentage =
        "minimum requirement for raised fund for liquidity is 51 and higher is 100";

    if (
      (hardCap &&
        softCap &&
        parseEther(softCap.toString()) <
          (parseEther(hardCap.toString()) * BigInt(25)) / toBigInt(100)) ||
      softCap >= hardCap
    )
      errors.softCap =
        "soft cap must be less than hardcap and higher than 25% of hardcap ";
    if (minimumBuy && maximumBuy && minimumBuy >= maximumBuy)
      errors.minimumBuy = "Minimum buy should be less then maximum buy";
    if (
      presaleRate &&
      liquidityPercentage &&
      liquidityRate &&
      hardCap &&
      tokenDetails.decimals
    ) {
      const totalTokenRequired = getRequiredTokens(values);

      toBigInt(totalTokenRequired) > toBigInt(tokenDetails.userBalance)
        ? (errors.presaleRate = `insufficient user balance, required token for the presale is ${totalTokenRequired.toString()} and the available balance is ${tokenDetails.userBalance}`)
        : undefined;
    }
    console.log({ errors });

    return errors;
  };

  const handleSubmit = (values: typeof InitialPresaleDetails) => {
    onNext(values);
  };

  return (
    <div className="presale-info-form  w-full 2xl:w-3/4 3xl:w-2/3">
      <Formik
        initialValues={initialPresaleDetails}
        validate={validateValues}
        onSubmit={(values) => {}}
      >
        {({ values, setValues, handleChange, errors }) => (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="text-lg font-bold text-black dark:text-white">
                Presale
              </h3>
            </div>
            <div className="flex h-full flex-col gap-5 p-6.5">
              <div className="mb-4.5 flex gap-5 ">
                <div className="w-1/2">
                  <label className="mb-3 block text-sm font-semibold text-black dark:text-white">
                    Presale Rate
                  </label>
                  <input
                    type="number"
                    name="presaleRate"
                    placeholder="10000"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={values.presaleRate}
                    onChange={handleChange}
                  />
                  <p className="mt-2 pl-2 text-xs sm:text-sm">
                    1 {chain?.nativeCurrency.symbol} = ? {tokenDetails?.symbol}
                  </p>
                  <p className="pl-2 text-xs sm:text-sm ">
                    If I spend 1 {chain?.nativeCurrency.symbol} on how many
                    tokens the investor will receive?
                  </p>
                </div>
                <div className="w-1/2">
                  <label className="mb-3 block text-sm font-semibold text-black dark:text-white">
                    Liquidty Rate
                  </label>
                  <input
                    type="number"
                    name="liquidityRate"
                    placeholder="7000"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={values.liquidityRate}
                    onChange={handleChange}
                  />
                  <p className="mt-2 pl-2 text-xs sm:text-sm">
                    1 {chain?.nativeCurrency.symbol} = ? {tokenDetails.symbol}
                  </p>
                  <p className="pl-2 text-xs sm:text-sm ">
                    If I spend 1 {chain?.nativeCurrency.symbol} on how many
                    tokens the liquidty pool trader will receive?
                  </p>
                </div>
              </div>

              <div className="mb-6 flex gap-5">
                <div className="w-1/2">
                  <label className="mb-3 block text-sm font-semibold text-black dark:text-white">
                    Soft Cap
                  </label>
                  <input
                    type="number"
                    name="softCap"
                    placeholder="0.1"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={values.softCap}
                    onChange={handleChange}
                  />
                  {errors.softCap && (
                    <p>
                      <span>*</span>
                      <span>{errors.softCap}</span>
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="mb-3 block text-sm font-semibold text-black dark:text-white">
                    Hard Cap
                  </label>
                  <input
                    type="number"
                    name="hardCap"
                    placeholder="0.3"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={values.hardCap}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-6 flex gap-5">
                <div className="w-1/3">
                  <label className="mb-3 block text-sm font-semibold text-black dark:text-white">
                    Minimum Buy
                  </label>
                  <input
                    type="number"
                    name="minimumBuy"
                    placeholder="0.05"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={values.minimumBuy}
                    onChange={handleChange}
                  />
                  {errors.minimumBuy && (
                    <div>
                      <p>{errors.minimumBuy}</p>
                    </div>
                  )}
                </div>
                <div className="w-1/3">
                  <label className="mb-3 block text-sm font-semibold text-black dark:text-white">
                    Maximum Buy
                  </label>
                  <input
                    type="number"
                    name="maximumBuy"
                    placeholder="0.1"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={values.maximumBuy}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-1/3">
                  <label className="mb-3 block text-sm font-semibold text-black dark:text-white">
                    Liquidity Percentage
                  </label>
                  <input
                    type="number"
                    name="liquidityPercentage"
                    placeholder="51"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={values.liquidityPercentage}
                    onChange={handleChange}
                  />
                  {errors.liquidityPercentage && (
                    <p className="w-full text-left text-red">
                      <span>*</span>
                      <span>{errors.liquidityPercentage}</span>
                    </p>
                  )}
                  <p className="pl-2 text-xs sm:text-sm ">
                    <span>*</span> percentage of raised fund will be added as a
                    liquidity (minimum requirement for raised fund for liquidity
                    is 50)
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col items-center justify-between  md:flex-row md:gap-4 xl:flex-col xl:gap-0 2xl:flex-row 2xl:gap-4">
                <Datepicker
                  containerClassName={
                    "relative mt-8 w-full !text-lg date-picker-container"
                  }
                  toggleClassName="absolute bg-primary dark:text-bodydark1 rounded-r-lg right-0 h-full px-3 text-gray-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                  startFrom={new Date()}
                  value={{
                    startDate: values.startTime,
                    endDate: moment(values.startTime)
                      .add({
                        seconds: values.presaleDuration,
                      })
                      .toDate(),
                  }}
                  onChange={(values) => {
                    if (values?.startDate && values?.endDate) {
                      setValues((prev) => ({
                        ...prev,
                        startTime: new Date(values.startDate as string | Date),
                        presaleDuration:
                          moment(values.endDate as Date).diff(
                            values.startDate,
                          ) / 1000,
                      }));
                    }
                  }}
                  // disabledDates=
                  popoverDirection="up"
                  minDate={new Date()}
                  primaryColor="blue"
                  separator="to"
                  placeholder="Choose your presale duration"
                  displayFormat="DD/MM/YYYY"
                />
              </div>

              {errors.presaleRate && (
                <p className="w-full text-left text-red">
                  <span>*</span>
                  <span>{errors.presaleRate}</span>
                </p>
              )}

              <div className="mb-2 mt-6 flex w-full items-center justify-end gap-5">
                <button
                  className="flex w-24 justify-center rounded-lg bg-primary py-2 text-center text-white hover:bg-primary-neon disabled:cursor-not-allowed"
                  onClick={() => handleSubmit(values)}
                  disabled={
                    !!errors.hardCap ||
                    !!errors.liquidityPercentage ||
                    !!errors.presaleRate ||
                    !!errors.minimumBuy ||
                    !!errors.presaleDuration ||
                    !!errors.startTime
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default Step2;

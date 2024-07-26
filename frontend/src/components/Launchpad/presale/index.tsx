"use client";
import { Step, StepLabel, Stepper } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import Step1 from "./presale-steps/Step1";
import Step2 from "./presale-steps/Step2";
import {
  InitialsPresaleTokenDetails,
  PresaleContract,
  calculateRequiredTokens,
  initialPresaleDetails,
} from "@/utils/presale";
import PresaleOverview from "./presale-steps/PresaleOverview";
import { useAccount, useConfig } from "wagmi";
import { TokenContract } from "@/utils/contractService";
import { PresaleContractAddress } from "@/utils/contract";
import useToken from "@/hooks/useToken";
import { formatAmount, parseAmount } from "@/utils/ethers";

const Presale = () => {
  enum STEP {
    step1,
    step2,
    step3,
  }
  const Steps = [
    "Add Token",
    "Add Presale Details",
    "Confirm Finalized Presale",
  ];

  const { chain } = useAccount();
  const [tokenAddress, setPresaleTokenAddress] = useState("");
  const config = useConfig();

  const {
    allowance,
    balance,
    name,
    symbol,
    decimals,
    totalSupply,
    checkOrSetAllowance,
  } = useToken(tokenAddress, PresaleContractAddress);

  const tokenDetails = useMemo<typeof InitialsPresaleTokenDetails>(() => {
    return totalSupply
      ? {
          decimals,
          name,
          symbol,
          totalSupply: formatAmount({
            amount: totalSupply,
            decimals,
            fixed: 0,
            returnType: "number",
          }).toString(),
          userBalance: balance.balance,
          address: tokenAddress,
        }
      : InitialsPresaleTokenDetails;
  }, [balance.formatedBalance, decimals, symbol, totalSupply, name]);

  const [presaleDetails, setPresaleDetails] = useState(initialPresaleDetails);
  const [currentStep, setCurrentStep] = useState(Steps[STEP.step1]);
  const [completedSteps, setCompletedSteps] = React.useState<{
    [k: number]: boolean;
  }>({ 0: true });

  const handleStep1OnNext = () => {
    setCompletedSteps({ [STEP.step1]: true });
    setCurrentStep(Steps[STEP.step2]);
  };

  const handleStep2OnNext = (presaleDetails: typeof initialPresaleDetails) => {
    setCompletedSteps({ [STEP.step2]: true });
    setCurrentStep(Steps[STEP.step3]);
    setPresaleDetails(presaleDetails);
  };

  const handleBack = () => {
    if (currentStep === Steps[STEP.step2]) {
      setCompletedSteps((prev) => ({ ...prev, [STEP.step2]: false }));
      setCurrentStep(Steps[STEP.step1]);
    } else if (currentStep === Steps[STEP.step3]) {
      setCompletedSteps((prev) => ({ ...prev, [STEP.step3]: false }));
      setCurrentStep(Steps[STEP.step2]);
    }
  };

  const handleConfirmation = useCallback(async () => {
    const {
      liquidityPercentage,
      liquidityRate,
      presaleRate,
      hardCap,
      maximumBuy,
      minimumBuy,
      presaleDuration,
      softCap,
      startTime,
    } = presaleDetails;

    const parsedPresaleRate = parseAmount({
      amount: presaleRate,
      decimals: tokenDetails.decimals,
    });

    const parsedLiquidityRate = parseAmount({
      amount: liquidityRate,
      decimals: tokenDetails.decimals,
    });
    const requiredTokenToCreatePresale = calculateRequiredTokens({
      liquidityPercentage,
      liquidityRate: parsedLiquidityRate,
      presaleRate: parsedPresaleRate,
      hardCap,
    });

    const createPresaleArgs = {
      tokenAddress,
      minBuy: minimumBuy,
      maxBuy: maximumBuy,
      presaleRate: parsedPresaleRate,
      softCap,
      hardCap,
      liquidityRate: parsedLiquidityRate,
      liquidityPercentage,
      startTime,
      duration: presaleDuration,
      tokenMaxCap: requiredTokenToCreatePresale,
    };

    // console.log(requiredTokenToCreatePresale);

    try {
      await checkOrSetAllowance(requiredTokenToCreatePresale, true);
      PresaleContract(PresaleContractAddress, config).create(createPresaleArgs);
    } catch (error) {
      console.log(error);
    }
  }, [
    allowance,
    presaleDetails,
    checkOrSetAllowance,
    config,
    tokenDetails.decimals,
  ]);

  return (
    <section>
      <section className="custom-stepper">
        <Stepper activeStep={1} alternativeLabel>
          {Steps.map((step, index) => (
            <Step
              key={step}
              active={step === currentStep}
              completed={completedSteps[index]}
            >
              <StepLabel>
                <div className="dark:text-bodydark1">{step}</div>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </section>
      <section className="mt-8 flex flex-col items-center justify-center">
        {currentStep === Steps[STEP.step1] && (
          <Step1
            onNext={handleStep1OnNext}
            initialTokenAddress={tokenAddress}
            tokenDetails={tokenDetails}
            setTokenAddress={setPresaleTokenAddress}
          />
        )}
        {currentStep === Steps[STEP.step2] && (
          <Step2
            onNext={handleStep2OnNext}
            tokenDetails={tokenDetails}
            initialPresaleDetails={presaleDetails}
          />
        )}

        {currentStep === Steps[STEP.step3] && (
          <section className="w-full rounded-sm border border-stroke bg-white p-1 pb-3 shadow-default dark:border-strokedark dark:bg-boxdark 2xl:w-3/4 3xl:w-2/3">
            <section className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h2 className="font-bold text-black dark:text-white">
                Presale Overview
              </h2>
            </section>
            <section className="w-full py-4">
              <PresaleOverview
                details={{
                  presaleDetails: presaleDetails,
                  tokenDetails: tokenDetails,
                  nativeCurrencySymbol: chain?.nativeCurrency.symbol || "ETH",
                }}
              />
              <div className=" flex w-full items-center justify-end  px-6.5">
                <button
                  className="flex w-24 justify-center rounded-lg bg-primary py-2 text-center text-white hover:bg-primary-neon disabled:cursor-not-allowed"
                  onClick={handleConfirmation}
                >
                  Confirm
                </button>
              </div>
            </section>
          </section>
        )}
        {/* Go back button */}
        {currentStep !== Steps[STEP.step1] && (
          <button
            type="button"
            className="text-gray-700 dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200  mb-2 flex w-full items-center justify-end gap-x-2 rounded-lg py-2 text-sm transition-colors duration-200 sm:w-auto"
            onClick={handleBack}
          >
            <svg
              className="h-5 w-5 rtl:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
              />
            </svg>
            <span>Go back</span>
          </button>
        )}
      </section>
    </section>
  );
};

export default Presale;

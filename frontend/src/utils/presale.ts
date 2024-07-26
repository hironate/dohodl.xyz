import { formatEther, parseEther, toBigInt } from "ethers";
import { Config } from "wagmi";
import { Contract } from "./contractService";
import { getContractAbi } from "./contract";
import { BigNumberish } from "ethers";
import { formatAmount } from "./ethers";

export const InitialsPresaleTokenDetails = {
  name: "",
  address: "",
  symbol: "",
  decimals: "",
  totalSupply: "",
  userBalance: "",
};

export const initialPresaleDetails = {
  presaleRate: 10000,
  liquidityRate: 8000,
  softCap: 0.8,
  hardCap: 1,
  maximumBuy: 0.5,
  minimumBuy: 0.2,
  liquidityPercentage: 51,
  startTime: new Date(),
  presaleDuration: 24 * 60 * 60,
};

export type validateInputType = {
  presaleRate: BigNumberish;
  hardCap: string | number;
  liquidityPercentage: number | string;
  liquidityRate: BigNumberish;
};

export const BPS = toBigInt(10000);

export const calculateRequiredTokens = ({
  presaleRate,
  hardCap,
  liquidityPercentage,
  liquidityRate,
}: validateInputType) => {
  const hardcapInWei = parseEther(hardCap.toString());
  const liquidityTokenAmount =
    (toBigInt(liquidityRate) * toBigInt(Number(liquidityPercentage) * 100)) /
    BPS;
  const tokenMaxCap =
    (liquidityTokenAmount + toBigInt(presaleRate)) * hardcapInWei;

  return formatEther(tokenMaxCap).split(".")[0];
};

type CreatePresaleType = {
  tokenAddress: string;
  minBuy: string | number;
  maxBuy: string | number;
  presaleRate: BigNumberish;
  softCap: string | number;
  hardCap: string | number;
  liquidityRate: BigNumberish;
  liquidityPercentage: string | number;
  startTime: Date | string;
  duration: string | number;
  tokenMaxCap?: string;
};

export const PresaleContract = (
  address: `0x${string}` | string,
  config: Config | any,
  chainId?: number,
) => {
  const contract = Contract(
    address,
    getContractAbi("Launchpad"),
    config,
    chainId,
  );

  console.log({ abi: getContractAbi("Launchpad") });

  const create = async ({
    duration,
    hardCap,
    liquidityPercentage,
    liquidityRate,
    maxBuy,
    minBuy,
    presaleRate,
    softCap,
    startTime,
    tokenAddress,
    tokenMaxCap,
  }: CreatePresaleType) => {
    const hardcapInWei = parseEther(hardCap.toString());
    const liquidityPercentEth = toBigInt(liquidityPercentage) * toBigInt(100);
    console.log({
      liquidityPercentEth,
      liquidityPercentage,
      hardcapInWei,
      liquidityRate,
    });

    const liquidityTokenAmount =
      (toBigInt(liquidityRate) * liquidityPercentEth * hardcapInWei) / BPS;

    if (!tokenMaxCap)
      tokenMaxCap = calculateRequiredTokens({
        presaleRate,
        hardCap,
        liquidityPercentage,
        liquidityRate,
      });

    console.log({ liquidityTokenAmount, hardcapInWei, tokenMaxCap });

    const liquidityPercentToken =
      (liquidityTokenAmount * BPS) / (toBigInt(tokenMaxCap) * parseEther("1"));

    const ListPresaleArgs = {
      tokenAddress,
      minInvestment: parseEther(minBuy.toString()),
      maxInvestment: parseEther(maxBuy.toString()),
      maxCap: toBigInt(tokenMaxCap),
      softCap: parseEther(softCap.toString()),
      hardCap: hardcapInWei,
      liquidityPercentToken,
      liquidityPercentEth,
      startTime,
      duration,
    };

    await contract.write("listProject", Object.values(ListPresaleArgs));
  };

  return {
    getPresaleDetails: async (tokenAddress: string) =>
      contract.read("getProjectDetails", [tokenAddress]),
    create,
    ...contract,
  };
};

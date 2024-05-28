import { Config } from "wagmi";
import { getHodlContract } from "./contract";
import { generateTost } from ".";

export const Withdraw = async (
  depositId: number | string,
  config: Config,
  isErc20: boolean = false,
) => {
  const contract = getHodlContract({ config, isErc20 });

  try {
    await contract.withdraw(Number(depositId));
    generateTost({
      message: "successfully withdrawn",
      toastType: "success",
    });
  } catch (error: any) {
    if (error.message.includes("User rejected the request")) {
      generateTost({
        message: "User rejected the request",
        toastType: "error",
      });
    } else
      generateTost({
        message: error.message,
        toastType: "error",
      });
  }
};

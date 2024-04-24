import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Label } from "../../Atom/Label";
import { Select } from "../../Atom/Select";
import { Button } from "../../Atom/Button";
import { toast } from "react-toastify";
import { Input } from "../../Atom/Input";
import { ConnectWallet } from "../../Organisms/UserAccount/ConnectWallet";
import VestingHeaderData from "../VestingHeaderData";
import TokenDetails from "./TokenDetails";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import { getBalance, getDecimals, getSymbol } from '../../../infrastructure/smart-contracts/ERC20Contract'
export default function VestingInfo({
  updateTokenData,
  updateVestingData,
  updateStep,
  refreshValues,
}) {
  const walletData = useSelector((state) => state).WalletDataReducer;
  const account = walletData.currentAccount;
  const chainData = useSelector((state) => state).ChainDataReducer;
  const [tokenData, setTokenData] = useState(null);
  const [data, setData] = useState({});
  const [revocable, setRevocable] = useState(false);
  const [cliffEndDate, setCliffEndDate] = useState("...");
  const [sliceEndDate, setSliceEndDate] = useState("...");

  useEffect(() => {
    refreshValues();
  }, [account])
  const calculateStartTime = (e) => {
    let date = new Date(e.target.value);
    console.log(date);
    setData({ ...data, startDate: parseInt(date.getTime() / 1000) });
  };
  const calculateEndTime = (e) => {
    let date = new Date(e.target.value);
    setData({ ...data, endDate: parseInt(date.getTime() / 1000) });
  };
  const updateTokenAddress = async (e) => {
    let address = e.target.value;
    if (address.length == 42) {
      try {
        const symbol = await getSymbol(address);
        const decimal = await getDecimals(address);
        const tokenBalance = ethers.utils.formatUnits(await getBalance(address, walletData.currentAccount), decimal);
        setTokenData({ symbol, decimal, balance: tokenBalance, address });
      } catch (error) {
        toast.error("Invalid Token Address")
        throw new Error(error);
      }
    } else {
      setTokenData(null);
    }
  };
  const handleOnclick = () => {
    if (
      !tokenData ||
      !data ||
      !data.startDate ||
      !data.endDate ||
      data.startDate >= data.endDate ||
      !data.cliff ||
      !data.slicePeriod ||
      data.slicePeriod > data.endDate - data.startDate ||
      data.cliff > data.endDate - data.startDate
    ) {
      toast.error("invalid inputes!!!");
      return 0;
    }
    setData({ ...data, revocable: revocable });
    updateTokenData(tokenData);
    updateVestingData({ ...data, revocable: revocable });
    updateStep(true);
  };
  const calculateTimeDuration = (time, timeUnit) => {
    let timeDuration;
    switch (timeUnit) {
      case "Minute":
        timeDuration = time * 60;
        break;
      case "Hour":
        timeDuration = time * 60 * 60;
        break;
      case "Day":
        timeDuration = time * 24 * 60 * 60;
        break;
      case "Month":
        timeDuration = time * 30 * 24 * 60 * 60;
        break;
      case "Timestamp":
        timeDuration = time;
        break;

      default:
        timeDuration = 0;
        break;
    }
    return timeDuration;
  };
  const calculateCliff = () => {
    const time = document.getElementById("cliffDuration").value;
    const timeUnit = document.getElementById("timeUnit").value;
    const cliffDuration = calculateTimeDuration(time, timeUnit);
    setData({ ...data, cliff: cliffDuration });

    const cliffEndTime = Date.now() + cliffDuration * 1000;
    const cliffEnd = new Date(cliffEndTime).toDateString().slice(4);
    setCliffEndDate(cliffEnd);
  };
  const calculateSlicePeriod = () => {
    const time = document.getElementById("slicePeriod").value;
    const timeUnit = document.getElementById("timeUnitforSlice").value;
    const sliceDuration = calculateTimeDuration(time, timeUnit);

    setData({ ...data, slicePeriod: sliceDuration });
    const sliceEndTime = Date.now() + sliceDuration * 1000;
    const sliceEnd = new Date(sliceEndTime).toDateString().slice(4);

    setSliceEndDate(sliceEnd);
  };
  return (
    <>
      <div className="flex w-full items-center justify-center p-3">
        <Label className="text-lg font-bold text-slate-700">Vesting Info</Label>
      </div>

      <div className="sm:px-5 py-5">
        <div>
          <VestingHeaderData textData="Please insert vesting details." />
        </div>
        <div className="pb-3">
          <input
            className="h-10 border-gray-200 border-2 bg-transparent w-full rounded-lg pl-2    "
            placeholder={"0x.."}
            type={"text"}
            id={"tokenAddress"}
            width={"w-11/12"}
            onChange={(e) => {
              updateTokenAddress(e);
            }}
            rounded={"rounded-xl"}
            text={"text-sm"}
          />
          {tokenData ? (
            <TokenDetails data={tokenData} chainData={chainData} />
          ) : (
            <p className="text-xs text-gray-500 m-1">
              e.g. 0x6ACc5D7A1fAa730018E9489b76BA7D683Cdb600B
            </p>
          )}
        </div>

        <div className="flex border-gray-200 border-2 rounded-lg justify-between p-3 ">
          <div className="flex flex-col w-1/2">
            <span className="pl-2">Start Time </span>
            <input
              className="m-2 border-gray-200 border-2 w-4/5 px-1 "
              label={"Start Date"}
              type={"datetime-local"}
              id={"startTime"}
              onChange={calculateStartTime}
              min={new Date().toISOString().substring(0, 16)}
            />
          </div>
          <div className="flex flex-col w-1/2">
            <span className="pl-2">End Time </span>
            <input
              className="m-2 border-gray-200 border-2 w-4/5 px-1"
              label={"End Date"}
              type={"datetime-local"}
              id={"endTime"}
              onChange={calculateEndTime}
              min={new Date().toISOString().substring(0, 16)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 border-2 border-gray-300 py-3 px-5 rounded-lg mt-3 text-sm">
          <Input
            label={"Cliff Time"}
            customClass={
              "text-lg border-gray-200 border-2 w-2/5 bg-transparent rounded-lg pl-2"
            }
            type={"number"}
            id={"cliffDuration"}
            placeholder={"0"}
            onChange={calculateCliff}
            tooltip={'After Cliff Time token will available for claim'}
          />

          <div className="ml-auto space-y-4">
            <h3 className=" text-right">{cliffEndDate}</h3>
            <Select
              id={"timeUnit"}
              onChange={calculateCliff}
              options={["Minute", "Hour", "Day", "Month", "Timestamp"]}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 border-2 border-gray-300 py-3 px-5 rounded-lg mt-3 text-sm">
          <Input
            label={"Slice Duration"}
            customClass={
              "text-lg border-gray-200 border-2 w-2/5 bg-transparent rounded-lg pl-2"
            }
            type={"number"}
            id={"slicePeriod"}
            placeholder={"0"}
            onChange={calculateSlicePeriod}
            tooltip={'After every slice period duration, relative amount of token will be released'}
          />
          <div className="ml-auto space-y-4">
            <h3 className=" text-right">{sliceEndDate}</h3>
            <Select
              id={"timeUnitforSlice"}
              onChange={calculateSlicePeriod}
              options={["Minute", "Hour", "Day", "Month", "Timestamp"]}
            />
          </div>
        </div>
        <div className="flex justify-center py-3">
          <Toggle
            id="isRevocable"
            defaultChecked={revocable}
            onChange={() => {
              setRevocable(!revocable);
            }}
          />
          <label className="pl-2" htmlFor="isRevocable">
            Is Revocable
          </label>
        </div>

        <div className="mt-3">
          {walletData.isConnected ? (
            <Button onClick={handleOnclick} blocked={true}>
              Continue
            </Button>
          ) : (
            <ConnectWallet blocked={true} />
          )}
        </div>
      </div>
    </>
  );
}

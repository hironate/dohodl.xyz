import { ethers } from "ethers";
import HodlAbi from "../../../artifacts/contracts/abis/Hodl.json";
import { contractAddress } from "../../../constant";
import { useSelector, useDispatch } from "react-redux";
import { setWalletData } from "../../../redux/action";
import { useState } from "react";
import { toast } from "react-toastify";
import { ConnectWallet } from "../UserAccount/ConnectWallet";
import { Label } from "../../Atom/Label";
import { Input } from "../../Atom/Input";
import { Image } from "../../Atom/Image";
import { FiSettings } from "react-icons/fi";
import { Icon } from "../../Atom/Icon";
import { Select } from "../../Atom/Select";
import { Button } from "../../Atom/Button";
import { maxAmountToLock } from "../../../utils/maxAmountToLock";

const Hodl = ({ fetchHodlData }) => {
  const chainData = useSelector((state) => state).ChainDataReducer;
  const walletData = useSelector((state) => state).WalletDataReducer;
  const dispatch = useDispatch();

  const [hodlAmount, setHodlAmount] = useState(0);
  const [hodlDuration, setHodlDuration] = useState();
  const [amountInputError, setAmountInputError] = useState(false);
  const [unLockDate, setunLockDate] = useState("...");
  const [loading, setLoading] = useState(false);
  const maxBalanceToLock = maxAmountToLock(walletData.accountBalance);
  const checkInputAmountLimit = () => {
    let enteredAmount = document.getElementById("hodlAmount").value;
    if (enteredAmount > maxBalanceToLock) {
      setAmountInputError(true);
      toast.error("insuffecient fund ");
    } else {
      setAmountInputError(false);
      setHodlAmount(enteredAmount);
    }
  };

  const refreshValues = async () => {
    document.getElementById("hodlAmount").value = "";
    document.getElementById("time").value = "";
    setHodlAmount(0);
    setHodlDuration();
    const provider = walletData.provider;
    let balance = await provider.getBalance(walletData.currentAccount);
    balance = ethers.utils.formatEther(balance);
    const data = {
      accountBalance: balance,
    };
    dispatch(setWalletData(data));
  };

  const handleOnClickMax = () => {
    document.getElementById("hodlAmount").value = maxBalanceToLock;
    setHodlAmount(maxBalanceToLock);
  };

  const calculateDuration = () => {
    let time = document.getElementById("time").value;
    let timeUnit = document.getElementById("timeUnit").value;
    let hodlDuration;
    switch (timeUnit) {
      case "Day":
        hodlDuration = time * 24 * 60 * 60;
        break;
      case "Month":
        hodlDuration = time * 30 * 24 * 60 * 60;
        break;
      case "Timestamp":
        hodlDuration = time;
        break;
      case "Year":
        hodlDuration = time * 60 * 60 * 24 * 365;
        break;
      default:
        hodlDuration = 0;
        break;
    }
    setHodlDuration(hodlDuration);
    const currentTime = new Date().getTime();
    if (hodlDuration) {
      const unlockTimestamp = currentTime + hodlDuration * 1000;
      let date = new Date(unlockTimestamp);
      let unlockDate = date.toDateString().slice(4);
      setunLockDate(unlockDate);
    }
  };

  const createHodl = async () => {
    let provider;
    let signer;
    if (walletData.provider) {
      provider = walletData.provider;
      signer = walletData.signer;
    }

    const contract = new ethers.Contract(contractAddress, HodlAbi.abi, signer);
    if (hodlAmount == "" || hodlDuration <= 0) {
      toast.error("invalid inputes!!");
      return 0;
    }

    try {
      setLoading(true);
      const transaction = await contract.deposit(hodlDuration, {
        value: ethers.utils.parseEther(hodlAmount),
      });

      toast.success(
        "Transaction is placed, wait till it gets confirmed on blockchain"
      );
      const tx = await transaction.wait();
      toast.success("Locked Successfull");
      setLoading(false);
      refreshValues();
      fetchHodlData();
    } catch (error) {
      setLoading(false);
      if (error.code === 4001) {
        toast.error("User denied transaction signature");
      } else {
        console.log(error);
        toast.error("Transation Failed");
      }
    }
  };

  return (
    <div className="w-full px-1 py-5 mx-auto mt-10 font-sans bg-white rounded-md shadow-lg lg:w-1/3 sm:px-5">
      <div className="flex items-center justify-between w-full p-3">
        <Label className="text-lg font-bold text-slate-700">Hodl</Label>
        <Icon icon={FiSettings} className="xl" />
      </div>

      <div className="grid grid-cols-2 px-5 py-3 mt-3 text-sm border-2 border-gray-300 rounded-lg">
        <Input
          label={"Lock Amount"}
          type={"number"}
          id={"hodlAmount"}
          placeholder={"0.0"}
          onChange={checkInputAmountLimit}
          border={"border-none "}
          error={amountInputError}
          errorMsg={"insuffecient fund"}
        />
        <div className="flex flex-col justify-between ml-auto ">
          <Label className="mb-3 text-gray-600 text-end">
            balance : {walletData.accountBalance.slice(0, 5)}
          </Label>
          <div className="flex rounded-3xl">
            <Button
              onClick={handleOnClickMax}
              customClassName="my-1 p-0.5 sm:px-2 rounded-lg text-sm bg-indigo-100 text-indigo-600"
            >
              MAX
            </Button>
            <Image src={chainData.logoUrl} alt="$" className="h-5 m-1.5" />
            <Label className="p-1">{chainData.nativeCurrencySymbol}</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 px-5 py-3 mt-3 text-sm border-2 border-gray-300 rounded-lg">
        <Input
          label={"Unlock Date"}
          type={"number"}
          id={"time"}
          placeholder={"0"}
          onChange={calculateDuration}
          border={"border-none "}
        />
        <div className="ml-auto space-y-4">
          <h3 className="text-right ">{unLockDate}</h3>
          <Select
            id={"timeUnit"}
            onChange={calculateDuration}
            options={["Day", "Month", "Year", "Timestamp"]}
          />
        </div>
      </div>

      <div className="mt-3">
        {walletData.isConnected ? (
          <Button
            blocked={true}
            onClick={createHodl}
            loading={loading}
            disabled={loading}
          >
            Create Hodl
          </Button>
        ) : (
          <ConnectWallet blocked={true} />
        )}
      </div>
    </div>
  );
};

export default Hodl;

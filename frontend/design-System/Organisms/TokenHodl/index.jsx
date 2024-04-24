import { ethers } from "ethers";
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
import { Spinner } from "../../Atom/Spinner";
import { getContractAddress } from "../../../utils/getContractAddress";
import { getContractAbi } from "../../../utils/getContractAbi";

const TokenHodl = ({ fetchHodlData }) => {
  const chainData = useSelector((state) => state).ChainDataReducer;
  const walletData = useSelector((state) => state).WalletDataReducer;
  const dispatch = useDispatch();

  const [hodlAmount, setHodlAmount] = useState(0);
  const [hodlDuration, setHodlDuration] = useState();
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0.0);
  const [isTokenVeryfing, setIsTokenVeryfing] = useState(false);
  const [isVeryfiedTokenAddress, setIsVeryfiedTokenAddress] = useState(false);
  const [amountInputError, setAmountInputError] = useState(false);
  const [tokenInputError, setTokenInputError] = useState(false);
  const [unLockDate, setunLockDate] = useState("...");
  const [loading, setLoading] = useState(false);

  const checkInputAmountLimit = () => {
    let enteredAmount = document.getElementById("hodlAmount").value;

    if (Number(enteredAmount) > Number(tokenBalance)) {
      setAmountInputError(true);
      toast.error("insuffecient fund ");
    } else {
      setAmountInputError(false);
      setHodlAmount(enteredAmount);
    }
  };

  const fetchCurrentTokenBalance = async (erc20Address) => {
    if (!walletData.signer) return;
    const er20Abi = getContractAbi("ERC20");
    const erc20 = new ethers.Contract(erc20Address, er20Abi, walletData.signer);
    const balanceOf = await erc20.balanceOf(walletData.currentAccount);
    const balance = ethers.utils.formatEther(balanceOf);
    setTokenBalance(balance);
  };
  const checkTokenAddress = async (e) => {
    const { signer } = walletData;

    let enteredAddress = e.target.value;
    setIsTokenVeryfing(true);

    try {
      const er20Abi = getContractAbi("ERC20");
      const erc20 = new ethers.Contract(enteredAddress, er20Abi, signer);
      const decimals = await erc20.decimals();
      fetchCurrentTokenBalance(enteredAddress);
      setIsVeryfiedTokenAddress(true);
      setTokenAddress(enteredAddress);
      setTokenInputError(false);
      const symbol = await erc20.symbol();
      setTokenSymbol(symbol);
      const name = await erc20.name();
    } catch (error) {
      console.log(error);
      setTokenInputError(true);
      setIsVeryfiedTokenAddress(false);
      toast.error("Invalid ERC20 Token Address");
      setTokenBalance(0.0);
      setTokenAddress("");
      setTokenSymbol("...");
    }
    setIsTokenVeryfing(false);
  };
  const refreshValues = async () => {
    document.getElementById("hodlAmount").value = "";
    document.getElementById("time").value = "";
    setHodlAmount(0);
    setHodlDuration();
    const provider = walletData.provider;
    let balance = await provider.getBalance(walletData.currentAccount);
    balance = ethers.utils.formatEther(balance);
    fetchCurrentTokenBalance(tokenAddress);
    const data = {
      accountBalance: balance,
    };
    dispatch(setWalletData(data));
  };
  const handleOnClickMax = () => {
    document.getElementById("hodlAmount").value = tokenBalance;
    setHodlAmount(tokenBalance);
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

  const checkAllowance = async (signer) => {
    const er20Abi = getContractAbi("ERC20");
    const eRC20HodlContractAddress = getContractAddress(
      chainData.chainId,
      true
    );
    const erc20 = new ethers.Contract(tokenAddress, er20Abi, signer);
    const allowance = await erc20.allowance(
      walletData.currentAccount,
      eRC20HodlContractAddress
    );
    const totalAllowance = Number(ethers.utils.formatEther(allowance));
    const lockAmount = Number(hodlAmount);

    if (lockAmount > totalAllowance) {
      toast.warning("insufficient allowance ,please approve token");

      const tx = await erc20.approve(
        eRC20HodlContractAddress,
        ethers.utils.parseEther(hodlAmount)
      );
      toast.success(
        "Transaction is placed, wait till it gets confirmed on blockchain"
      );
      await tx.wait();
      await checkAllowance(signer);
    }
  };

  const createHodl = async () => {
    if (isTokenVeryfing || !isVeryfiedTokenAddress) return;

    let { signer } = walletData;

    const contractAddress = getContractAddress(chainData.chainId, true);
    const contractAbi = getContractAbi("ERC20Hodl");
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    if (!isVeryfiedTokenAddress || hodlAmount == "" || hodlDuration <= 0) {
      toast.error("invalid inputes!!");
      return 0;
    }
    const lockAmount = ethers.utils.parseEther(hodlAmount);

    await checkAllowance(signer);
    try {
      setLoading(true);
      const transaction = await contract.deposit(
        hodlDuration,
        lockAmount,
        tokenAddress
      );

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
        <Label className="text-lg font-bold text-slate-700">Token Hodl</Label>
        <Icon icon={FiSettings} className="xl" />
      </div>
      <div className="flex px-5 py-3 mt-3 text-sm border-2 border-gray-300 rounded-lg ">
        <div className="w-full">
          <Input
            label={"ERC20 Token "}
            type={"text"}
            id={"tokenAddress"}
            placeholder={"0x0000.."}
            onChange={checkTokenAddress}
            error={tokenInputError}
            errorMsg={"incorrect erc20 token"}
            border={"border-none "}
            width={"w-full"}
            rounded={"rounded-md"}
          />
        </div>
        <div className="justify-end ">
          <div>
            {isTokenVeryfing ? (
              <div>
                <Spinner />
              </div>
            ) : isVeryfiedTokenAddress ? (
              <div className="px-3 py-1 font-bold text-white bg-green-600 rounded-xl">
                VERIFIED
              </div>
            ) : (
              <div className="px-3 py-1 font-bold text-white bg-red-600 rounded-xl">
                INVALID
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 px-5 py-3 mt-3 text-sm border-2 border-gray-300 rounded-lg">
        <Input
          label={"Lock Amount"}
          type={"number"}
          id={"hodlAmount"}
          placeholder={"0.0"}
          border={"border-none "}
          onChange={checkInputAmountLimit}
          error={amountInputError}
          errorMsg={"insuffecient fund"}
        />
        <div className="flex flex-col justify-between ml-auto ">
          <Label className="mb-3 text-gray-600 text-end">
            balance : {tokenBalance}
          </Label>
          <div className="flex rounded-3xl">
            <Button
              onClick={handleOnClickMax}
              customClassName="my-1 p-0.5 sm:px-2 rounded-lg text-sm bg-indigo-100 text-indigo-600"
            >
              MAX
            </Button>
            <Image
              src={"/images/chainLogo/erc20.jpeg"}
              alt="$"
              className="h-5 m-1.5"
            />
            <Label className="p-1">{tokenSymbol}</Label>
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

export default TokenHodl;

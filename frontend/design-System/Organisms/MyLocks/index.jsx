import { useState } from "react";
import { ethers } from "ethers";
import { FaLock } from "react-icons/fa";
import HodlDetails from "../../Molecules/Modals/HodlDetails";
import Table from "../../Molecules/Table";
import NoRecord from "../../Molecules/NoRecord";
import { toast } from "react-toastify";
import { Spinner } from "../../Atom/Spinner";
import { Label } from "../../Atom/Label";
import { timeStampToDate } from "../../../utils/dateTime/timestampToDate";
import { timeDifference } from "../../../utils/dateTime/timeDifference";
import { useSelector, useDispatch } from "react-redux";
import { setWalletData } from "../../../redux/action";
import { getContractAddress } from "../../../utils/getContractAddress";
import { getContractAbi } from "../../../utils/getContractAbi";

const MyLocks = ({ loading, data, fetchHodlData, isErc20Hodl = false }) => {
  const walletData = useSelector((state) => state.WalletDataReducer);
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const handleOnRowClick = (data) => {
    setModalData(data);
    setIsModalOpen(true);
  };

  const columns = [
    { heading: "S.no", value: "sNo" },
    { heading: "Hodl Date", value: "lockDate" },
    { heading: "Unlock Date", value: "unlockDate" },
    { heading: "Hold Amount", value: "lockAmount" },
    { heading: "Status", value: "hodlStatus" },
    { heading: "", value: "view" },
  ];
  if (isErc20Hodl) {
    const newEntity = { heading: "ERC20 Address", value: "erc20Address" };
    const index = columns.findIndex((column) => column.value === "lockDate");
    columns.splice(index, 0, newEntity);
  }

  let rowsData = [];

  for (let i = 0; i < data.length; i++) {
    const hodlData = data[i];
    const row = {
      sNo: i + 1,
      id: hodlData.id,
      lockDate: timeStampToDate(hodlData.lockedTime),
      unlockDate: timeStampToDate(hodlData.unlockTime),
      lockAmount: getHodlAmount(hodlData.amount),
      hodlStatus: getHodlStatus(hodlData.withdrawn, hodlData.unlockTime),
      view: viewHodl(),
    };

    if (isErc20Hodl) {
      const address = hodlData.tokenAddress;
      row["erc20Address"] = (
        <span title={address} className="cursor-pointer">{`${address.slice(
          0,
          7
        )}...${address.slice(37, 42)}`}</span>
      );
    }

    rowsData.push(row);
  }

  function getHodlAmount(amount) {
    let hodlAmount = ethers.utils.formatEther(amount);
    return (
      <div className="flex items-center">
        <FaLock className="mx-1 text-xs" />
        <span>{hodlAmount}</span>
      </div>
    );
  }

  function getHodlStatus(isWithdrawn, unlockdate) {
    let status;
    if (isWithdrawn) {
      status = "Already Withdrawn";
    } else {
      const currentTime = new Date().getTime();
      const unlockTime = unlockdate * 1000;

      if (currentTime > unlockTime) {
        status = "Completed";
      } else {
        status = timeDifference(unlockTime) + " left";
      }
    }
    let statusCss;
    switch (status) {
      case "Completed":
        statusCss = "bg-green-500";
        break;
      case "Already Withdrawn":
        statusCss = "bg-red-500";
        break;
      default:
        statusCss = "bg-yellow-500";
        break;
    }

    return (
      <span className={`${statusCss} rounded-md px-2 text-white`}>
        {status}
      </span>
    );
  }
  function viewHodl() {
    return (
      <button className="px-2 border-2 border-indigo-200 rounded-md hover:shadow-lg">
        View
      </button>
    );
  }

  const refreshData = async () => {
    const provider = walletData.provider;
    let balance = await provider.getBalance(walletData.currentAccount);
    balance = ethers.utils.formatEther(balance);
    const data = {
      accountBalance: balance,
    };
    dispatch(setWalletData(data));
  };

  const withdraw = async (id) => {
    let signer;
    let chainId = 1;
    if (walletData.provider) {
      signer = walletData.signer;
      chainId = walletData.provider.network.chainId ?? 1;
    }
    const contractAddress = getContractAddress(chainId, isErc20Hodl);
    const contractAbi = getContractAbi(isErc20Hodl ? "ERC20Hodl" : "Hodl");
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);

    try {
      setWithdrawLoading(true);

      const transaction = await contract.withdraw(id);

      toast.success(
        "Transaction is placed, wait till it gets confirmed on blockchain"
      );
      const tx = await transaction.wait();
      let event = await tx.events.find((event) => event.event == "Withdrawn");
      console.log(" ID: ", parseInt(event.args[1]._hex, 16));

      toast.success("Withdraw Successfull");
      setWithdrawLoading(false);
      setIsModalOpen(false);
      refreshData();
      fetchHodlData();
    } catch (error) {
      setWithdrawLoading(false);
      if (error.code === 4001) {
        toast.error("User denied transaction signature");
      } else {
        toast.error("Transation Failed");
      }
    }
  };

  return (
    <div className="mt-10 ">
      <Label className="text-center py-2 text-2xl font-bold  mb-0.5">
        My Locks
      </Label>
      <section className="container items-center justify-center mx-auto ">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-gray-300">Please Wait</p>
          </div>
        ) : (
          <>
            {data.length != 0 ? (
              <Table
                data={data}
                onClickRow={handleOnRowClick}
                rows={rowsData}
                columns={columns}
                tableHeight={323}
              />
            ) : (
              <NoRecord />
            )}
          </>
        )}
        <HodlDetails
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          data={modalData}
          onClickWithdraw={withdraw}
          withdrawLoading={withdrawLoading}
        />
      </section>
    </div>
  );
};

export default MyLocks;

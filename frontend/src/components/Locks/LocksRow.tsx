import { formatDateUsingDuration } from "@/utils/Date";
import { STATUS_FILTERS, formatNumber } from "@/utils/locks";
import moment from "moment";
import React, { useState } from "react";
import LockInfoModal from "../Modal/LockInfoModal";
import ChainLogo from "../ChainTracker/ChainLogo";

const LocksRow = ({ lock, index }: { lock: any; index: number }) => {
  const [openModal, setOpenModal] = useState(false);
  const lockedTime = Number(lock?.lockedTime) * 1000;
  const unlockTime = Number(lock?.unlockTime) * 1000;
  const status = lock?.withdrawn
    ? STATUS_FILTERS.WITHDRAWN
    : new Date().getTime() > unlockTime
      ? STATUS_FILTERS.UNLOCKED
      : "Loked";

  return (
    <div className="grid  grid-cols-8 rounded-sm border-b border-stroke dark:border-strokedark">
      <div className="flex items-center gap-3 p-2.5 xl:p-5">
        <p className="text-black dark:text-white ">{index + 1}</p>
      </div>

      <div className="flex w-full items-center p-2.5 !text-center xl:p-5">
        <ChainLogo
          chainName={lock?.chainName.toLowerCase()}
          width={20}
          height={17}
        />
      </div>

      <div className="flex items-center gap-3 p-2.5 xl:p-5">
        <p className="text-black dark:text-white ">
          {lock?.currencySymbol || "ETH"}
        </p>
      </div>

      <div className="flex items-center  p-2.5 xl:p-5">
        <p className="text-sm font-semibold text-black dark:text-white ">
          {formatNumber(Number(lock?.amount))}{" "}
        </p>
      </div>

      <div className="flex items-center gap-3 p-2.5 xl:p-5">
        <p className="text-black dark:text-white ">
          {formatDateUsingDuration(lockedTime)}
        </p>
      </div>

      <div className="flex items-center gap-3 p-2.5 xl:p-5">
        <p className="text-black dark:text-white ">
          {moment(new Date(unlockTime)).format("ll")}
        </p>
      </div>

      <div className="flex items-center p-2.5 xl:p-5">
        <p
          className={`rounded-full px-3 py-1 font-medium text-black dark:text-white  ${status === STATUS_FILTERS.WITHDRAWN ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300" : status === STATUS_FILTERS.UNLOCKED ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"}`}
        >
          {status}
        </p>
      </div>

      <div className=" items-center justify-center p-2.5 sm:flex xl:p-5">
        <button
          className="flex w-2/3 justify-center rounded-lg  bg-primary-neon p-3  py-2 font-medium text-bodydark1 hover:bg-opacity-90 hover:text-white disabled:cursor-not-allowed md:w-full  2xl:w-2/3 "
          onClick={() => setOpenModal(true)}
        >
          {status === "Unlocked" ? "Withdraw" : "View"}
        </button>
      </div>

      <LockInfoModal
        isOpen={openModal}
        lock={lock}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
};

export default LocksRow;

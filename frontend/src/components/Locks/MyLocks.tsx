import useNetworkMode from "@/hooks/useNetworkMode";
import { DataByChainName } from "@/types/locks";
import { formatDateUsingDuration } from "@/utils/Date";
import {
  combineDataFromChainName,
  formatActivityByChainName as formatLocksByChainName,
} from "@/utils/locks";
import { useEffect, useMemo, useState } from "react";
import { useConfig } from "wagmi";
import LocksRow from "./LocksRow";

const Filters: ["All", "Unlocked", "Withdrawn"] = [
  "All",
  "Unlocked",
  "Withdrawn",
];

const MyLocks = ({
  className,
  deposits,
}: {
  className?: string;
  deposits: DataByChainName;
}) => {
  const [formatedLocks, setFormatedLocks] = useState<any[]>([]);
  const [isFormatingLocks, setIsFormatingLocks] = useState<boolean>(false);
  const [networkMode] = useNetworkMode();

  const [filterBy, setFilterBy] = useState<"All" | "Unlocked" | "Withdrawn">(
    "All",
  );

  const filteredLocks = useMemo(() => {
    switch (filterBy) {
      case "All":
        return formatedLocks;
      case "Unlocked":
        return formatedLocks.filter(
          (lock) =>
            !lock?.withdrawn &&
            new Date().getTime() > Number(lock?.unlockTime) * 1000,
        );
      case "Withdrawn":
        return formatedLocks.filter((lock) => lock?.withdrawn);

      default:
        return formatedLocks;
    }
  }, [filterBy, formatedLocks]);

  const config = useConfig();

  useEffect(() => {
    async function formatData() {
      setIsFormatingLocks(true);
      const formatedDataByChainName = await formatLocksByChainName(
        deposits,
        config,
        networkMode === "testnet",
      );

      const formatedDatas = combineDataFromChainName(formatedDataByChainName);
      formatedDatas.sort((a, b) => Number(b.lockedTime) - Number(a.lockedTime));

      setIsFormatingLocks(false);
      setFormatedLocks(formatedDatas);
    }
    formatData();
  }, [deposits, config, networkMode]);

  return (
    <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 flex justify-between text-xl font-semibold text-black dark:text-white">
        <span>My Locks</span>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center gap-1 rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            {Filters.map((filter, index: number) => (
              <button
                key={index}
                className={`rounded  px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:text-white  dark:hover:bg-boxdark md:text-sm ${filter === filterBy && "bg-white dark:bg-boxdark"}`}
                onClick={() => setFilterBy(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </h4>

      <div className="no-scrollbar flex flex-col overflow-x-scroll text-start">
        <div
          className={`grid min-w-fit grid-cols-8 rounded-sm bg-gray-2 dark:bg-meta-4 md:w-auto`}
        >
          <div className="p-2.5  xl:p-5">
            <h5 className="text-sm font-medium uppercase lg:text-base">
              Sr No.
            </h5>
          </div>
          <div className="p-2.5  xl:p-5">
            <h5 className="text-sm font-medium uppercase lg:text-base">
              Chain
            </h5>
          </div>
          <div className="p-2.5  xl:p-5">
            <h5 className="text-sm font-medium uppercase lg:text-base">
              Currency
            </h5>
          </div>
          <div className="p-2.5  xl:p-5">
            <h5 className="text-sm font-medium uppercase lg:text-base">
              Amount
            </h5>
          </div>
          <div className="p-2.5  xl:p-5">
            <h5 className="text-sm font-medium uppercase lg:text-base">
              Locked At
            </h5>
          </div>
          <div className="p-2.5  sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase lg:text-base">
              Unlock Time
            </h5>
          </div>
          <div className="p-2.5  sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase lg:text-base">
              status
            </h5>
          </div>
          <div className="p-2.5  sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase lg:text-base"></h5>
          </div>
        </div>

        <div className="no-scrollbar relative h-full max-h-[300px] w-full min-w-fit overflow-y-auto shadow-inner lg:w-full">
          {!isFormatingLocks ? (
            !!filteredLocks.length ? (
              filteredLocks.map((lock: any, index: number) => {
                return (
                  <div
                    className={`grid grid-cols-8  ${
                      index === filteredLocks.length - 1
                        ? ""
                        : "border-b border-stroke dark:border-strokedark"
                    }`}
                    key={index}
                  >
                    <LocksRow lock={lock} index={index} />
                  </div>
                );
              })
            ) : (
              <div className="flex w-full items-center justify-center gap-3 py-10">
                <div className="text-body dark:text-bodydark">
                  No Locks Found
                </div>
              </div>
            )
          ) : (
            <div className="flex w-full items-center justify-center gap-3 py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-primary-neon border-t-transparent"></div>
              <div className="text-body dark:text-bodydark">
                Loading Your Locks ...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyLocks;

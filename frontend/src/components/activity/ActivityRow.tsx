import { formatDateUsingDuration } from "@/utils/Date";
import { toShortAddress } from "@/utils/String";
import { formatNumber } from "@/utils/locks";
import React, { useState } from "react";
import {
  CHAIN_ID_TO_EXPLORER_BASE_URI,
  COINGECKO_COIN_ID_TO_CHAIN_NAME,
  getChainIdByChainName,
} from "@/utils/constant";
import useNetworkMode from "@/hooks/useNetworkMode";
import ChainLogo from "../ChainTracker/ChainLogo";
import { FilterAltTwoTone } from "@mui/icons-material";
import PopOver from "../PopOver";

const ActivityRow = ({
  activity,
  index,
  isUserActivity,
  setFilters,
}: {
  activity?: any;
  index?: number;
  isUserActivity: boolean;
  setFilters?: (prevData: any) => void;
}) => {
  const [networkMode] = useNetworkMode();
  const [currentFilters, setCurrentFilters] = useState({
    chain: "All",
    type: "All",
  });

  if (!activity)
    return (
      <div className="min-w-[500px] text-xs sm:text-sm md:text-base">
        <div
          className={`grid  rounded-sm bg-gray-2 dark:bg-meta-4 ${isUserActivity ? "grid-cols-7" : "grid-cols-8"}`}
        >
          <div className="p-2.5  xl:p-5">
            <h5 className=" text-xs font-medium uppercase md:text-base">
              Sr No.
            </h5>
          </div>
          <div className=" flex  cursor-pointer flex-row items-center gap-2 p-2.5 sm:flex xl:p-5">
            <h5 className=" text-xs font-medium uppercase md:text-base">
              Chain
            </h5>
            <PopOver
              items={["All", ...Object.values(COINGECKO_COIN_ID_TO_CHAIN_NAME)]}
              onItemClick={(item) => {
                setFilters?.((prev: any) => ({ ...prev, chain: item }));
                setCurrentFilters?.((prev: any) => ({ ...prev, chain: item }));
              }}
              selectedItem={currentFilters.chain}
            >
              <FilterAltTwoTone
                className="text-xs text-primary"
                fontSize="small"
              />
            </PopOver>
          </div>
          <div className="p-2.5  xl:p-5">
            <h5 className="text-xs font-medium uppercase md:text-base">
              Currency
            </h5>
          </div>
          <div className="p-2.5  xl:p-5">
            <h5 className="text-xs font-medium uppercase md:text-base">
              Amount
            </h5>
          </div>
          <div className="p-2.5  xl:p-5">
            <h5 className="text-xs font-medium uppercase md:text-base">At</h5>
          </div>
          <div className=" flex  cursor-pointer flex-row items-center gap-2 p-2.5 sm:flex xl:p-5">
            <h5 className=" text-xs font-medium uppercase md:text-base">
              Type
            </h5>
            <PopOver
              items={["All", "Withdraw", "Deposit"]}
              onItemClick={(item) => {
                setFilters?.((prev: any) => ({ ...prev, type: item }));
                setCurrentFilters((prev: any) => ({ ...prev, type: item }));
              }}
              selectedItem={currentFilters.type}
            >
              <FilterAltTwoTone
                className="text-xs text-primary "
                fontSize="small"
              />
            </PopOver>
          </div>
          {!isUserActivity && (
            <div className=" p-2.5  sm:block xl:p-5">
              <h5 className="text-xs font-medium uppercase md:text-base">
                User
              </h5>
            </div>
          )}
          <div className=" p-2.5  sm:block xl:p-5">
            <h5 className="text-xs font-medium uppercase md:text-base"></h5>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-w-[500px] text-xs sm:text-sm md:text-base">
      <div
        className={`grid  ${isUserActivity ? "grid-cols-7" : "grid-cols-8"} ${"border-b border-stroke dark:border-strokedark"}`}
        key={index}
      >
        {index !== undefined && (
          <div className="flex items-center gap-3 p-2.5 xl:p-5">
            <p className="text-black dark:text-white ">{index + 1}</p>
          </div>
        )}

        <div className="flex w-full items-center p-2.5 !text-center xl:p-5">
          <ChainLogo
            chainName={activity?.chainName.toLowerCase()}
            width={20}
            height={17}
          />
        </div>

        <div className="flex items-center gap-3 p-2.5 xl:p-5">
          <p className="text-black dark:text-white ">
            {activity?.currencySymbol || "ETH"}
          </p>
        </div>

        <div className="flex items-center  p-2.5 xl:p-5">
          <p className="text-sm font-semibold text-black dark:text-white ">
            {formatNumber(Number(activity?.amount))}{" "}
          </p>
        </div>

        <div className="flex items-center gap-3 p-2.5 xl:p-5">
          <p className="text-black dark:text-white ">
            {formatDateUsingDuration(Number(activity?.timestamp) * 1000)}
          </p>
        </div>

        <div className="items-center p-2.5 sm:flex xl:p-5">
          <p className="text-black dark:text-white ">
            {activity?.activityType}
          </p>
        </div>

        {!isUserActivity && (
          <div className="items-center p-2.5 sm:flex xl:p-5">
            <p className="text-meta-5">{toShortAddress(activity?.user)}</p>
          </div>
        )}

        <div className="items-center justify-center p-2.5 sm:flex xl:p-5">
          <a
            href={`${
              CHAIN_ID_TO_EXPLORER_BASE_URI[
                getChainIdByChainName(
                  activity.chainName,
                  networkMode === "testnet",
                )
              ]
            }/tx/${activity.transactionHash}`}
            target="_blank"
            className="flex w-1/2 justify-center rounded  p-3 py-2  font-medium text-primary-neon hover:bg-opacity-90 disabled:cursor-not-allowed"
          >
            View
          </a>
        </div>
      </div>
    </div>
  );
};

export default ActivityRow;

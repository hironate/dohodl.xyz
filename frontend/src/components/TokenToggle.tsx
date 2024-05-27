import {
  CurrencyBitcoinTwoTone,
  MonetizationOnTwoTone,
} from "@mui/icons-material";
import React, { useState } from "react";

const TokenToggle = ({ onSelect }: { onSelect: any }) => {
  const [toggle, setToggle] = useState(true);

  const _className =
    "flex w-full md:w-1/2 cursor-pointer flex-col justify-start rounded-lg border-2 border-stroke dark:border-strokedark p-6.5 gap-1 h-full";

  return (
    <div className="mb-2 flex h-full flex-grow flex-col gap-5 md:flex-row">
      <div
        className={`${_className} ${toggle && "border-strokedark dark:border-white"} `}
        onClick={() => {
          if (!toggle) {
            setToggle((prev) => !prev);
            onSelect("Native");
          }
        }}
      >
        <div className="flex items-center gap-2">
          <CurrencyBitcoinTwoTone className="text-base" /> Native
        </div>
        <div className="text-sm lg:text-base">Lock native coins</div>
      </div>
      <div
        className={`${_className} ${!toggle && "border-strokedark dark:border-white"} h-full `}
        onClick={() => {
          if (toggle) {
            setToggle((prev) => !prev);
            onSelect("Token");
          }
        }}
      >
        <div className="flex items-center gap-2">
          <MonetizationOnTwoTone className="text-base" /> Token
        </div>
        <div className="text-sm lg:text-base">Lock tokens</div>
      </div>
    </div>
  );
};

export default TokenToggle;

import Image from "next/image";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { toShortAddress } from "@/utils/String";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { useState } from "react";
import { LogoutTwoTone, SettingsTwoTone } from "@mui/icons-material";
import Link from "next/link";
import { formatLockAmountToEth } from "@/utils/locks";

const DropdownUser = () => {
  const { address, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnectAsync } = useDisconnect();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 hover:cursor-pointer"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="hidden flex-col justify-end pt-1 text-right lg:flex">
          <span className="block text-sm font-medium text-black dark:text-white">
            {toShortAddress(address)}
          </span>
          {balance && (
            <span className="block text-sm font-medium text-black dark:text-white">
              {formatLockAmountToEth(balance.value)}
              {"  "}
              {chain?.nativeCurrency.symbol.toUpperCase()}
            </span>
          )}
        </span>

        <span className="hidden text-right lg:block"></span>

        <Jazzicon diameter={41} seed={jsNumberForAddress(address || "0x0")} />
      </div>
      {/* <!-- Dropdown Start --> */}
      <div
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4 flex w-44 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen === true ? "block" : "hidden"
        }`}
      >
        <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
          <li>
            <Link
              href="/settings"
              className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:cursor-pointer hover:text-primary lg:text-base"
            >
              <SettingsTwoTone />
              Settings
            </Link>
          </li>
        </ul>
        <button
          className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
          onClick={async () => {
            await disconnectAsync();
          }}
        >
          <LogoutTwoTone />
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default DropdownUser;

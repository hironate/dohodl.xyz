import { AiFillHome, AiFillLock, AiFillThunderbolt } from "react-icons/ai";
import { BsShieldLockFill } from "react-icons/bs";
import { FaLock } from "react-icons/fa";
import { ImDatabase } from "react-icons/im";

const menuItemData = [
  {
    name: "Home",
    icon: AiFillHome,
    url: "/",
    comingSoon: false,
  },
  {
    name: "All Locks",
    icon: ImDatabase,
    url: "/all-locks",
    comingSoon: false,
  },
  {
    name: "Native Assets Locks",
    icon: FaLock,
    url: "/hodl",
    comingSoon: false,
  },
  {
    name: "Token Locks",
    icon: AiFillLock,
    url: "/token-lock",
    comingSoon: false,
  },
  {
    name: "Mint",
    icon: AiFillThunderbolt,
    url: "#",
    comingSoon: true,
  },
  {
    name: "Vesting",
    icon: BsShieldLockFill,
    url: "#",
    comingSoon: true,
  },
];

export default menuItemData;

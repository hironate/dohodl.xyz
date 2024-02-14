import { BiMenu } from 'react-icons/bi';
import { ImCross } from 'react-icons/im';

export const Menu = ({ openMenu, setOpenMenu }) => {
  return (
    <button
      className="md:hidden text-3xl border-2 border-indigo-300 rounded-md mr-4"
      onClick={() => setOpenMenu(!openMenu)}
    >
      {openMenu ? <ImCross /> : <BiMenu />}
    </button>
  );
};

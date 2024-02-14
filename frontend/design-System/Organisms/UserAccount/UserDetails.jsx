import { useState } from 'react';
import AccountDetails from '../../Molecules/Modals/AccountDetails';
import { Label } from '../../Atom/Label';
export const UserDetails = ({ walletData, currencySymbol, etherscan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className=" hidden md:block cursor-pointer font-semibold text-sm">
      <div
        className="flex rounded-lg bg-gray-200 py-0.5 "
        onClick={() => setIsModalOpen(true)}
      >
        <Label className=" px-3  py-1">
          <span>{walletData.accountBalance.slice(0, 5)}</span>
          <span> {currencySymbol}</span>
        </Label>
        <Label
          onHoverTitle={walletData.currentAccount}
          className=" bg-gray-100 rounded-r-lg px-3 py-1"
        >
          {walletData.currentAccount.slice(0, 5) +
            '...' +
            walletData.currentAccount.slice(38, 42)}
        </Label>
      </div>

      {isModalOpen && (
        <AccountDetails
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          currentAccount={walletData.currentAccount}
          etherscan={etherscan}
        />
      )}
    </div>
  );
};

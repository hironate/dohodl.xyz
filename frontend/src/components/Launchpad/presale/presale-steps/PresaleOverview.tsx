import {
  formatAmount,
  formateValueToIndianNumberingSystem,
} from "@/utils/ethers";
import {
  InitialsPresaleTokenDetails,
  initialPresaleDetails,
} from "@/utils/presale";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useMemo } from "react";

const PresaleOverview = ({
  details,
}: {
  details: {
    presaleDetails: typeof initialPresaleDetails;
    tokenDetails: typeof InitialsPresaleTokenDetails;
    nativeCurrencySymbol: string;
  };
}) => {
  const presaleDetailClassname =
    "border-spacing-1 border-b border-dashed py-2 flex justify-between ";

  const { totalSupply, userTokenBalance } = useMemo(() => {
    return {
      totalSupply: formatAmount({
        amount: details.tokenDetails.totalSupply,
        decimals: details.tokenDetails.decimals,
      }),
      userTokenBalance: formatAmount({
        amount: details.tokenDetails.userBalance,
        decimals: details.tokenDetails.decimals,
      }),
    };
  }, [
    details.tokenDetails.totalSupply,
    details.tokenDetails.decimals,
    details.tokenDetails.userBalance,
  ]);

  const handleCopy = () => {
    if (navigator) {
      navigator.clipboard.writeText(details.tokenDetails.address);
    }
  };

  return (
    <section className="flex h-full flex-col gap-5 p-6.5">
      <div className="token-details mb-4">
        <h3 className="mb-1 text-lg font-bold">Token</h3>
        <div className={presaleDetailClassname}>
          <span>Name</span>
          <span className="font-medium text-black dark:text-white">
            {details.tokenDetails.name}
          </span>
        </div>

        <div className={presaleDetailClassname}>
          <span>Symbol</span>
          <span className="font-medium text-black dark:text-white">
            {details.tokenDetails.symbol}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>Decimals</span>
          <span className="font-medium text-black dark:text-white">
            {details.tokenDetails.decimals}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>totalSupply</span>
          <span className="font-medium text-black dark:text-white">
            {formateValueToIndianNumberingSystem(totalSupply)}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>Available Balance</span>
          <span className="font-medium text-black dark:text-white">
            {formateValueToIndianNumberingSystem(userTokenBalance)}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>Address</span>
          <span
            onClick={handleCopy}
            className="flex cursor-pointer items-center gap-2 font-medium text-primary "
          >
            {details.tokenDetails.address}
            <ContentCopyIcon className="!h-4 !w-4 text-xs" />
          </span>
        </div>
      </div>
      <div className="presale-details mb-4">
        <h3 className="mb-1 text-lg font-bold">Presale</h3>
        <div className={presaleDetailClassname}>
          <span>Currency</span>
          <span className="font-medium text-black dark:text-white">
            {details.nativeCurrencySymbol}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>Hard Cap</span>
          <span className="font-medium text-black dark:text-white">
            {details.presaleDetails.hardCap}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>Soft Cap</span>
          <span className="font-medium text-black dark:text-white">
            {details.presaleDetails.softCap}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>Presale Rate</span>
          <span className="font-medium text-black dark:text-white">
            1 {details.nativeCurrencySymbol} ={" "}
            {details.presaleDetails.presaleRate} {details.tokenDetails.symbol}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>Liquidity Rate</span>
          <span className="font-medium text-black dark:text-white">
            1 {details.nativeCurrencySymbol} ={" "}
            {details.presaleDetails.liquidityRate} {details.tokenDetails.symbol}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>Maximum Buy</span>
          <span className="font-medium text-black dark:text-white">
            {details.presaleDetails.maximumBuy}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>Minimum Buy</span>
          <span className="font-medium text-black dark:text-white">
            {details.presaleDetails.minimumBuy}
          </span>
        </div>
        <div className={presaleDetailClassname}>
          <span>Liquidity Percentage</span>
          <span className="font-medium text-black dark:text-white">
            {details.presaleDetails.liquidityPercentage}
          </span>
        </div>
      </div>
    </section>
  );
};

export default PresaleOverview;

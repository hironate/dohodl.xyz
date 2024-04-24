import { Button } from "../../Atom/Button";

export default function CsvData({ csvData, tokenData, vestingData, handleApprove, createVesting, loading, isApproved, isProcessing }) {

  const approveToken = () => {
    handleApprove();
  };
  const handleCreateVesting = () => {
    createVesting();
  };
  return (
    <div className="pb-3">
      <div className="divide-y border-gray-200 border-2 rounded-lg  m-8">
        <div className="flex justify-between w-full h-12 align-middle p-4">
          <span className="text-neutral-500">Symbol</span>
          <span>{tokenData.symbol}</span>
        </div>

        <div className="flex justify-between w-full h-12 align-middle p-4">
          <span className="text-neutral-500">Token</span>
          <span>
            {tokenData.address.substring(0, 8)}...
            {tokenData.address.substring(37)}
          </span>
        </div>

        <div className="flex justify-between w-full h-12 align-middle p-4">
          <span className="text-neutral-500">Start</span>
          <span>{vestingData.startDate}</span>
        </div>

        <div className="flex justify-between w-full h-12 align-middle p-4">
          <span className="text-neutral-500">End</span>
          <span>{vestingData.endDate}</span>
        </div>

        <div className="flex justify-between w-full h-12 align-middle p-4">
          <span className="text-neutral-500">Total Token</span>
          <span>{csvData.totalToken}</span>
        </div>

        <div className="flex justify-between w-full h-12 align-middle p-4">
          <span className="text-neutral-500">Balance</span>
          <span>{tokenData.balance}</span>
        </div>
      </div>
      <div className="flex ">
        <Button loading={loading} disabled={isApproved} onClick={approveToken}>
          Approve
        </Button>
        <Button disabled={!isApproved} loading={isProcessing} onClick={handleCreateVesting}>
          Vest
        </Button>
      </div>
    </div>
  );
}

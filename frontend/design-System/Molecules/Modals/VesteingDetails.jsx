import React from "react";
import { Modal } from "../../Atom/Modal";
import { Button } from "../../Atom/Button";
import { useState } from "react";
import { toast } from "react-toastify";
import { withdrawTokens } from "../../../infrastructure/smart-contracts/VesterContract";

export default function VestingDetails({
  isOpen,
  setIsOpen,
  data,
  fetchReceiversVestings,
  refreshData
}) {
  const [isPressed, setIsPressed] = useState(false);
  const [amount, setAmount] = useState(0);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const handleOnclick = async () => {
    if (amount > data.Withdrawable) {
      toast.error("Not Enough Available Token");
    }
    if (amount <= 0) {
      toast.error("Amount must be more than Zero")
    }

    try {
      setWithdrawLoading(true);
      const tx = await withdrawTokens(data.id, amount);
      if (tx) {
        toast.success(
          "Withdrawing: Transaction is placed, wait till it gets confirmed on blockchain"
        );
        await tx.wait();
      }
      setIsModalOpen(false);
      setWithdrawLoading(false);
      refreshData();
      fetchReceiversVestings();
    } catch (error) {
      setWithdrawLoading(false);
      if (error.code === 4001) {
        toast.error('User denied transaction signature');
      } else {
        console.log(error);
        toast.error('Transation Failed');
      }
    }
  };
  return (
    <Modal label={"Vesting Schedule"} open={isOpen} setOpen={setIsOpen} pressed={setIsPressed}>
      <div className="space-y-3 ">
        <table className="border-separate lg:border-spacing-6 sm:border-spacing-3 ">
          <tbody>
            <tr>
              <th className="text-start">Vesting Id </th>
              <td>:</td>
              <td>{data.id}</td>
            </tr>
            <tr>
              <th className="text-start">Token </th>
              <td>:</td>
              <td title={data.token}>{data.token?.slice(0, 8)}...{data.token?.slice(36,)}</td>
            </tr>
            <tr>
              <th className="text-start">Vested Amount </th>
              <td>:</td>
              <td>{data.lockAmount}</td>
            </tr>
            <tr>
              <th className="text-start">Vesting Date </th>
              <td>:</td>
              <td>{data.lockDate}</td>
            </tr>
            <tr>
              <th className="text-start">Vesting End </th>
              <td>:</td>
              <td>{data.endDate}</td>
            </tr>
            <tr>
              <th className="text-start ">Owner </th>
              <td>:</td>
              <td title={data.owner}>{data.owner?.slice(0, 8)}...{data.owner?.slice(36,)}</td>
            </tr>
            <tr>
              <th className="text-start ">Slice Period </th>
              <td>:</td>
              <td>{data.slicePeriod}</td>
            </tr>
            <tr>
              <th className="text-start ">Cliff Duration </th>
              <td>:</td>
              <td>{data.cliff}</td>
            </tr>
            <tr>
              <th className="text-start ">Claimable Amount </th>
              <td>:</td>
              <td>{data.Withdrawable}</td>
            </tr>
            <tr>
              <th className="text-start">Revocable </th>
              <td>:</td>
              <td>{data.revocable}</td>
            </tr>
            <tr>
              <th className="text-start">Revoked </th>
              <td>:</td>
              <td>{data.revoked}</td>
            </tr>
          </tbody>
        </table>
        <div className="text-center">
          {isPressed ? (
            <div className="flex  justify-center">
              <div className="flex   items-center ">
                <input
                  placeholder={"0"}
                  type={"number"}
                  className="text-lg border-gray-500 border-2 w-2/5 bg-transparent rounded-lg pl-2 "
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button onClick={handleOnclick} loading={withdrawLoading} disabled={withdrawLoading}>
                  Claim
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsPressed(true)}>Claim</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

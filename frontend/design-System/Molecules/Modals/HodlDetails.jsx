import React from 'react';
import { Modal } from '../../Atom/Modal';
import { Button } from '../../Atom/Button';
export default function HodlDetails({
  isOpen,
  setIsOpen,
  data,
  withdrawLoading,
  onClickWithdraw,
}) {
  const hodlStatus = data.hodlStatus ? data.hodlStatus.props.children : '';

  const handleClickedWithdraw = () => {
    onClickWithdraw(data.id);
  };
  return (
    <Modal label={'My Hodl'} open={isOpen} setOpen={setIsOpen}>
      <div className="space-y-3 ">
        <table className="border-separate lg:border-spacing-7 ">
          <tbody>
            <tr>
              <th className="text-start">Hodl Id </th>
              <td>:</td>
              <td>{data.id}</td>
            </tr>
            <tr>
              <th className="text-start">Hodl Date </th>
              <td>:</td>
              <td>{data.lockDate}</td>
            </tr>
            <tr>
              <th className="text-start">Hodl Upto </th>
              <td>:</td>
              <td>{data.unlockDate}</td>
            </tr>
            <tr>
              <th className="text-start">Hodl Amount </th>
              <td>:</td>
              <td>{data.lockAmount}</td>
            </tr>
            <tr>
              <th className="text-start">Hodl Status </th>
              <td>:</td>
              <td>{hodlStatus}</td>
            </tr>
          </tbody>
        </table>
        <div className="text-center">
          {hodlStatus == 'Completed' ? (
            <Button onClick={handleClickedWithdraw} loading={withdrawLoading}>
              Withdraw
            </Button>
          ) : (
            <button
              onClick={() => setIsOpen(false)}
              className="   py-1.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-2  cursor-pointer"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

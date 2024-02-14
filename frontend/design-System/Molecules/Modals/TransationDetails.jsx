import React from 'react';
import { Modal } from '../../Atom/Modal';
import { FiCopy } from 'react-icons/fi';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { Image } from '../../Atom/Image';

export default function TransationDetails({
  isModalOpen,
  setIsModalOpen,
  transationHash,
  etherscan,
}) {
  return (
    <Modal open={isModalOpen} setOpen={setIsModalOpen} label="Transation">
      <div className="space-y-2">
        <div className="border-2 border-gray-300 rounded-lg p-4 md:space-y-3">
          <div className="flex flex-wrap items-center">
            <Image
              className="h-12"
              src={'/images/accountLogo.png'}
              alt="logo"
            />
            <p title={transationHash} className=" text-xl  px-2">
              {transationHash.slice(0, 5) +
                '...' +
                transationHash.slice(60, 66)}
            </p>
          </div>
          <div className="flex text-gray-500 space-x-5">
            <CopyToClipboard text={transationHash}>
              <button
                onClick={() =>
                  toast.success('Copied Successfull', { autoClose: 50 })
                }
                className="flex text-sm items-center space-x-1  cursor-pointer"
              >
                <FiCopy />
                <span> Copy Transation Hash</span>
              </button>
            </CopyToClipboard>

            <a
              href={`${etherscan}/tx/${transationHash}`}
              target="_blank"
              className="flex text-sm items-center space-x-1 cursor-pointer"
              rel="noreferrer"
            >
              <BsBoxArrowUpRight />
              <span>View Transation on Etherscan</span>
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-center space-x-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="   py-1.5 px-5 bg-indigo-500  text-white rounded-xl  cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    </Modal>
  );
}

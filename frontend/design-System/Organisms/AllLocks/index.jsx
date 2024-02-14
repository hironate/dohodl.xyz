import React from 'react';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { FaLock } from 'react-icons/fa';
import { createClient } from 'urql';
import { useSelector } from 'react-redux';
import { timeStampToDate } from '../../../utils/dateTime/timestampToDate';
import { timeDifference } from '../../../utils/dateTime/timeDifference';
import Table from '../../Molecules/Table';
import { Spinner } from '../../Atom/Spinner';
import { Label } from '../../Atom/Label';
import NoRecord from '../../Molecules/NoRecord';
import TransationDetails from '../../Molecules/Modals/TransationDetails';

const columns = [
  { heading: 'S.no', value: 'sNo' },
  { heading: 'Hodl Amount', value: 'lockAmount' },
  { heading: 'Owner', value: 'owner' },
  { heading: 'Lock Date', value: 'lockDate' },
  { heading: 'Unlock Date', value: 'unlockDate' },
  { heading: 'Status', value: 'hodlStatus' },
  { heading: '', value: 'view' },
];

function getHodlOwner(owner) {
  return (
    <span title={owner}>{owner.slice(0, 5) + '...' + owner.slice(38, 44)}</span>
  );
}
function getHodlAmount(amount) {
  let hodlAmount = ethers.utils.formatEther(amount);
  return (
    <div className="flex items-center">
      <FaLock className="text-xs mx-1" />
      <span>{hodlAmount}</span>
    </div>
  );
}
function getHodlStatus(isWithdrawn, unlockdate) {
  let status;
  if (isWithdrawn) {
    status = 'Already Withdrawn';
  } else {
    const currentTime = new Date().getTime();
    const unlockTime = unlockdate * 1000;

    if (currentTime > unlockTime) {
      status = 'Completed';
    } else {
      status = timeDifference(unlockTime) + ' left';
    }
  }
  let statusCss;
  switch (status) {
    case 'Completed':
      statusCss = 'bg-green-500';
      break;
    case 'Already Withdrawn':
      statusCss = 'bg-red-500';
      break;
    default:
      statusCss = 'bg-yellow-500';
      break;
  }

  return (
    <span className={`${statusCss} rounded-md px-2 text-white`}>{status}</span>
  );
}
function viewHodl() {
  return (
    <button className="border-2 border-indigo-200 px-2 rounded-md hover:shadow-lg">
      View
    </button>
  );
}

const AllLocks = () => {
  const { subgraphApiUrl, etherscan } = useSelector(
    (state) => state.ChainDataReducer,
  );
  const [openModal, setOpenModal] = useState(false);
  const [transationHash, setTransationHash] = useState();
  const [loading, setLoding] = useState(false);
  const [data, setData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [currentOffset, setCurrentOffset] = useState(1);
  const [totalOffsets, setTotalOffsets] = useState(0);
  const [currentOffsetData, setCurrentOffsetData] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllLocks();
  }, [subgraphApiUrl]);

  useEffect(() => {
    calculateRowData();
  }, [data]);

  useEffect(() => {
    handleOffsetData();
  }, [rowData, currentOffset]);

  const fetchAllLocks = async () => {
    const query = `
          query {
          depositeds(orderBy:lockedTime  orderDirection:desc){
          id
          unlockTime
          lockedTime
          owner
          amount
          withdrawn
          transationHash
          }
          }
          `;

    try {
      const client = createClient({
        url: subgraphApiUrl,
      });

      setLoding(true);
      const fetchedData = await client.query(query).toPromise();
      if (fetchedData.data.depositeds) {
        setData(fetchedData.data.depositeds);
      }
    } catch (e) {}

    setLoding(false);
  };

  function calculateRowData() {
    let rowData = [];
    for (let i = 0; i < data.length; i++) {
      const hodlData = data[i];
      const row = {
        sNo: i + 1,
        id: hodlData.id,
        owner: getHodlOwner(hodlData.owner),
        lockDate: timeStampToDate(hodlData.lockedTime),
        unlockDate: timeStampToDate(hodlData.unlockTime),
        lockAmount: getHodlAmount(hodlData.amount),
        hodlStatus: getHodlStatus(hodlData.withdrawn, hodlData.unlockTime),
        transationHash: hodlData.transationHash,
        view: viewHodl(),
      };

      rowData.push(row);
    }
    setRowData(rowData);
    setTotalOffsets(Math.ceil(data.length / itemsPerPage));
    setCurrentOffset(1);
  }

  const handleOnClickRow = (data) => {
    setTransationHash(data.transationHash);
    setOpenModal(true);
  };

  const handleOffsetData = () => {
    let startIndex = (currentOffset - 1) * itemsPerPage;
    let endIndex;
    if (currentOffset * itemsPerPage - 1 < rowData.length) {
      endIndex = currentOffset * itemsPerPage - 1;
    } else {
      endIndex = rowData.length - 1;
    }

    let offsetData = [];
    for (let i = startIndex; i <= endIndex; i++) {
      offsetData.push(rowData[i]);
    }

    setCurrentOffsetData(offsetData);
  };

  const handlePrev = () => {
    if (currentOffset !== 1) {
      setCurrentOffset(currentOffset - 1);
    }
  };
  const handleNext = () => {
    if (currentOffset < totalOffsets) {
      setCurrentOffset(currentOffset + 1);
    }
  };

  return (
    <div className="mt-5 md:mt-10 mx-2 md:mx-5">
      <Label className="text-center py-2 text-2xl font-bold  mb-0.5">
        All Locks
      </Label>
      {loading ? (
        <div className="flex flex-col justify-center items-center">
          <Spinner />
          <p className="text-gray-300">Please Wait</p>
        </div>
      ) : (
        <>
          {data.length != 0 ? (
            <>
              <Table
                rows={currentOffsetData}
                columns={columns}
                onClickRow={handleOnClickRow}
              />
              <div className="text-center mt-2">
                <button
                  className="text-white bg-blue-600 mx-3 rounded-lg px-3"
                  onClick={handlePrev}
                >
                  Prev
                </button>
                {currentOffset} of {totalOffsets}
                <button
                  className="text-white bg-blue-600 mx-3 rounded-lg px-3"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <NoRecord />
          )}
        </>
      )}
      {openModal && (
        <TransationDetails
          isModalOpen={openModal}
          setIsModalOpen={setOpenModal}
          transationHash={transationHash}
          etherscan={etherscan}
        />
      )}
    </div>
  );
};

export default AllLocks;

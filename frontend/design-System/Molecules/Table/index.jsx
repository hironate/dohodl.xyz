import React, { useEffect, useState } from "react";
import { TableBody } from "./TableBody";
import TableHead from "./TableHead";
const Table = ({ columns, rows, onClickRow, tableHeight }) => {
  const [currentOffset, setCurrentOffset] = useState(1);
  const [totalOffsets, setTotalOffsets] = useState(0);
  const [currentOffsetData, setCurrentOffsetData] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    handleOffsetData();
  }, [rows, currentOffset]);

  useEffect(() => {
    calculateRowData();
  }, [rows]);
  const handleOffsetData = () => {
    let startIndex = (currentOffset - 1) * itemsPerPage;
    let endIndex;
    if (currentOffset * itemsPerPage - 1 < rows.length) {
      endIndex = currentOffset * itemsPerPage - 1;
    } else {
      endIndex = rows.length - 1;
    }

    let offsetData = [];
    for (let i = startIndex; i <= endIndex; i++) {
      offsetData.push(rows[i]);
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

  const calculateRowData = () => {
    setTotalOffsets(Math.ceil(rows.length / itemsPerPage));
    setCurrentOffset(1);
  };
  return (
    <>
      <div
        className={`max-h-[${
          tableHeight + 70
        }px] min-h-20   pt-5 pb-10 bg-indigo-100 rounded-3xl`}
      >
        <div className={`overflow-auto max-h-[${tableHeight}px] min-h-20`}>
          <table className="min-w-full table-auto ">
            <TableHead columns={columns} />
            <TableBody
              rows={currentOffsetData}
              columns={columns}
              onClickRow={onClickRow}
            />
          </table>
        </div>
      </div>
      {rows.length > itemsPerPage ? (
        <div className="mt-2 text-center">
          <button
            className="px-3 mx-3 text-white bg-blue-600 rounded-lg"
            onClick={handlePrev}
          >
            Prev
          </button>
          {currentOffset} of {totalOffsets}
          <button
            className="px-3 mx-3 text-white bg-blue-600 rounded-lg"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      ) : null}
    </>
  );
};

export default Table;

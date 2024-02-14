import React from 'react';
import { TableBody } from './TableBody';
import TableHead from './TableHead';
const Table = ({ columns, rows, onClickRow, tableHeight }) => {
  return (
    <div
      className={`max-h-[${
        tableHeight + 70
      }px] min-h-20   pt-5 pb-10 bg-indigo-100 rounded-3xl`}
    >
      <div className={`overflow-auto max-h-[${tableHeight}px] min-h-20`}>
        <table className="min-w-full table-auto ">
          <TableHead columns={columns} />
          <TableBody rows={rows} columns={columns} onClickRow={onClickRow} />
        </table>
      </div>
    </div>
  );
};

export default Table;

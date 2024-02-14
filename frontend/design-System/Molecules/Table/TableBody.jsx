import React from 'react';

export const TableBody = ({ rows, columns, onClickRow }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200 ">
      {rows.map((data, index) => {
        const handleOnClickRow = () => {
          onClickRow && onClickRow(data);
        };
        return (
          <tr
            onClick={handleOnClickRow}
            className="hover:bg-gray-100 "
            key={index}
          >
            {columns.map((columnItem, index) => {
              return (
                <td
                  key={index}
                  className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap "
                >
                  {data[`${columnItem.value}`]}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
};

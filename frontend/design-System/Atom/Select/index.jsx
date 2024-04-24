import React from 'react';

export const Select = ({ id, onChange, options,customClass }) => {
  return (
    <select
      className={customClass || " bg-transparent py-1"}
      id={id}
      onChange={onChange}
    >
      {options.map((data) => (
        <option key={data}>{data}</option>
      ))}
    </select>
  );
};

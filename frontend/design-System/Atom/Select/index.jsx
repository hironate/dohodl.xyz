import React from 'react';

export const Select = ({ id, onChange, options }) => {
  return (
    <select className=" bg-transparent py-1" id={id} onChange={onChange}>
      {options.map((data) => (
        <option key={data}>{data}</option>
      ))}
    </select>
  );
};

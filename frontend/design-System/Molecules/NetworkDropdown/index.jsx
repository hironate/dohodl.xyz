import React from 'react';
import { DropdownListItem } from '../../Atom/DropdownListItem';

export const NetworksDropdown = ({ dropdownItems, onClickDropdownItem }) => {
  return (
    <div className="  right-0 md:right-20 p-2 flex items-center justify-center w-full md:w-80 z-20 fixed  bg-white  rounded-lg">
      <ul className="flex flex-col grow w-full gap-y-2">
        <li className="text-gray-500 pb-2 pl-6">Select a network</li>
        {dropdownItems.map((data, index) => {
          return (
            <li key={index}>
              <DropdownListItem
                imgSrc={data.logoUrl}
                name={data.name}
                onClickDropdownItem={() => onClickDropdownItem(data)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

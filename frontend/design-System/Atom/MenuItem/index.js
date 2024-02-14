import React from 'react';
import { Icon } from '../Icon';
import Link from 'next/link';
export const MenuItem = ({ icon, name, active, url, comingSoon }) => {
  return (
    <Link href={url}>
      <li
        className={`flex  items-center space-x-1 cursor-pointer  ${
          comingSoon && 'text-gray-400'
        }`}
      >
        <Icon icon={icon} />
        <span className={`${active && 'text-blue-800'} `}>{name}</span>
      </li>
    </Link>
  );
};

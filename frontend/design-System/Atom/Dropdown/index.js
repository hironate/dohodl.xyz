import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Image } from '../Image';
import { Icon } from '../Icon';
export const Dropdown = ({ name, dropdownOnClick, imgSrc, dropdownRef }) => {
  const className = [
    'flex items-center',
    'md:px-3',
    'border-2 border-indigo-300 bg-white',
    'relative',
    'font-sans font-medium',
    'rounded-xl',
    'cursor-pointer',
  ].join(' ');

  return (
    <button className={className} ref={dropdownRef} onClick={dropdownOnClick}>
      <Image src={imgSrc} alt={'$'} className={'w-4  my-1.5 lg:m-1.5'} />
      <span className="hidden sm:block ">{name}</span>
      <Icon icon={FiChevronDown} className=" m-1.5" />
    </button>
  );
};

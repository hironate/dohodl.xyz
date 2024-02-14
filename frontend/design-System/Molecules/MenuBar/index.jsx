import React from 'react';
import { useRouter } from 'next/router';
import { MenuItem } from '../../Atom/MenuItem';
import menuItems from '../../../config/menuItems';
export const MenuBar = () => {
  const router = useRouter();
  return (
    <div className=" container mx-auto px-5 mt-5 duration-500">
      <ul className="flex flex-col md:flex-row  justify-center gap-x-10 gap-y-2 text-gray-600">
        {menuItems.map((data, index) => {
          const active = router.pathname == data.url;
          return (
            <MenuItem
              icon={data.icon}
              active={active}
              name={data.name}
              comingSoon={data.comingSoon}
              url={data.url}
              key={index}
            />
          );
        })}
      </ul>
    </div>
  );
};

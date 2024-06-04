"use client";
import React, { useEffect, useRef, useState } from "react";

type DropdownType = {
  dropdownItems: any[];
  preRender?: (item: any, index: number) => React.ReactNode;
  onItemClick?: (item: any) => void;
  children?: React.ReactNode;
};

const Dropdown = ({
  dropdownItems = [],
  preRender,
  onItemClick,
  children,
}: DropdownType) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownref = useRef<any>(null);

  const handleClickOutside = (event: any) => {
    if (dropdownref.current && !dropdownref.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);
  return (
    <>
      {children && (
        <div className="w-full" onClick={() => setDropdownOpen(!dropdownOpen)}>
          {children}
        </div>
      )}
      <div
        ref={dropdownref}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4  flex w-60 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark md:left-0 ${
          dropdownOpen === true ? "block" : "hidden"
        }`}
      >
        <ul className="flex min-w-fit flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
          {dropdownItems.map((item, index) => (
            <li
              key={index}
              className="flex cursor-pointer items-center gap-2 font-semibold hover:text-primary"
              onClick={() => {
                onItemClick?.(item);
                setDropdownOpen(false);
              }}
            >
              {preRender && (
                <div className="w-fit">{preRender(item, index)}</div>
              )}
              <span className="block">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Dropdown;

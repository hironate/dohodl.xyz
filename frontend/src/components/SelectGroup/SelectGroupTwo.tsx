"use client";
import { DURATION_TO_DAY } from "@/utils/constant";
import React, { useState } from "react";

const SelectGroupTwo = ({
  label = "Select Option",
  placeHolder = "Select",
  className,
  options = [],
  onSelect,
}: {
  label?: string;
  placeHolder?: string;
  className?: string;
  options?: string[];
  onSelect?: (duration: number) => void;
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  return (
    <div className={className + " cursor-pointer"}>
      {label && (
        <label className=" block text-sm font-medium text-black dark:text-white">
          {label}
        </label>
      )}

      <div className="relative z-20 bg-white dark:bg-form-input">
        <select
          value={selectedOption}
          onChange={(e) => {
            setSelectedOption(e.target.value);
            onSelect?.(DURATION_TO_DAY[e.target.value]);
            changeTextColor();
          }}
          className={`relative z-20 w-full cursor-pointer appearance-none rounded-md border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
            isOptionSelected ? "text-black dark:text-white" : ""
          }`}
        >
          {options.map((option: string, index: number) => (
            <option
              value={option}
              key={index}
              className="text-body dark:text-bodydark"
            >
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectGroupTwo;

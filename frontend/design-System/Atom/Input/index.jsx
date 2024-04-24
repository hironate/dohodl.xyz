import React from "react";
import { FiInfo } from "react-icons/fi";
import ReactTooltip from "react-tooltip";
import { Icon } from "../../Atom/Icon";

export const Input = ({
  customClass,
  label,
  type,
  id,
  placeholder,
  onChange,
  error,
  errorMsg,
  ref,
  width,
  rounded,
  border,
  text,
  tooltip,
}) => {
  const className =
    customClass ||
    [
      "bg-transparent",
      width || "w-28",
      text || "text-lg",
      "border-gray-200",
      "border-2",
      rounded,
      border,
      error && "outline-red-500",
    ].join(" ");
  return (
    <div className="space-y-3 ">
      {tooltip ? (
        <>
          <div className="flex pb-2">
            <span className="pr-1">{label} </span>
            <button data-tip data-for={label}>
              <Icon icon={FiInfo} className="xl" />
            </button>
            <ReactTooltip id={label} place="top" effect="solid">
              {tooltip}
            </ReactTooltip>
          </div>
        </>
      ) : (
        <h3 className="mb-2">{label}</h3>
      )}
      <input
        type={type}
        id={id}
        className={className}
        placeholder={placeholder}
        onChange={onChange}
        ref={ref}
      />
      {error && <h1 className="inline text-xs text-red-500">{errorMsg}</h1>}
    </div>
  );
};

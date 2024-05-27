import { useState } from "react";

const SwitcherOne = ({
  onEnable = () => {},
  onDisable = () => {},
  isEnable = false,
}) => {
  const [enabled, setEnabled] = useState<boolean>(isEnable);

  return (
    <div>
      <label
        htmlFor="toggle1"
        className="flex cursor-pointer select-none items-center"
      >
        <div className="relative">
          <input
            type="checkbox"
            id="toggle1"
            className="sr-only"
            onChange={() => {
              const isEnable = enabled;
              setEnabled(!enabled);
              if (isEnable) onDisable?.();
              else onEnable?.();
            }}
          />
          <div
            className={`block h-8 w-14 rounded-full bg-meta-9 ${enabled ? "bg-primary" : "bg-stroke dark:bg-[#5A616B] "}`}
          ></div>
          <div
            className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${
              enabled && "!right-1 !translate-x-full  dark:!bg-white"
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default SwitcherOne;

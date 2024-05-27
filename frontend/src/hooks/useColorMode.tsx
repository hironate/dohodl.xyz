import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

type ThemeMode = "dark" | "light";

const useColorMode = (): [ThemeMode, (mode: ThemeMode) => void] => {
  const [colorMode, setColorMode] = useLocalStorage<ThemeMode>(
    "color-theme",
    "light",
  );

  useEffect(() => {
    const className = "dark";
    const bodyClass = window.document.body.classList;

    colorMode === "dark"
      ? bodyClass.add(className)
      : bodyClass.remove(className);
  }, [colorMode]);

  return [colorMode, setColorMode];
};

export default useColorMode;

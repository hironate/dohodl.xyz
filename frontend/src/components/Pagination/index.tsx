import React from "react";
import {
  Pagination as MUIPagination,
  PaginationProps,
  ThemeProvider,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import useColorMode from "@/hooks/useColorMode";

const Pagination = (props: PaginationProps) => {
  const [colorMode] = useColorMode();

  const theme = createTheme({
    palette: {
      primary: {
        light: "#757ce8",
        main: "#3C50E0",
        dark: "#002884",
        contrastText: "#fff",
      },
      secondary: {
        light: "#ff7961",
        main: "#f44336",
        dark: "#ba000d",
        contrastText: "#000",
      },
      mode: colorMode,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <MUIPagination {...props} />
    </ThemeProvider>
  );
};

export default Pagination;

import { createTheme } from "@mui/material";

export const useTheme = () => {
  return createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#0084ff",
      },
      background: {
        default: "#ffffff",
        paper: "#ffffff",
      },
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
  });
};

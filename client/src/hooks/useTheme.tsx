import { createTheme } from "@mui/material";

export const useTheme = () => {
  return createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#007AFF",
        dark: "#0051D5",
        light: "#5AC8FA",
      },
      secondary: {
        main: "#5856D6",
        dark: "#3634A3",
        light: "#AEAEE5",
      },
      background: {
        default: "#F5F5F7",
        paper: "#FFFFFF",
      },
      text: {
        primary: "#1D1D1F",
        secondary: "#86868B",
      },
      divider: "rgba(0, 0, 0, 0.08)",
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      body1: {
        fontSize: "0.9375rem",
        lineHeight: 1.47,
      },
      body2: {
        fontSize: "0.8125rem",
        lineHeight: 1.38,
      },
      caption: {
        fontSize: "0.6875rem",
        lineHeight: 1.33,
        fontWeight: 400,
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      "none",
      "0 1px 2px rgba(0, 0, 0, 0.04)",
      "0 1px 3px rgba(0, 0, 0, 0.06)",
      "0 2px 4px rgba(0, 0, 0, 0.06)",
      "0 2px 6px rgba(0, 0, 0, 0.08)",
      "0 4px 8px rgba(0, 0, 0, 0.08)",
      "0 4px 12px rgba(0, 0, 0, 0.1)",
      "0 6px 16px rgba(0, 0, 0, 0.1)",
      "0 8px 24px rgba(0, 0, 0, 0.12)",
      "0 12px 32px rgba(0, 0, 0, 0.14)",
      "0 16px 48px rgba(0, 0, 0, 0.16)",
      "0 20px 64px rgba(0, 0, 0, 0.18)",
      "0 24px 80px rgba(0, 0, 0, 0.2)",
      "0 28px 96px rgba(0, 0, 0, 0.22)",
      "0 32px 112px rgba(0, 0, 0, 0.24)",
      "0 36px 128px rgba(0, 0, 0, 0.26)",
      "0 40px 144px rgba(0, 0, 0, 0.28)",
      "0 44px 160px rgba(0, 0, 0, 0.3)",
      "0 48px 176px rgba(0, 0, 0, 0.32)",
      "0 52px 192px rgba(0, 0, 0, 0.34)",
      "0 56px 208px rgba(0, 0, 0, 0.36)",
      "0 60px 224px rgba(0, 0, 0, 0.38)",
      "0 64px 240px rgba(0, 0, 0, 0.4)",
      "0 68px 256px rgba(0, 0, 0, 0.42)",
      "0 72px 272px rgba(0, 0, 0, 0.44)",
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 10,
            padding: "8px 16px",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              backgroundColor: "#F5F5F7",
              "& fieldset": {
                borderColor: "rgba(0, 0, 0, 0.08)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(0, 0, 0, 0.12)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#007AFF",
                borderWidth: "1.5px",
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
};

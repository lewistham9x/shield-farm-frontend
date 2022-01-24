import { createTheme, adaptV4Theme } from "@mui/material/styles";

const createThemeMode = (isNightMode) =>
  createTheme(adaptV4Theme({
    palette: {
      mode: isNightMode ? "light" : "dark",
      background: {
        default: isNightMode ? "#242332" : "#BBDEFB",
        paper: isNightMode ? "#606077" : "#C5CAE9",
        primary: isNightMode ? "#505067" : "#64B5F6",
        secondary: isNightMode ? "#3B3A4D" : "#3949AB",
        extra: isNightMode ? "#242332" : "#FFCDD2",
        dark: isNightMode ? "#2B2A3D" : "#1A237E",
        paused: isNightMode ? "#2B2A5A" : "#9FA8DA",
        retired: isNightMode ? "#d32f2f" : "#7986CB",
        hover: isNightMode ? "#2B2A3D" : "#3F51B5",
        border: isNightMode ? "#2B2A3D" : "#303F9F",
        overlay: isNightMode
          ? "rgba(0, 0, 0, 0.75)"
          : "rgba(255, 255, 255, 0.75)",
      },
      primary: {
        main: isNightMode ? "#fff" : "#000",
      },
      secondary: {
        main: isNightMode ? "#fff" : "#1A237E",
      },
      text: {
        primary: isNightMode ? "#fff" : "#E8EAF6",
        secondary: isNightMode ? "#B0B0DD" : "#1565C0",
      },
    },
    overrides: {
      MuiButton: {
        label: {
          color: isNightMode ? "#fff" : "#000",
        },
      },
      // for dropdown menu items
      MuiButtonBase: {
        root: {
          color: isNightMode ? "#fff" : "#000",
        },
      },
      MuiCheckbox: {
        colorPrimary: {
          color: isNightMode ? "#fff" : "#000",
        },
        colorSecondary: {
          color: isNightMode ? "#fff" : "#000",
        },
      },
    },
  }));

export default createThemeMode;

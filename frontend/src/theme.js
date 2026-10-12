import { alpha, createTheme } from "@mui/material/styles";

// Palette and typefaces match the parent BioProtect app (../frontend/src/theme.js).
const primary = "#125085";
const glassBorder = "1px solid rgba(255,255,255,0.6)";
const focusRing = {
  "&.Mui-focusVisible": { outline: `2px solid ${primary}`, outlineOffset: 1 },
};

// The frosted surface of the data menu sheet.
export const sheetSurface = {
  background: "rgba(248,251,252,0.88)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.7)",
  boxShadow: "0 6px 24px rgba(9,27,53,0.2)",
};

// 32px square icon button used across the data menu.
export const iconButtonSx = {
  width: 32,
  height: 32,
  p: 0,
  flex: "none",
  borderRadius: "8px",
  color: "text.secondary",
  "&:hover": { bgcolor: alpha(primary, 0.1) },
};

const theme = createTheme({
  palette: {
    primary: { light: "#448188", main: primary, dark: "#091b35" },
    secondary: { main: "#448188" },
    success: { main: "#5bbd8c" },
    error: { main: "#c23b2a" },
    text: { primary: "#22343f", secondary: "#5d727e" },
  },
  typography: {
    fontFamily:
      '"Plus Jakarta Sans", -apple-system, "Segoe UI", Roboto, sans-serif',
    headingFont: '"DM Serif Display", Georgia, serif',
  },
  components: {
    // Tooltips must not catch clicks: in the compact menu they open over the
    // neighbouring controls.
    MuiTooltip: { defaultProps: { disableInteractive: true } },
    MuiIconButton: { styleOverrides: { root: focusRing } },
    MuiButton: { styleOverrides: { root: focusRing } },
    // The frosted-glass look shared by every dialog and dropdown menu.
    MuiDialog: {
      styleOverrides: {
        root: {
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0,0,0,0.15)",
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          margin: 16,
          borderRadius: 12,
          background: "rgba(235, 242, 255, 0.55)",
          backdropFilter: "blur(20px)",
          border: glassBorder,
          boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
          overflow: "hidden",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          background: "rgba(235, 242, 255, 0.6)",
          backdropFilter: "blur(16px)",
          border: glassBorder,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      },
    },
  },
});

export default theme;

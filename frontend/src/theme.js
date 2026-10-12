import { createTheme } from "@mui/material/styles";

const glassBorder = "1px solid rgba(255,255,255,0.6)";

// The frosted-glass look shared by every dialog and dropdown menu.
const theme = createTheme({
  components: {
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

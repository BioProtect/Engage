import React from "react";
import { Snackbar, Alert } from "@mui/material";

const SuccessSnackbar = ({ open, message, onClose, severity = "success" }) => {
  const isError = severity === "error";
  const bgColor = isError ? "#d32f2f" : "#008000";
  const boxShadowColor = isError
    ? "rgba(211, 47, 47, 0.3)"
    : "rgba(0, 128, 0, 0.3)";

  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        bottom: { xs: 80, sm: 40 },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        elevation={6}
        sx={{
          width: "100%",
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 14,
          boxShadow: `0 4px 12px ${boxShadowColor}`,
          letterSpacing: 0.5,
          backgroundColor: bgColor,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessSnackbar;

import React from "react";
import { Snackbar, Alert } from "@mui/material";

const SuccessSnackbar = ({ open, message, onClose }) => {
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
        severity="success"
        variant="filled"
        elevation={6}
        sx={{
          width: "100%",
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 14,
          boxShadow: "0 4px 12px rgba(0, 128, 0, 0.3)",
          letterSpacing: 0.5,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessSnackbar;

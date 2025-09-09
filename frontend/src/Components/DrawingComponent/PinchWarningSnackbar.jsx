import React from "react";
import { Snackbar, Alert, Box, Typography, IconButton } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import CloseIcon from "@mui/icons-material/Close";

const PinchWarningSnackbar = ({ open, onClose, duration = 5000 }) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={duration}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity="warning"
        icon={<WarningAmberIcon fontSize="large" />}
        sx={{
          bgcolor: "rgba(255, 248, 225, 0.95)",
          color: "#333",
          boxShadow: 6,
          borderRadius: 3,
          fontWeight: 500,
          fontSize: "0.95rem",
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          width: 380,
        }}
      >
        {/* Close button top-right */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            color: "#333",
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Heading */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
          Pinch-to-Zoom disabled while drawing
        </Typography>

        {/* Zoom controls row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            mb: 1,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(227, 242, 253, 0.9)",
              borderRadius: 1.5,
              p: 0.4,
              minWidth: 28,
            }}
          >
            <AddIcon fontSize="small" />
            <RemoveIcon fontSize="small" />
          </Box>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Use the zoom controls on the right
          </Typography>
        </Box>

        {/* Stop drawing row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            width: "100%",
          }}
        >
          <StopCircleIcon
            color="error"
            sx={{
              fontSize: 24,
              borderRadius: 1.5,
              bgcolor: "rgba(255, 205, 210, 0.9)",
              p: 0.4,
            }}
          />
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Or disable the drawing tool
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default PinchWarningSnackbar;

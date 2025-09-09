import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const ConfirmDialog = ({ open, onClose, title, description, onConfirm }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.05)",
          backdropFilter: "blur(2px)",
        },
      }}
      PaperProps={{
        sx: {
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: 2,
          minWidth: isSmall ? "80vw" : 360,
          maxWidth: 400,
          p: 0,
          position: "relative",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          color: "rgba(0,0,0,0.6)",
        }}
        size="small"
      >
        <CloseIcon />
      </IconButton>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 4,
          px: 3,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            mb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "rgba(25, 118, 210, 0.1)",
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 36, color: "error.main" }} />
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: "text.primary", mb: 1.5 }}>
          {description}
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: "error.main", fontWeight: 500 }}
        >
          ⚠ This action cannot be undone
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{ mr: 1, textTransform: "none" }}
        >
          Cancel
        </Button>

        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          sx={{
            textTransform: "none",
            bgcolor: "error.main",
            "&:hover": { bgcolor: "error.dark" },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

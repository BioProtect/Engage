import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckIcon from "@mui/icons-material/Check";

const ConfirmDialog = ({ open, onClose, title, description, onConfirm }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.15)",
          backdropFilter: "blur(4px)",
        },
      }}
      PaperProps={{
        sx: {
          background: "rgba(235, 242, 255, 0.55)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: 3,
          boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
          minWidth: isSmall ? "80vw" : 360,
          maxWidth: 400,
          p: 0,
          overflow: "hidden",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          color: "rgba(0,0,0,0.4)",
          bgcolor: "rgba(0,0,0,0.05)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 3.5,
          px: 3.5,
          pb: 2,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(244,67,54,0.15), rgba(255,112,67,0.2))",
            border: "1.5px solid rgba(244,67,54,0.25)",
            boxShadow: "0 4px 12px rgba(244,67,54,0.15)",
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 34, color: "error.main" }} />
        </Box>

        <Typography
          variant="h6"
          fontWeight={700}
          gutterBottom
          sx={{ color: "#1a1a2e" }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "rgba(0,0,0,0.6)", mb: 2, lineHeight: 1.6 }}
        >
          {description}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.5,
            py: 0.6,
            borderRadius: 2,
            bgcolor: "rgba(244,67,54,0.08)",
            border: "1px solid rgba(244,67,54,0.2)",
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 14, color: "error.main" }} />
          <Typography
            variant="caption"
            sx={{ color: "error.main", fontWeight: 600 }}
          >
            This action cannot be undone
          </Typography>
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.5)", mx: 2 }} />

      <DialogActions sx={{ justifyContent: "center", px: 3, py: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<CloseIcon />}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            borderColor: "rgba(0,0,0,0.2)",
            color: "text.secondary",
            bgcolor: "rgba(255,255,255,0.4)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.6)",
              borderColor: "rgba(0,0,0,0.3)",
            },
            px: 2.5,
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          startIcon={<CheckIcon />}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            background: "linear-gradient(135deg, #f44336, #ff7043)",
            boxShadow: "0 4px 12px rgba(244,67,54,0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #d32f2f, #f44336)",
              boxShadow: "0 4px 16px rgba(244,67,54,0.5)",
            },
            px: 2.5,
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

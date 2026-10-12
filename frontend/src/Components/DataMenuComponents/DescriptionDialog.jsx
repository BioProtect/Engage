import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grow,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";

const InfoDialog = ({ open, onClose, title, description }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      TransitionComponent={Grow}
      transitionDuration={300}
      PaperProps={{
        sx: { minWidth: { xs: "80vw", sm: 340 }, maxWidth: 400 },
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
          zIndex: 1,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ pt: 3.5, px: 3, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              mb: 1.5,
              width: 60,
              height: 60,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(25,118,210,0.15), rgba(25,118,210,0.25))",
              border: "1.5px solid rgba(25,118,210,0.25)",
              boxShadow: "0 4px 12px rgba(25,118,210,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InfoIcon sx={{ fontSize: 30, color: "#1976d2" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: "#1a1a2e", textAlign: "center" }}
          >
            {title}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.5)", mb: 2 }} />

        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            borderRadius: 2,
            background: "rgba(255,255,255,0.35)",
            border: "1px solid rgba(255,255,255,0.55)",
            minHeight: 48,
          }}
        >
          <Typography
            sx={{
              whiteSpace: "pre-line",
              fontSize: "0.9rem",
              color: description ? "#1a1a2e" : "rgba(0,0,0,0.35)",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            {description || "No description provided."}
          </Typography>
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.5)", mx: 2 }} />

      <DialogActions sx={{ justifyContent: "center", px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 700,
            px: 4,
            background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            boxShadow: "0 4px 12px rgba(25,118,210,0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #1565c0, #1976d2)",
              boxShadow: "0 4px 16px rgba(25,118,210,0.5)",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoDialog;

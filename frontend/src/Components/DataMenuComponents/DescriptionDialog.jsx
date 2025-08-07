import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grow,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const InfoDialog = ({ open, onClose, title, description }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      TransitionComponent={Grow}
      transitionDuration={300}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.15)",
          backdropFilter: "none",
        },
      }}
      PaperProps={{
        sx: {
          m: 2,
          px: 5,
          py: 4,
          borderRadius: 4,
          backdropFilter: "blur(20px)",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
          color: "#111",
          minWidth: 350,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <InfoIcon color="primary" fontSize="large" />
          <Typography
            variant="h6"
            component="span"
            color="primary"
            sx={{ fontWeight: "bold" }}
          >
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Divider
          sx={{
            width: "40%",
            my: 2,
            borderColor: "rgba(0, 0, 0, 0.1)",
          }}
        />
      </Box>

      <DialogContent sx={{ textAlign: "center", px: 1, pt: 0, pb: 2 }}>
        <DialogContentText
          component="div"
          sx={{
            whiteSpace: "pre-line",
            fontSize: "1rem",
            color: "#111",
          }}
        >
          {description}
        </DialogContentText>
      </DialogContent>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Divider
          sx={{
            width: "30%",
            my: 2,
            borderColor: "rgba(0, 0, 0, 0.08)",
          }}
        />
      </Box>

      <DialogActions sx={{ justifyContent: "center", p: 0 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 2,
            boxShadow: "0 4px 14px rgba(25, 118, 210, 0.25)",
            textTransform: "none",
            fontWeight: 600,
            px: 5,
            py: 1.5,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoDialog;

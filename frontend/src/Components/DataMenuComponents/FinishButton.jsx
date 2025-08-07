import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LoginIcon from "@mui/icons-material/Login";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useAuth } from "../../Contexts/AuthenticationContext";
import AuthForm from "../Authentication/AuthForm";
import { useMapContext } from "../../Contexts/MapContext";
import { save_polygon } from "../../Api/DataMenuApi";
import ClearIcon from "@mui/icons-material/Clear";

const FinishSessionButton = ({ onFinish }) => {
  const { isAuthenticated, token, user } = useAuth();
  const { drawnFeatures, vectorSource, setDrawnFeatures } = useMapContext();

  const [openDialog, setOpenDialog] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userGroup, setUserGroup] = useState("");

  useEffect(() => {
    setIsButtonEnabled(drawnFeatures && drawnFeatures.length > 0);
  }, [drawnFeatures]);

  useEffect(() => {
    const storedGroup = localStorage.getItem("userGroup");
    if (storedGroup) {
      setUserGroup(storedGroup);
    }
  }, []);

  const clearAllDrawings = () => {
    drawnFeatures.forEach((feature) => vectorSource.removeFeature(feature));
    setDrawnFeatures([]);
  };

  const handleButtonClick = () => {
    if (isAuthenticated) {
      if (drawnFeatures && drawnFeatures.length > 0) {
        setOpenDialog(true);
      } else {
        alert("No drawings to save.");
      }
    } else {
      setOpenDialog(true);
    }
  };

  const handleSaveSession = async () => {
    if (!token) {
      alert("Authentication token missing.");
      return;
    }

    if (!userGroup.trim()) {
      alert("Please enter the user group before saving.");
      return;
    }

    setIsSaving(true);
    localStorage.setItem("userGroup", userGroup);

    try {
      for (const feature of drawnFeatures) {
        const geometry = feature
          .getGeometry()
          .clone()
          .transform("EPSG:3857", "EPSG:4326")
          .getCoordinates();

        const geojson = {
          type: "Polygon",
          coordinates: geometry,
        };

        const name = feature.get("name");
        const color = feature.get("color");
        const description = feature.get("description") || "";
        const density = feature.get("density") || 0;
        const timestamp = feature.get("timestamp");

        await save_polygon({
          userGroup,
          user: user?.username,
          name,
          color,
          description,
          density,
          timestamp,
          geometry: geojson,
          token,
        });
      }

      clearAllDrawings();
      onFinish();
      setOpenDialog(false);
    } catch (err) {
      alert(`Failed to save drawings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    if (!isSaving) {
      setOpenDialog(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleButtonClick}
        disabled={isAuthenticated ? !isButtonEnabled || isSaving : false}
        sx={{ marginTop: 2 }}
        startIcon={isAuthenticated ? <CheckCircleIcon /> : <LoginIcon />}
      >
        {isAuthenticated
          ? isSaving
            ? "Saving..."
            : "Finish Session"
          : "Login"}
      </Button>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
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
            userSelect: "none",
            minWidth: 400,
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <DialogTitle
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 20,
                position: "relative",
                pr: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <DoneAllIcon color="primary" />
              Finish Session
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: "#333",
                }}
                disabled={isSaving}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              <Typography variant="body1" sx={{ color: "#111", mb: 2 }}>
                Please enter your user group to continue.
              </Typography>

              <TextField
                fullWidth
                label="User Group"
                value={userGroup}
                onChange={(e) => setUserGroup(e.target.value)}
                disabled={isSaving}
                autoFocus
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupIcon />
                    </InputAdornment>
                  ),
                  endAdornment: userGroup && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setUserGroup("")}
                        disabled={isSaving}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box
                display="flex"
                alignItems="center"
                sx={{ color: "#555", fontSize: 14 }}
              >
                <WarningAmberIcon sx={{ mr: 1 }} color="warning" />
                <Typography variant="body2">
                  Saving will clear all drawings. This action cannot be undone.
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "space-between" }}>
              <Button
                onClick={handleCloseDialog}
                color="error"
                variant="contained"
                startIcon={<CancelIcon />}
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 14px rgba(211, 47, 47, 0.4)",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 5,
                  py: 1.5,
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSaveSession}
                color="primary"
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 14px rgba(25, 118, 210, 0.25)",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 5,
                  py: 1.5,
                }}
                disabled={isSaving || !userGroup.trim()}
              >
                {isSaving ? "Saving..." : "Save & Clear"}
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{ position: "absolute", right: 8, top: 8, color: "#333" }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              <AuthForm
                onSuccess={() => {
                  setOpenDialog(false);
                }}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};

export default FinishSessionButton;

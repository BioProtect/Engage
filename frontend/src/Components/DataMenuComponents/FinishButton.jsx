import { save_activity, save_polygon } from "../../Api/DataMenuApi";
import { useEffect, useState } from "react";

import AuthForm from "../Authentication/AuthForm";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import GestureIcon from "@mui/icons-material/Gesture";
import GroupIcon from "@mui/icons-material/Group";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import LoginIcon from "@mui/icons-material/Login";
import SaveIcon from "@mui/icons-material/Save";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useAuth } from "../../Contexts/AuthenticationContext";
import { useMapContext } from "../../Contexts/MapContext";

const FinishSessionButton = ({ onFinish }) => {
  const { isAuthenticated, token, user } = useAuth();
  const { drawnFeatures, vectorSource, setDrawnFeatures, showSnackbar } =
    useMapContext();

  const [openDialog, setOpenDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userGroup, setUserGroup] = useState("");

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
        showSnackbar("No drawings to save.", "error");
      }
    } else {
      setOpenDialog(true);
    }
  };

  const handleSaveSession = async () => {
    if (!token) {
      showSnackbar("Authentication token missing.", "error");
      return;
    }

    if (!userGroup.trim()) {
      showSnackbar("Please enter the user group before saving.", "error");
      return;
    }

    setIsSaving(true);
    localStorage.setItem("userGroup", userGroup);

    try {
      for (const feature of drawnFeatures) {
        const geometry = feature.getGeometry().clone().getCoordinates();

        const geojson = {
          type: "Polygon",
          coordinates: geometry,
        };

        const name = feature.get("name");
        const color = feature.get("color");
        const description = feature.get("description") || "";
        const density = feature.get("density") || 0;
        const timestamp = feature.get("timestamp");
        const euniscombd = feature.get("euniscombd") || null;
        const featureType = feature.get("featureType");

        if (featureType === "Activities") {
          await save_activity({
            userGroup,
            user: user?.username,
            name,
            description,
            density,
            timestamp,
            geometry: geojson,
            token,
          });
        } else {
          await save_polygon({
            userGroup,
            user: user?.username,
            name,
            color,
            description,
            density,
            timestamp,
            geometry: geojson,
            euniscombd,
            token,
          });
        }
      }

      clearAllDrawings();
      onFinish();
      setOpenDialog(false);
      showSnackbar("Session Saved Successfully!");
    } catch (err) {
      showSnackbar(`Failed to save drawings: ${err.message}`, "error");
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
        disabled={
          isAuthenticated ? drawnFeatures.length === 0 || isSaving : false
        }
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
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0,0,0,0.15)",
            backdropFilter: "blur(4px)",
          },
        }}
        PaperProps={{
          sx: {
            m: 2,
            borderRadius: 3,
            background: "rgba(235, 242, 255, 0.55)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
            minWidth: { xs: "80vw", sm: 400 },
            maxWidth: 440,
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <IconButton
              onClick={handleCloseDialog}
              disabled={isSaving}
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

            <DialogContent sx={{ pt: 3.5, px: 3.5, pb: 2 }}>
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
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, rgba(25,118,210,0.15), rgba(56,142,60,0.2))",
                    border: "1.5px solid rgba(25,118,210,0.25)",
                    boxShadow: "0 4px 12px rgba(25,118,210,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DoneAllIcon sx={{ fontSize: 34, color: "#1976d2" }} />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: "#1a1a2e" }}
                >
                  Finish Session
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  mb: 2.5,
                  borderRadius: 2,
                  bgcolor: "rgba(25,118,210,0.08)",
                  border: "1px solid rgba(25,118,210,0.18)",
                }}
              >
                <GestureIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                <Typography
                  variant="body2"
                  sx={{ color: "#1565c0", fontWeight: 600 }}
                >
                  {drawnFeatures.length} drawing
                  {drawnFeatures.length !== 1 ? "s" : ""} will be saved
                </Typography>
              </Box>

              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2.5,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(25,118,210,0.15)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.75,
                    mb: 1,
                  }}
                >
                  <GroupIcon sx={{ fontSize: 15, color: "#1976d2" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "#1565c0",
                      letterSpacing: "0.4px",
                      textTransform: "uppercase",
                      fontSize: "0.68rem",
                    }}
                  >
                    User Group
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(0,0,0,0.55)",
                    mb: 1.25,
                    lineHeight: 1.5,
                    fontSize: "0.82rem",
                    textAlign: "center",
                  }}
                >
                  Enter the name of who these drawings belong to
                </Typography>
                <TextField
                  fullWidth
                  value={userGroup}
                  onChange={(e) => setUserGroup(e.target.value)}
                  disabled={isSaving}
                  autoFocus
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.25)",
                      backdropFilter: "blur(8px)",
                      fontSize: "0.875rem",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.45)" },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.7)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "rgba(25,118,210,0.5)",
                      },
                    },
                  }}
                  InputProps={{
                    endAdornment: userGroup && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setUserGroup("")}
                          disabled={isSaving}
                          edge="end"
                        >
                          <ClearIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 2,
                  bgcolor: "rgba(237,108,2,0.08)",
                  border: "1px solid rgba(237,108,2,0.2)",
                }}
              >
                <WarningAmberIcon
                  sx={{ fontSize: 14, color: "warning.main" }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "warning.main", fontWeight: 600 }}
                >
                  Saving will clear all drawings — this cannot be undone
                </Typography>
              </Box>
            </DialogContent>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.5)", mx: 2 }} />

            <DialogActions
              sx={{ justifyContent: "center", px: 3, py: 2, gap: 1.5 }}
            >
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                startIcon={<CloseIcon />}
                disabled={isSaving}
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
                onClick={handleSaveSession}
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSaving || !userGroup.trim()}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #1976d2, #42a5f5)",
                  boxShadow: "0 4px 12px rgba(25,118,210,0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1565c0, #1976d2)",
                    boxShadow: "0 4px 16px rgba(25,118,210,0.5)",
                  },
                  "&:disabled": { background: "rgba(0,0,0,0.12)" },
                  px: 2.5,
                }}
              >
                {isSaving ? "Saving..." : "Save & Clear"}
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <IconButton
              onClick={handleCloseDialog}
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
            <DialogContent sx={{ pt: 3, px: 3, pb: 3 }}>
              <AuthForm onSuccess={() => setOpenDialog(false)} />
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};

export default FinishSessionButton;

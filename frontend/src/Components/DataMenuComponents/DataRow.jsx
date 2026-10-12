import React, { memo, useState } from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import Divider from "@mui/material/Divider";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Paper from "@mui/material/Paper";
import StopIcon from "@mui/icons-material/Stop";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { delete_drawing_item } from "../../Api/DataMenuApi";
import { useAuth } from "../../Contexts/AuthenticationContext";
import { useMapStable } from "../../Contexts/MapContext";

const DataRow = ({
  row,
  featureType,
  deleteRow,
  // This row's slice of the drawing state, worked out once in DataMenu.
  isActive,
  isVisible,
  drawingCount,
  // The info dialog, confirm dialog and drawings dropdown are single instances
  // owned by DataMenu; rows only ask for them.
  onShowInfo,
  onConfirm,
  onToggleDrawings,
  onCloseDrawings,
}) => {
  const [settingsMenu, setSettingsMenu] = useState(null);

  const openSettings = Boolean(settingsMenu);

  const {
    vectorSource,
    drawnFeaturesRef,
    setDrawnFeatures,
    setSelectedFeature,
    setActiveDrawingRow,
    handleCheckboxChange,
    setActiveColor,
    setActiveName,
    setActiveEunisCode,
    setActiveFeatureType,
    showSnackbar,
  } = useMapStable();

  const { isAuthenticated } = useAuth();

  const canToggleCheckbox = drawingCount > 0;

  const clearRowDrawings = (rowId) => {
    drawnFeaturesRef.current.forEach((feature) => {
      if (feature.get("id") === rowId) vectorSource.removeFeature(feature);
    });
    if (!isActive) handleCheckboxChange(rowId, false);
    setSelectedFeature(null);
    setDrawnFeatures((prev) =>
      prev.filter((feature) => feature.get("id") !== rowId),
    );
    showSnackbar(`Drawings for "${row.name}" have been cleared!`);
  };

  const handleSettingsMenuClick = (event) =>
    setSettingsMenu(event.currentTarget);
  const handleSettingsMenuClose = () => setSettingsMenu(null);

  const handleDeleteRow = async () => {
    if (!isAuthenticated) return;
    try {
      await delete_drawing_item(row.id);
      clearRowDrawings(row.id);
      deleteRow(row.id);
      showSnackbar(`${row.name} was successfully deleted!`);
    } catch (err) {
      console.error("Failed to delete item:", err);
      showSnackbar(`Failed to delete item: ${err.message}`, "error");
    }
    handleSettingsMenuClose();
  };

  const handleSetActive = () => {
    if (isActive) {
      setActiveDrawingRow(null);
      setActiveEunisCode(null);
      setActiveFeatureType(null);
    } else {
      setActiveDrawingRow(row.id);
      setActiveColor(row.color);
      setActiveName(row.name);
      setActiveEunisCode(row.eunis2022code || null);
      setActiveFeatureType(featureType || null);
      // Here rather than only in Draw's effect, so it lands in the same render
      handleCheckboxChange(row.id, true);
    }
    onCloseDrawings();
  };

  return (
    <Paper
      elevation={1}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 1.5,
        marginBottom: 1.5,
        borderRadius: 2,
        border: isActive
          ? "2px solid #64b5f6"
          : "1px solid rgba(200, 215, 240, 0.7)",
        backgroundColor: isActive ? "#80d6ff" : "rgba(255, 255, 255, 0.4)",
        boxShadow: isActive
          ? "0 0 15px rgba(66, 165, 245, 0.9)"
          : "0 1px 4px rgba(100, 130, 180, 0.1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.25,
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Settings + Checkbox grouped tightly */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            flexShrink: 0,
          }}
        >
          <IconButton
            aria-label="more"
            aria-controls={`menu-${row.id}`}
            aria-haspopup="true"
            onClick={handleSettingsMenuClick}
            size="small"
            sx={{ p: "2px" }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>

          <Checkbox
            checked={isVisible}
            onChange={(e) => handleCheckboxChange(row.id, e.target.checked)}
            size="small"
            disabled={isActive || !canToggleCheckbox}
            sx={{ p: "2px" }}
          />
        </Box>

        <Menu
          id={`menu-${row.id}`}
          anchorEl={settingsMenu}
          open={openSettings}
          onClose={handleSettingsMenuClose}
          PaperProps={{
            sx: {
              minWidth: 180,
              p: 0.5,
              "& .MuiMenuItem-root": {
                borderRadius: 1.5,
                fontSize: "0.875rem",
              },
            },
          }}
        >
          <MenuItem
            onClick={() =>
              onConfirm({
                title: "Clear All Drawings",
                description: `Are you sure you want to clear all drawings for "${row.name}"?`,
                onConfirm: () => clearRowDrawings(row.id),
              })
            }
            disabled={drawingCount === 0}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#1976d2",
              "&:hover": { bgcolor: "rgba(25,118,210,0.1)" },
            }}
          >
            <ClearIcon fontSize="small" sx={{ color: "#1976d2" }} />
            Clear All Drawings
          </MenuItem>

          <Divider sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.08)" }} />

          <Tooltip title={isAuthenticated ? "" : "Login required to delete"}>
            <span>
              <MenuItem
                onClick={() =>
                  onConfirm({
                    title: "Delete Item",
                    description: `Are you sure you want to delete "${row.name}"?`,
                    onConfirm: handleDeleteRow,
                  })
                }
                disabled={!isAuthenticated}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "error.main",
                  "&:hover": { bgcolor: "rgba(244,67,54,0.08)" },
                }}
              >
                <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
                {isAuthenticated ? "Delete" : "Login to Delete"}
              </MenuItem>
            </span>
          </Tooltip>
        </Menu>

        <Tooltip title="Show info">
          <IconButton
            size="small"
            onClick={() => onShowInfo(row)}
            aria-label="info"
            sx={{ padding: "3px", color: "#1976d2", flexShrink: 0, ml: 2 }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            fontSize: "0.875rem",
            color: "#333",
            flex: 1,
            minWidth: 0,
          }}
        >
          {row.name}
        </Typography>
      </Box>

      {/* Actions */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
      >
        <Tooltip
          title={drawingCount > 0 ? "View drawings" : "No drawings yet"}
          arrow
        >
          <Box
            onClick={(e) => onToggleDrawings(row.id, e.currentTarget)}
            sx={{
              cursor: drawingCount > 0 ? "pointer" : "default",
              width: 30,
              height: 30,
              backgroundColor: row.color,
              border: "2px solid rgba(255,255,255,0.7)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: "bold",
              boxShadow: `0 2px 8px rgba(0,0,0,0.2), 0 0 0 2px ${row.color}44`,
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              ...(drawingCount > 0 && {
                "&:hover": {
                  transform: "scale(1.18)",
                  boxShadow: `0 4px 12px rgba(0,0,0,0.25), 0 0 0 3px ${row.color}66`,
                },
              }),
            }}
          >
            {drawingCount}
          </Box>
        </Tooltip>

        <Tooltip title={isActive ? "Stop Drawing" : "Start Drawing"} arrow>
          <IconButton
            onClick={handleSetActive}
            size="small"
            disableRipple
            sx={{
              borderRadius: 2,
              backgroundColor: (theme) =>
                isActive
                  ? theme.palette.error.main
                  : theme.palette.success.main,
              color: "#fff",
              "&:hover": {
                backgroundColor: (theme) =>
                  isActive
                    ? theme.palette.error.main
                    : theme.palette.success.main,
              },
            }}
          >
            {isActive ? <StopIcon /> : <EditIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

// Memoised: clicking a draw button re-renders the two rows whose state
// changed, not the whole list.
export default memo(DataRow);

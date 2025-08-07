import React, { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import StopIcon from "@mui/icons-material/Stop";
import {
  Checkbox,
  Paper,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import InfoIcon from "@mui/icons-material/Info";
import { useMapContext } from "../../Contexts/MapContext";
import DescriptionDialog from "../DataMenuComponents/DescriptionDialog";
import { useAuth } from "../../Contexts/AuthenticationContext";
import { delete_drawing_item } from "../../Api/DataMenuApi";

const DataRow = ({ row, deleteRow }) => {
  const [SettingsMenu, setSettingsMenu] = useState(null);
  const open = Boolean(SettingsMenu);
  const {
    vectorSource,
    drawnFeatures,
    setDrawnFeatures,
    activeDrawingRow,
    setSelectedFeature,
    setActiveDrawingRow,
    visibilityMap,
    handleCheckboxSelection,
    handleCheckboxChange,
    setActiveColor,
    setActiveName,
    showSnackbar,
  } = useMapContext();

  const { isAuthenticated } = useAuth();

  const [infoOpen, setInfoOpen] = useState(false);

  const clearRowDrawings = (rowId) => {
    drawnFeatures.forEach((feature) => {
      if (feature.get("id") === rowId) {
        vectorSource.removeFeature(feature);
      }
    });
    if (activeDrawingRow !== rowId) {
      handleCheckboxChange(rowId, false);
    }
    setSelectedFeature(null);
    setDrawnFeatures((prev) =>
      prev.filter((feature) => feature.get("id") !== rowId)
    );
    showSnackbar("Drawings for " + row.name + " have been cleared!");
  };

  const handleSettingsMenuClick = (event) => {
    setSettingsMenu(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsMenu(null);
  };

  const handleDeleteRow = async () => {
    if (!isAuthenticated) return;
    try {
      await delete_drawing_item(row.id);
      clearRowDrawings(row.id);
      deleteRow(row.id);
      showSnackbar(row.name + " was sucessfully deleted!");
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item: " + error.message);
    }
    handleSettingsMenuClose();
  };

  const handleSetActive = () => {
    if (activeDrawingRow === row.id) {
      setActiveDrawingRow(null);
    } else {
      setActiveDrawingRow(row.id);
      setActiveColor(row.color);
      setActiveName(row.name);
    }
  };

  const getDrawingCount = (id) =>
    drawnFeatures?.filter((f) => f.get("id") === id).length || 0;
  const drawingCount = getDrawingCount(row.id);
  const canToggleCheckbox = drawingCount > 0;

  return (
    <>
      <Paper
        key={row.id}
        elevation={1}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 1.5,
          marginBottom: 1.5,
          borderRadius: 2,
          border:
            row.id === activeDrawingRow
              ? "2px solid #64b5f6"
              : "1px solid #ddd",
          backgroundColor:
            row.id === activeDrawingRow ? "#80d6ff" : "transparent",
          boxShadow:
            row.id === activeDrawingRow
              ? "0 0 15px rgba(66, 165, 245, 0.9)"
              : "none",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            aria-label="more"
            aria-controls={`menu-${row.id}`}
            aria-haspopup="true"
            onClick={handleSettingsMenuClick}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id={`menu-${row.id}`}
            anchorEl={SettingsMenu}
            open={open}
            onClose={handleSettingsMenuClose}
          >
            <MenuItem
              onClick={() => clearRowDrawings(row.id)}
              disabled={drawingCount === 0}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <IconButton aria-label="clear" sx={{ color: "blue" }}>
                <ClearIcon />
              </IconButton>
              Clear All Drawings
            </MenuItem>

            <Divider />

            <Tooltip title={isAuthenticated ? "" : "Login required to delete"}>
              <span>
                <MenuItem
                  onClick={handleDeleteRow}
                  disabled={!isAuthenticated}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "red",
                    cursor: isAuthenticated ? "pointer" : "default",
                  }}
                >
                  <IconButton
                    aria-label="delete"
                    sx={{ color: "red" }}
                    disabled={!isAuthenticated}
                  >
                    <DeleteIcon />
                  </IconButton>
                  {isAuthenticated ? "Delete" : "Login to Delete"}
                </MenuItem>
              </span>
            </Tooltip>
          </Menu>

          <Checkbox
            checked={visibilityMap[row.id] === true}
            onChange={() => handleCheckboxSelection(row.id)}
            size="small"
            disabled={row.id === activeDrawingRow || !canToggleCheckbox}
          />

          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{ display: "flex", alignItems: "center", gap: 0 }}
          >
            <Tooltip title="Show info">
              <IconButton
                size="small"
                onClick={() => setInfoOpen(true)}
                aria-label="info"
                sx={{
                  padding: "4px",
                  color: "#1976d2",
                  marginRight: "4px",
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {row.name}
            <Box component="span" sx={{ marginLeft: 0.5 }}>
              ({drawingCount})
            </Box>
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 25,
              height: 25,
              backgroundColor: row.color,
              border: "1px solid #999",
              borderRadius: "4px",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Tooltip
              title={
                row.id === activeDrawingRow ? "Stop Drawing" : "Start Drawing"
              }
              arrow
            >
              <IconButton
                onClick={handleSetActive}
                color={row.id === activeDrawingRow ? "error" : "success"}
                size="small"
                sx={{
                  borderRadius: 2,
                  backgroundColor: (theme) =>
                    row.id === activeDrawingRow
                      ? theme.palette.error.main
                      : theme.palette.success.main,
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      row.id === activeDrawingRow
                        ? theme.palette.error.dark
                        : theme.palette.success.dark,
                  },
                }}
                aria-label={
                  row.id === activeDrawingRow ? "Stop Drawing" : "Start Drawing"
                }
              >
                {row.id === activeDrawingRow ? <StopIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>
          </div>
        </Box>
      </Paper>

      <DescriptionDialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={row.name}
        description={row.description}
      />
    </>
  );
};

export default DataRow;

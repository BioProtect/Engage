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
import { useAuth } from "../../Contexts/AuthenticationContext";
import DescriptionDialog from "../DataMenuComponents/DescriptionDialog";
import DrawingDropdown from "../DrawingComponent/DrawingListDialog";
import { delete_drawing_item } from "../../Api/DataMenuApi";
import ConfirmDialog from "./ConfirmDialog";

const DataRow = ({
  row,
  deleteRow,
  openDropdownRowId,
  setOpenDropdownRowId,
  dropdownAnchor,
  setDropdownAnchor,
}) => {
  const [settingsMenu, setSettingsMenu] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [userOpenedDropdown, setUserOpenedDropdown] = useState(false);

  const openSettings = Boolean(settingsMenu);
  const openDrawings = openDropdownRowId === row.id && userOpenedDropdown;

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

  const getRowDrawings = (id) =>
    drawnFeatures?.filter((f) => f.get("id") === id) || [];

  const drawingCount = getRowDrawings(row.id).length;
  const canToggleCheckbox = drawingCount > 0;

  const clearRowDrawings = (rowId) => {
    drawnFeatures.forEach((feature) => {
      if (feature.get("id") === rowId) vectorSource.removeFeature(feature);
    });
    if (activeDrawingRow !== rowId) handleCheckboxChange(rowId, false);
    setSelectedFeature(null);
    setDrawnFeatures((prev) =>
      prev.filter((feature) => feature.get("id") !== rowId)
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
      alert("Failed to delete item: " + err.message);
    }
    handleSettingsMenuClose();
  };

  const handleSetActive = () => {
    if (activeDrawingRow === row.id) {
      setActiveDrawingRow(null);
      setOpenDropdownRowId(null);
      setDropdownAnchor(null);
    } else {
      setActiveDrawingRow(row.id);
      setActiveColor(row.color);
      setActiveName(row.name);
      setOpenDropdownRowId(null);
      setDropdownAnchor(null);
    }
  };

  const handleColorClick = (event) => {
    if (openDropdownRowId === row.id && userOpenedDropdown) {
      setOpenDropdownRowId(null);
      setDropdownAnchor(null);
      setUserOpenedDropdown(false);
    } else {
      setOpenDropdownRowId(row.id);
      setDropdownAnchor(event.currentTarget);
      setUserOpenedDropdown(true);
    }
  };

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
              : "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Settings menu */}
          <IconButton
            aria-label="more"
            aria-controls={`menu-${row.id}`}
            aria-haspopup="true"
            onClick={handleSettingsMenuClick}
            size="small"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>

          <Menu
            id={`menu-${row.id}`}
            anchorEl={settingsMenu}
            open={openSettings}
            onClose={handleSettingsMenuClose}
          >
            <MenuItem
              onClick={() => {
                setConfirmProps({
                  title: "Clear All Drawings",
                  description: `Are you sure you want to clear all drawings for "${row.name}"?`,
                  onConfirm: () => clearRowDrawings(row.id),
                });
                setConfirmOpen(true);
              }}
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
                  onClick={() => {
                    setConfirmProps({
                      title: "Delete Item",
                      description: `Are you sure you want to delete "${row.name}"?`,
                      onConfirm: handleDeleteRow,
                    });
                    setConfirmOpen(true);
                  }}
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

          {/* Visibility checkbox */}
          <Checkbox
            checked={visibilityMap[row.id] === true}
            onChange={() => handleCheckboxSelection(row.id)}
            size="small"
            disabled={row.id === activeDrawingRow || !canToggleCheckbox}
          />

          {/* Row title with info */}
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.875rem",
              color: "#333",
            }}
          >
            <Tooltip title="Show info">
              <IconButton
                size="small"
                onClick={() => setInfoOpen(true)}
                aria-label="info"
                sx={{ padding: "3px", color: "#1976d2", marginRight: "4px" }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {row.name}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            onClick={handleColorClick}
            sx={{
              cursor: drawingCount > 0 ? "pointer" : "default",
              width: 28,
              height: 28,
              backgroundColor: row.color,
              border: "1px solid #999",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: "bold",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {drawingCount}
          </Box>

          {/* Start/Stop Drawing button */}
          <Tooltip
            title={
              activeDrawingRow === row.id ? "Stop Drawing" : "Start Drawing"
            }
            arrow
          >
            <IconButton
              onClick={handleSetActive}
              size="small"
              disableRipple
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
                      ? theme.palette.error.main
                      : theme.palette.success.main,
                },
              }}
            >
              {row.id === activeDrawingRow ? <StopIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Info dialog */}
      <DescriptionDialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={row.name}
        description={row.description}
      />

      {/* Drawing dropdown */}
      <DrawingDropdown
        anchorEl={dropdownAnchor}
        open={openDrawings}
        onClose={() => {
          setOpenDropdownRowId(null);
          setUserOpenedDropdown(false);
        }}
        drawings={getRowDrawings(row.id)}
        row={row}
      />

      {/* Dynamic confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmProps.title}
        description={confirmProps.description}
        onConfirm={confirmProps.onConfirm}
      />
    </>
  );
};

export default DataRow;

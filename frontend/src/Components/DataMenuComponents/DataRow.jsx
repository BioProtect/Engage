import React, { useState } from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmDialog from "./ConfirmDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionDialog from "../DataMenuComponents/DescriptionDialog";
import Divider from "@mui/material/Divider";
import DrawingDropdown from "../DrawingComponent/DrawingListDialog";
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
import { useMapContext } from "../../Contexts/MapContext";

const DataRow = ({
  row,
  featureType,
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
    setActiveEunisCode,
    setActiveFeatureType,
    showSnackbar,
  } = useMapContext();

  const { isAuthenticated } = useAuth();

  const rowDrawings =
    drawnFeatures?.filter((f) => f.get("id") === row.id) || [];
  const drawingCount = rowDrawings.length;
  const canToggleCheckbox = drawingCount > 0;

  const clearRowDrawings = (rowId) => {
    drawnFeatures.forEach((feature) => {
      if (feature.get("id") === rowId) vectorSource.removeFeature(feature);
    });
    if (activeDrawingRow !== rowId) handleCheckboxChange(rowId, false);
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
    if (activeDrawingRow === row.id) {
      setActiveDrawingRow(null);
      setActiveEunisCode(null);
      setActiveFeatureType(null);
      setOpenDropdownRowId(null);
      setDropdownAnchor(null);
    } else {
      setActiveDrawingRow(row.id);
      setActiveColor(row.color);
      setActiveName(row.name);
      setActiveEunisCode(row.eunis2022code || null);
      setActiveFeatureType(featureType || null);
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
              : "1px solid rgba(200, 215, 240, 0.7)",
          backgroundColor:
            row.id === activeDrawingRow
              ? "#80d6ff"
              : "rgba(255, 255, 255, 0.4)",
          boxShadow:
            row.id === activeDrawingRow
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
              checked={Boolean(visibilityMap[row.id])}
              onChange={(e) => handleCheckboxChange(row.id, e.target.checked)}
              size="small"
              disabled={row.id === activeDrawingRow || !canToggleCheckbox}
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
                background: "rgba(235, 242, 255, 0.55)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.6)",
                borderRadius: 2,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
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
              onClick={() => {
                setConfirmProps({
                  title: "Clear All Drawings",
                  description: `Are you sure you want to clear all drawings for "${row.name}"?`,
                  onConfirm: () => clearRowDrawings(row.id),
                });
                setConfirmOpen(true);
              }}
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
              onClick={() => setInfoOpen(true)}
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
              onClick={handleColorClick}
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

      <DescriptionDialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={row.name}
        description={row.description}
      />

      <DrawingDropdown
        anchorEl={dropdownAnchor}
        open={openDrawings}
        onClose={() => {
          setOpenDropdownRowId(null);
          setUserOpenedDropdown(false);
        }}
        drawings={rowDrawings}
        row={row}
      />

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

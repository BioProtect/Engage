import React, { useState } from "react";
import {
  IconButton,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LayersIcon from "@mui/icons-material/Layers";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import { availableLayers } from "./BaseMapLayers";

const GeoTiffSelectorBubble = ({ mapInstance, setGeoTiffLayer }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeLayer, setActiveLayer] = useState("Mapbox Raster");
  const [layerVisible, setLayerVisible] = useState(true);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelectLayer = (name) => {
    if (!mapInstance) return;

    availableLayers.forEach(({ layer }) => layer.setVisible(false));
    const selected = availableLayers.find((l) => l.name === name);
    if (selected) selected.layer.setVisible(true);

    setActiveLayer(name);
    setGeoTiffLayer(selected.layer);
    setLayerVisible(true);
  };

  const toggleLayerVisibility = () => {
    const selected = availableLayers.find((l) => l.name === activeLayer);
    if (!selected) return;

    selected.layer.setVisible(!layerVisible);
    setLayerVisible(!layerVisible);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="GeoTIFF Layers">
        <IconButton
          size="medium"
          onClick={open ? handleClose : handleOpen}
          sx={{ bgcolor: "white", "&:hover": { bgcolor: "#f3f5f7" } }}
        >
          {layerVisible ? (
            <LayersIcon color="primary" />
          ) : (
            <LayersClearIcon color="error" />
          )}
        </IconButton>
      </Tooltip>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="top"
        sx={{ zIndex: 1500 }}
        modifiers={[
          { name: "offset", options: { offset: [0, 8] } },
          { name: "preventOverflow", options: { padding: 10 } },
        ]}
      >
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            p: 1.5,
            minWidth: 220,
            bgcolor: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(10px)",
            position: "relative",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            fontSize: "0.85rem",
            "&::before": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid rgba(255,255,255,0.75)",
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
              position: "relative",
            }}
          >
            <IconButton
              size="small"
              onClick={toggleLayerVisibility}
              sx={{ p: 0.4, position: "absolute", left: 0 }}
            >
              {layerVisible ? (
                <LayersIcon color="primary" />
              ) : (
                <LayersClearIcon color="error" />
              )}
            </IconButton>

            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, textAlign: "center" }}
            >
              GeoTIFF Layers
            </Typography>

            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                p: 0.4,
                color: "#555",
                position: "absolute",
                right: 0,
                "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 1.2, borderColor: "rgba(0,0,0,0.1)" }} />

          {/* Layer list */}
          <List dense>
            {availableLayers.map(({ name }) => (
              <ListItem key={name} disablePadding>
                <ListItemButton
                  selected={activeLayer === name}
                  onClick={() => handleSelectLayer(name)}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "rgba(33, 150, 243, 0.12)",
                      "&:hover": { bgcolor: "rgba(33, 150, 243, 0.2)" },
                    },
                  }}
                >
                  <ListItemText
                    primary={name}
                    primaryTypographyProps={{
                      align: "center",
                      fontSize: "0.85rem",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Popper>
    </>
  );
};

export default GeoTiffSelectorBubble;

import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { availableLayers, createPlanningUnitLayer } from "./BaseMapLayers";

import CloseIcon from "@mui/icons-material/Close";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import LayersIcon from "@mui/icons-material/Layers";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { get_feature_layers } from "../../Api/DataMenuApi";
import { useAuth } from "../../Contexts/AuthenticationContext";

const GeoTiffSelectorBubble = ({ mapInstance, setGeoTiffLayer }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeLayers, setActiveLayers] = useState(new Set());
  // base layers + saved feature layers (loaded once on mount)
  const [featureLayers, setFeatureLayers] = useState([]);
  // the single project PU layer object (updated when project changes)
  const [puLayerObj, setPuLayerObj] = useState(null);

  const { project } = useAuth();
  const puTilesetId = project?.pu_tilesetid ?? null;
  const puAlias = project?.pu_alias ?? "Planning Units";

  // Derived list shown in the selector
  const allLayers = useMemo(
    () =>
      puLayerObj
        ? [...availableLayers, puLayerObj, ...featureLayers]
        : [...availableLayers, ...featureLayers],
    [puLayerObj, featureLayers],
  );

  // Effect 1: load saved feature layers once when the map is ready
  useEffect(() => {
    if (!mapInstance) return;

    const added = [];

    get_feature_layers()
      .then((features) => {
        const layers = features
          .filter((f) => f.tilesetid)
          .map((f) => {
            const obj = createPlanningUnitLayer(f.tilesetid, f.alias);
            mapInstance.addLayer(obj.layer);
            added.push(obj.layer);
            return obj;
          });
        setFeatureLayers(layers);
      })
      .catch((err) => console.error("Failed to load feature layers:", err));

    return () => {
      added.forEach((layer) => mapInstance.removeLayer(layer));
    };
  }, [mapInstance]);

  // Effect 2: add / swap the project PU layer when it changes
  useEffect(() => {
    if (!mapInstance || !puTilesetId) {
      setPuLayerObj(null);
      return;
    }

    const obj = createPlanningUnitLayer(puTilesetId, puAlias);
    mapInstance.addLayer(obj.layer);
    setPuLayerObj(obj);

    return () => {
      mapInstance.removeLayer(obj.layer);
    };
  }, [mapInstance, puTilesetId, puAlias]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const toggleLayer = (name) => {
    if (!mapInstance) return;
    const selected = allLayers.find((l) => l.name === name);
    if (!selected) return;

    const newActiveLayers = new Set(activeLayers);
    if (newActiveLayers.has(name)) {
      newActiveLayers.delete(name);
      selected.layer.setVisible(false);
    } else {
      newActiveLayers.add(name);
      selected.layer.setVisible(true);
    }

    setActiveLayers(newActiveLayers);
    setGeoTiffLayer(selected.layer);
  };

  const toggleAllLayers = () => {
    if (!mapInstance) return;
    const allOn = activeLayers.size === allLayers.length;
    const newActiveLayers = new Set();
    allLayers.forEach(({ layer, name }) => {
      const shouldTurnOn = !allOn;
      layer.setVisible(shouldTurnOn);
      if (shouldTurnOn) newActiveLayers.add(name);
    });
    setActiveLayers(newActiveLayers);
  };

  const open = Boolean(anchorEl);

  let toggleAllIcon;
  if (activeLayers.size === 0)
    toggleAllIcon = <LayersClearIcon color="error" />;
  else if (activeLayers.size === allLayers.length)
    toggleAllIcon = <LayersIcon color="primary" />;
  else toggleAllIcon = <LayersOutlinedIcon color="warning" />;

  return (
    <>
      <Tooltip title="GeoTIFF Layers">
        <IconButton
          size="medium"
          onClick={open ? handleClose : handleOpen}
          sx={{ bgcolor: "white", "&:hover": { bgcolor: "#f3f5f7" } }}
        >
          {activeLayers.size > 0 ? (
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
          elevation={4}
          sx={{
            borderRadius: 2,
            p: 2,
            minWidth: 260,
            bgcolor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            position: "relative",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            fontSize: "0.9rem",
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
              borderTop: "8px solid rgba(255,255,255,0.95)",
            },
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ flexGrow: 1, fontWeight: 600, textAlign: "center" }}
            >
              GeoTIFF Layers
            </Typography>

            <Tooltip title="Toggle All Layers">
              <IconButton
                size="small"
                onClick={toggleAllLayers}
                sx={{ mr: 0.5 }}
              >
                {toggleAllIcon}
              </IconButton>
            </Tooltip>

            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                p: 0.4,
                color: "#555",
                "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 1, borderColor: "rgba(0,0,0,0.1)" }} />

          <List
            dense
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              maxHeight: 300,
              overflowY: "auto",
              pr: 0.5,
            }}
          >
            {allLayers.map(({ name }) => {
              const isActive = activeLayers.has(name);
              return (
                <ListItem key={name} disablePadding>
                  <Paper
                    elevation={isActive ? 3 : 1}
                    sx={{
                      flexGrow: 1,
                      width: "100%",
                      borderRadius: 1.5,
                      bgcolor: isActive
                        ? "rgba(33,150,243,0.08)"
                        : "rgba(255,255,255,0.6)",
                      transition: "all 0.2s",
                      "&:hover": { bgcolor: "rgba(33,150,243,0.15)" },
                    }}
                  >
                    <ListItemButton
                      selected={isActive}
                      onClick={() => toggleLayer(name)}
                      sx={{ py: 0.8 }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {isActive ? (
                              <LayersIcon color="primary" fontSize="small" />
                            ) : (
                              <LayersClearIcon color="error" fontSize="small" />
                            )}
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {name}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </Paper>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Popper>
    </>
  );
};

export default GeoTiffSelectorBubble;

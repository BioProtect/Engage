import React, { useEffect, useMemo, useRef, useState } from "react";
import { availableLayers, createPlanningUnitLayer } from "./BaseMapLayers";

import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import LayersIcon from "@mui/icons-material/Layers";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import Select from "@mui/material/Select";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { get_feature_layers } from "../../Api/DataMenuApi";
import { useAuth } from "../../Contexts/AuthenticationContext";

const SORT_OPTIONS = [
  {
    value: "A-Z",
    label: "A – Z",
    icon: <SortByAlphaIcon fontSize="small" color="primary" />,
  },
  {
    value: "Z-A",
    label: "Z – A",
    icon: (
      <SortByAlphaIcon
        fontSize="small"
        sx={{ transform: "scaleY(-1)", color: "#f57c00" }}
      />
    ),
  },
  {
    value: "Active First",
    label: "Active",
    icon: <LayersIcon fontSize="small" color="primary" />,
  },
  {
    value: "Inactive First",
    label: "Inactive",
    icon: <LayersClearIcon fontSize="small" color="error" />,
  },
];

const FILTER_OPTIONS = [
  {
    value: "All",
    label: "All",
    icon: <DoneAllIcon fontSize="small" color="primary" />,
  },
  {
    value: "Active",
    label: "Active",
    icon: <LayersIcon fontSize="small" color="primary" />,
  },
  {
    value: "Inactive",
    label: "Inactive",
    icon: <LayersClearIcon fontSize="small" color="error" />,
  },
];

const GeoTiffSelectorBubble = ({ mapInstance, setGeoTiffLayer }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const popperRef = useRef(null);
  const buttonRef = useRef(null);
  const [activeLayers, setActiveLayers] = useState(new Set());
  // base layers + saved feature layers (loaded once on mount)
  const [featureLayers, setFeatureLayers] = useState([]);
  // the single project PU layer object (updated when project changes)
  const [puLayerObj, setPuLayerObj] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("A-Z");
  const [filterOption, setFilterOption] = useState("All");
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

  const displayedLayers = useMemo(() => {
    let layers = allLayers;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      layers = layers.filter((l) => l.name.toLowerCase().includes(q));
    }

    if (filterOption === "Active") {
      layers = layers.filter((l) => activeLayers.has(l.name));
    } else if (filterOption === "Inactive") {
      layers = layers.filter((l) => !activeLayers.has(l.name));
    }

    return [...layers].sort((a, b) => {
      switch (sortOption) {
        case "Z-A":
          return b.name.localeCompare(a.name);
        case "Active First":
          return (
            (activeLayers.has(b.name) ? 1 : 0) -
            (activeLayers.has(a.name) ? 1 : 0)
          );
        case "Inactive First":
          return (
            (activeLayers.has(a.name) ? 1 : 0) -
            (activeLayers.has(b.name) ? 1 : 0)
          );
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [allLayers, searchQuery, filterOption, sortOption, activeLayers]);

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

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e) => {
      if (popperRef.current?.contains(e.target)) return;
      if (buttonRef.current?.contains(e.target)) return;
      if (e.target.closest(".MuiMenu-root, .MuiPopover-root, .MuiModal-root"))
        return;
      handleClose();
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

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
          ref={buttonRef}
          size="medium"
          onClick={open ? handleClose : handleOpen}
          sx={{
            bgcolor: "rgba(255,255,255,0.25)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.35)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.4)" },
          }}
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
          ref={popperRef}
          elevation={4}
          sx={{
            borderRadius: 3,
            p: 2,
            minWidth: 220,
            background: "rgba(235, 242, 255, 0.55)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.6)",
            position: "relative",
            boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
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
              borderTop: "8px solid rgba(235,242,255,0.55)",
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

          <Divider sx={{ mb: 1.5, borderColor: "rgba(255,255,255,0.5)" }} />

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search layers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                fontSize: "0.85rem",
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
                "& fieldset": { borderColor: "rgba(255,255,255,0.45)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(25,118,210,0.5)",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: "rgba(0,0,0,0.4)" }}
                  />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Sort + Filter */}
          <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel sx={{ fontSize: "0.8rem" }}>Sort</InputLabel>
              <Select
                value={sortOption}
                label="Sort"
                onChange={(e) => setSortOption(e.target.value)}
                sx={{
                  fontSize: "0.8rem",
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.45)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                }}
                MenuProps={{
                  sx: { zIndex: 2000 },
                  PaperProps: {
                    sx: {
                      background: "rgba(235,242,255,0.6)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.6)",
                      borderRadius: 2,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  },
                }}
                renderValue={(val) => {
                  const opt = SORT_OPTIONS.find((o) => o.value === val);
                  return (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        {opt?.icon}
                      </ListItemIcon>
                      <Typography variant="body2">{opt?.label}</Typography>
                    </Box>
                  );
                }}
              >
                {SORT_OPTIONS.map(({ value, label, icon }) => (
                  <MenuItem key={value} value={value}>
                    <ListItemIcon sx={{ minWidth: 28 }}>{icon}</ListItemIcon>
                    <Typography variant="body2">{label}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel sx={{ fontSize: "0.8rem" }}>Filter</InputLabel>
              <Select
                value={filterOption}
                label="Filter"
                onChange={(e) => setFilterOption(e.target.value)}
                sx={{
                  fontSize: "0.8rem",
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.45)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                }}
                MenuProps={{
                  sx: { zIndex: 2000 },
                  PaperProps: {
                    sx: {
                      background: "rgba(235,242,255,0.6)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.6)",
                      borderRadius: 2,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  },
                }}
                renderValue={(val) => {
                  const opt = FILTER_OPTIONS.find((o) => o.value === val);
                  return (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        {opt?.icon}
                      </ListItemIcon>
                      <Typography variant="body2">{opt?.label}</Typography>
                    </Box>
                  );
                }}
              >
                {FILTER_OPTIONS.map(({ value, label, icon }) => (
                  <MenuItem key={value} value={value}>
                    <ListItemIcon sx={{ minWidth: 28 }}>{icon}</ListItemIcon>
                    <Typography variant="body2">{label}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ mb: 1, borderColor: "rgba(255,255,255,0.5)" }} />

          {/* Layer count */}
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              mb: 0.5,
              textAlign: "center",
            }}
          >
            {displayedLayers.length} / {allLayers.length} layers
          </Typography>

          <List
            dense
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              maxHeight: 240,
              overflowY: "auto",
              pr: 0.5,
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                borderRadius: 10,
                bgcolor: "rgba(25,118,210,0.3)",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                bgcolor: "rgba(25,118,210,0.5)",
              },
            }}
          >
            {displayedLayers.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 3,
                  gap: 1,
                }}
              >
                <SearchOffIcon sx={{ fontSize: 48, color: "primary.main" }} />
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  No layers match
                </Typography>
              </Box>
            ) : (
              displayedLayers.map(({ name }) => {
                const isActive = activeLayers.has(name);
                return (
                  <ListItem key={name} disablePadding>
                    <Paper
                      elevation={isActive ? 3 : 1}
                      sx={{
                        flexGrow: 1,
                        width: "100%",
                        borderRadius: 1.5,
                        background: isActive
                          ? "rgba(25,118,210,0.15)"
                          : "rgba(255,255,255,0.25)",
                        backdropFilter: "blur(8px)",
                        border: isActive
                          ? "1px solid rgba(25,118,210,0.3)"
                          : "1px solid rgba(255,255,255,0.45)",
                        transition: "all 0.2s",
                        "&:hover": {
                          background: "rgba(25,118,210,0.12)",
                          border: "1px solid rgba(25,118,210,0.25)",
                        },
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
                                <LayersClearIcon
                                  color="error"
                                  fontSize="small"
                                />
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
              })
            )}
          </List>
        </Paper>
      </Popper>
    </>
  );
};

export default GeoTiffSelectorBubble;

import { Fill, Stroke, Style } from "ol/style";
import {
  availableLayers,
  createActivityLayer,
  createPlanningUnitLayer,
} from "./BaseMapLayers";
import {
  get_activity_layers,
  get_feature_layers,
  get_prioritizr_run_results,
  get_prioritizr_runs,
} from "../../Api/DataMenuApi";
import { useEffect, useMemo, useRef, useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import ScheduleIcon from "@mui/icons-material/Schedule";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import Select from "@mui/material/Select";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import TextField from "@mui/material/TextField";
import TimelineIcon from "@mui/icons-material/Timeline";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useAuth } from "../../Contexts/AuthenticationContext";

const SORT_OPTIONS = [
  {
    value: "Newest",
    label: "Newest",
    icon: <ScheduleIcon fontSize="small" color="primary" />,
  },
  {
    value: "Oldest",
    label: "Oldest",
    icon: <ScheduleIcon fontSize="small" sx={{ color: "#f57c00" }} />,
  },
  {
    value: "A-Z",
    label: "A – Z",
    icon: <SortByAlphaIcon fontSize="small" color="primary" />,
  },
  {
    value: "Z-A",
    label: "Z - A",
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

// Dates are ISO strings from the server, so they compare as text. Undated
// items (base layers, the project PU grid) always sort last.
const compareDates = (a, b, newestFirst) => {
  if (!a || !b) return (a ? 0 : 1) - (b ? 0 : 1);
  return newestFirst ? b.localeCompare(a) : a.localeCompare(b);
};

// Styles applied to the project planning-unit layer when one or more runs are
// toggled on. Hexes selected by the run's solution are emphasised, the rest
// fade into the basemap.
const RUN_SELECTED_STYLE = new Style({
  fill: new Fill({ color: "rgba(46, 125, 50, 0.45)" }),
  stroke: new Stroke({ color: "rgba(27, 94, 32, 0.85)", width: 1 }),
});
const RUN_UNSELECTED_STYLE = new Style({
  fill: new Fill({ color: "rgba(255, 255, 255, 0.0)" }),
  stroke: new Stroke({ color: "rgba(120, 120, 120, 0.35)", width: 0.5 }),
});

const GeoTiffSelectorBubble = ({ mapInstance, setGeoTiffLayer }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const popperRef = useRef(null);
  const buttonRef = useRef(null);

  // Layer state — each section is an array of { name, layer, date } objects.
  const [featureLayers, setFeatureLayers] = useState([]);
  const [activityLayers, setActivityLayers] = useState([]);
  const [puLayerObj, setPuLayerObj] = useState(null);

  // Runs aren't OL layers — toggling one merges its solution hexes into the
  // set used to re-style the project PU layer.
  const [runs, setRuns] = useState([]);
  const [activeRunIds, setActiveRunIds] = useState(new Set());
  // Map<runId, Set<h3_index>> — cached so we don't refetch on toggle off/on.
  const runResultsCache = useRef(new Map());
  // Bump to retrigger the styling effect when a fetch completes.
  const [runResultsVersion, setRunResultsVersion] = useState(0);

  // Visibility selection — feature + activity layers, keyed by name.
  const [activeLayers, setActiveLayers] = useState(new Set());

  // Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Newest");
  const [filterOption, setFilterOption] = useState("All");

  const { project } = useAuth();
  const projectId = project?.id ?? null;
  const puTilesetId = project?.pu_tilesetid ?? null;
  const puAlias = project?.pu_alias ?? "Planning Units";

  // Flat list used for the toggle-all action and the toggleLayer name lookup.
  const allLayers = useMemo(() => {
    const items = [...availableLayers];
    if (puLayerObj) items.push(puLayerObj);
    return [...items, ...featureLayers, ...activityLayers];
  }, [puLayerObj, featureLayers, activityLayers]);

  // Apply the shared search/sort/filter controls to a layer list ({name,layer}).
  const applyLayerControls = (list) => {
    let filtered = list;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((l) => l.name.toLowerCase().includes(q));
    }
    if (filterOption === "Active") {
      filtered = filtered.filter((l) => activeLayers.has(l.name));
    } else if (filterOption === "Inactive") {
      filtered = filtered.filter((l) => !activeLayers.has(l.name));
    }
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "Newest":
        case "Oldest":
          return compareDates(a.date, b.date, sortOption === "Newest");
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
  };

  // Features section: base layers + project PU layer + saved features.
  const featuresDisplayed = useMemo(() => {
    const items = [...availableLayers];
    if (puLayerObj) items.push(puLayerObj);
    items.push(...featureLayers);
    return applyLayerControls(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    puLayerObj,
    featureLayers,
    searchQuery,
    sortOption,
    filterOption,
    activeLayers,
  ]);

  const activitiesDisplayed = useMemo(
    () => applyLayerControls(activityLayers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activityLayers, searchQuery, sortOption, filterOption, activeLayers],
  );

  const runsDisplayed = useMemo(() => {
    let list = runs.map((r) => ({
      id: r.id,
      name: r.label || `Run #${r.id}`,
      description: r.description,
      status: r.status,
      created_at: r.created_at,
    }));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (filterOption === "Active") {
      list = list.filter((r) => activeRunIds.has(r.id));
    } else if (filterOption === "Inactive") {
      list = list.filter((r) => !activeRunIds.has(r.id));
    }
    return [...list].sort((a, b) => {
      switch (sortOption) {
        case "Newest":
        case "Oldest":
          return compareDates(
            a.created_at,
            b.created_at,
            sortOption === "Newest",
          );
        case "Z-A":
          return b.name.localeCompare(a.name);
        case "Active First":
          return (
            (activeRunIds.has(b.id) ? 1 : 0) - (activeRunIds.has(a.id) ? 1 : 0)
          );
        case "Inactive First":
          return (
            (activeRunIds.has(a.id) ? 1 : 0) - (activeRunIds.has(b.id) ? 1 : 0)
          );
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [runs, activeRunIds, searchQuery, sortOption, filterOption]);

  // --- Effects: load layers from the backend ---

  // Saved features
  useEffect(() => {
    if (!mapInstance) return;
    const added = [];
    get_feature_layers()
      .then((features) => {
        const layers = (features || [])
          .filter((f) => f.tilesetid)
          .map((f) => {
            const obj = createPlanningUnitLayer(
              f.tilesetid,
              f.alias,
              "layer_tiles",
            );
            mapInstance.addLayer(obj.layer);
            added.push(obj.layer);
            return { ...obj, date: f.creation_date };
          });
        setFeatureLayers(layers);
      })
      .catch((err) => console.error("Failed to load feature layers:", err));

    return () => {
      added.forEach((layer) => mapInstance.removeLayer(layer));
    };
  }, [mapInstance]);

  // Saved activities
  useEffect(() => {
    if (!mapInstance) return;
    const added = [];
    get_activity_layers()
      .then((activities) => {
        const layers = (activities || [])
          .filter((a) => a.activity_name)
          .map((a) => {
            const obj = createActivityLayer(
              a.activity_name,
              a.alias || a.activity_name,
            );
            mapInstance.addLayer(obj.layer);
            added.push(obj.layer);
            return { ...obj, date: a.creation_date };
          });
        setActivityLayers(layers);
      })
      .catch((err) => console.error("Failed to load activity layers:", err));

    return () => {
      added.forEach((layer) => mapInstance.removeLayer(layer));
    };
  }, [mapInstance]);

  // Project planning-unit layer
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

  // Prioritizr runs for the current project
  useEffect(() => {
    if (!projectId) {
      setRuns([]);
      setActiveRunIds(new Set());
      runResultsCache.current = new Map();
      return;
    }
    get_prioritizr_runs(projectId)
      .then((runsData) => setRuns(runsData || []))
      .catch((err) => console.error("Failed to load runs:", err));
  }, [projectId]);

  // Re-style the PU layer whenever the active run set or its cached results change.
  useEffect(() => {
    if (!puLayerObj) return;

    const selectedHexes = new Set();
    activeRunIds.forEach((id) => {
      const cached = runResultsCache.current.get(id);
      if (cached) cached.forEach((h) => selectedHexes.add(h));
    });

    if (selectedHexes.size === 0) {
      // No active runs → restore the layer's default style.
      puLayerObj.layer.setStyle(undefined);
      return;
    }

    puLayerObj.layer.setStyle((feature) => {
      const hex = feature.get("h3_index");
      return hex && selectedHexes.has(hex)
        ? RUN_SELECTED_STYLE
        : RUN_UNSELECTED_STYLE;
    });
  }, [puLayerObj, activeRunIds, runResultsVersion]);

  // --- Handlers ---

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

  const toggleRun = async (runId) => {
    if (!puLayerObj) {
      console.warn(
        "Cannot toggle run: no project planning-unit layer is loaded.",
      );
      return;
    }

    const isCurrentlyActive = activeRunIds.has(runId);
    const next = new Set(activeRunIds);
    if (isCurrentlyActive) {
      next.delete(runId);
      setActiveRunIds(next);
      return;
    }

    next.add(runId);
    setActiveRunIds(next);

    // Make sure the PU layer is visible so the highlight can be seen, and that
    // the layer toggle UI reflects that.
    if (!puLayerObj.layer.getVisible()) {
      puLayerObj.layer.setVisible(true);
      setActiveLayers((prev) => {
        const updated = new Set(prev);
        updated.add(puLayerObj.name);
        return updated;
      });
    }

    // Fetch + cache results if needed.
    if (!runResultsCache.current.has(runId)) {
      try {
        const results = await get_prioritizr_run_results(runId);
        const solutionHexes = new Set(
          (results || [])
            .filter((r) => r.solution === 1 || r.solution === true)
            .map((r) => r.h3_index),
        );
        runResultsCache.current.set(runId, solutionHexes);
        setRunResultsVersion((v) => v + 1);
      } catch (err) {
        console.error(`Failed to fetch results for run ${runId}:`, err);
        // Roll back so the UI doesn't claim the run is active when it isn't.
        setActiveRunIds((prev) => {
          const rolled = new Set(prev);
          rolled.delete(runId);
          return rolled;
        });
      }
    }
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

  // --- Render helpers ---

  // Shared list styles for layer / run rows inside an accordion.
  const listSx = {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    maxHeight: 200,
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
  };

  const renderEmpty = (message) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 2,
        gap: 1,
      }}
    >
      <SearchOffIcon sx={{ fontSize: 36, color: "primary.main" }} />
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {message}
      </Typography>
    </Box>
  );

  const renderLayerList = (items, emptyMessage) => {
    if (items.length === 0) return renderEmpty(emptyMessage);
    return (
      <List dense sx={listSx}>
        {items.map(({ name }) => {
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
                          <LayersClearIcon color="error" fontSize="small" />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
    );
  };

  const renderRunList = (items) => {
    if (!projectId) return renderEmpty("Open a project to view its runs");
    if (items.length === 0) return renderEmpty("No runs match");
    return (
      <List dense sx={listSx}>
        {items.map((run) => {
          const isActive = activeRunIds.has(run.id);
          return (
            <ListItem key={run.id} disablePadding>
              <Paper
                elevation={isActive ? 3 : 1}
                sx={{
                  flexGrow: 1,
                  width: "100%",
                  borderRadius: 1.5,
                  background: isActive
                    ? "rgba(46,125,50,0.15)"
                    : "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                  border: isActive
                    ? "1px solid rgba(46,125,50,0.35)"
                    : "1px solid rgba(255,255,255,0.45)",
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "rgba(46,125,50,0.12)",
                    border: "1px solid rgba(46,125,50,0.25)",
                  },
                }}
              >
                <ListItemButton
                  selected={isActive}
                  onClick={() => toggleRun(run.id)}
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
                        <TimelineIcon
                          fontSize="small"
                          color={isActive ? "success" : "disabled"}
                        />
                        <Tooltip title={run.description || ""} placement="top">
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, flexGrow: 1 }}
                          >
                            {run.name}
                          </Typography>
                        </Tooltip>
                        {run.status && (
                          <Chip
                            label={run.status}
                            size="small"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                            color={
                              run.status === "completed" ||
                              run.status === "success"
                                ? "success"
                                : run.status === "failed" ||
                                    run.status === "error"
                                  ? "error"
                                  : "default"
                            }
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </Paper>
            </ListItem>
          );
        })}
      </List>
    );
  };

  const accordionSx = {
    background: "transparent",
    boxShadow: "none",
    "&:before": { display: "none" },
    "&.Mui-expanded": { margin: 0 },
  };
  const accordionSummarySx = {
    minHeight: 36,
    px: 1,
    "&.Mui-expanded": { minHeight: 36 },
    "& .MuiAccordionSummary-content": { my: 0.5 },
  };

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
            minWidth: 260,
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

          {/* Accordion sections */}
          <Accordion defaultExpanded disableGutters sx={accordionSx}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={accordionSummarySx}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Features
                </Typography>
                <Chip
                  label={featuresDisplayed.length}
                  size="small"
                  sx={{ height: 18, fontSize: "0.7rem" }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1, pb: 1.5 }}>
              {renderLayerList(featuresDisplayed, "No features match")}
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters sx={accordionSx}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={accordionSummarySx}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Activities
                </Typography>
                <Chip
                  label={activitiesDisplayed.length}
                  size="small"
                  sx={{ height: 18, fontSize: "0.7rem" }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1, pb: 1.5 }}>
              {renderLayerList(activitiesDisplayed, "No activities match")}
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters sx={accordionSx}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={accordionSummarySx}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Runs
                </Typography>
                <Chip
                  label={runsDisplayed.length}
                  size="small"
                  sx={{ height: 18, fontSize: "0.7rem" }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1, pb: 1.5 }}>
              {renderRunList(runsDisplayed)}
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Popper>
    </>
  );
};

export default GeoTiffSelectorBubble;

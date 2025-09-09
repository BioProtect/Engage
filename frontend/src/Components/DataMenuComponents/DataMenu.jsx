import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Switch,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import AddItemDialog from "./AddItemDialog";
import CategoryTabs from "./CategoryTabs";
import DataRow from "./DataRow";
import FinishSessionButton from "./FinishButton";
import SearchField from "./Search";
import SortSelect from "./SortSelect";
import { useMapContext } from "../../Contexts/MapContext";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import UserInfo from "../Authentication/UserInfo";
import { get_drawing_items } from "../../Api/DataMenuApi";
import ConfirmDialog from "./ConfirmDialog";

const DataMenu = () => {
  const menuRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ Features: [], Activities: [] });
  const [lastSelectedId, setLastSelectedId] = useState(null);

  const [openDropdownRowId, setOpenDropdownRowId] = useState(null);
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const [userOpenedDropdown, setUserOpenedDropdown] = useState(false);

  const fallbackData = {
    Features: [
      {
        id: 1,
        name: "Coral Reef",
        color: "#FF6666",
        description:
          "A diverse underwater ecosystem found in warm ocean waters.",
      },
      {
        id: 2,
        name: "Fresh Water",
        color: "#8A2BE2",
        description:
          "A habitat of rivers, lakes, and ponds that are low in salt content.",
      },
      {
        id: 3,
        name: "Kelp Forest",
        color: "#32CD32",
        description:
          "A coastal underwater forest of giant kelp plants, home to many species.",
      },
      {
        id: 4,
        name: "Open Ocean",
        color: "#1E90FF",
        description: "The vast, deep waters of the ocean away from the coast.",
      },
      {
        id: 5,
        name: "Salt Marsh",
        color: "#D2691E",
        description:
          "A coastal ecosystem of salt-tolerant plants and tidal waters.",
      },
    ],
    Activities: [
      {
        id: 10,
        name: "Overfishing",
        color: "#FF4500",
        description: "The depletion of fish species due to excessive fishing.",
      },
      {
        id: 11,
        name: "Pollution",
        color: "#2E8B57",
        description:
          "The introduction of harmful substances into the environment.",
      },
      {
        id: 12,
        name: "Rain",
        color: "#4169E1",
        description:
          "Precipitation in the form of water droplets falling from the sky.",
      },
      {
        id: 13,
        name: "Wind",
        color: "#FFD700",
        description: "The movement of air from high to low pressure areas.",
      },
    ],
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const fetchedData = await get_drawing_items();
      const transform = (arr) =>
        arr.map(({ id, name, description, color, type }) => ({
          id,
          name,
          description,
          color,
          type,
        }));

      const formattedData = {
        Features: transform(fetchedData?.Features || []),
        Activities: transform(fetchedData?.Activities || []),
      };

      if (
        formattedData.Features.length === 0 &&
        formattedData.Activities.length === 0
      ) {
        console.warn("Using fallback data (empty API response).");
        setData(fallbackData);
      } else {
        setData(formattedData);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [isOpen, setIsOpen] = useState(true);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  const categoryList = ["Features", "Activities"];
  const [selectedCategory, setSelectedCategory] = useState(categoryList[0]);
  const [sortOption, setSortOption] = useState("Name");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    activeDrawingRow,
    drawnFeatures,
    map,
    drawRef,
    vectorSource,
    setDrawnFeatures,
    setSelectedFeature,
    setActiveDrawingRow,
    visibilityMap,
    handleCheckboxChange,
    showSnackbar,
    showLabels,
    setShowLabels,
  } = useMapContext();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (activeDrawingRow) setLastSelectedId(activeDrawingRow);
  }, [activeDrawingRow]);

  const clearAllDrawings = () => {
    if (drawnFeatures.length === 0) return;
    drawnFeatures.forEach((feature) => {
      vectorSource.removeFeature(feature);
      handleCheckboxChange(feature.get("id"), false);
    });
    setDrawnFeatures([]);
    setActiveDrawingRow(null);
    setSelectedFeature(null);
    showSnackbar("All drawings cleared!");
  };

  const deleteRow = (rowId) => {
    const newData = { ...data };
    Object.keys(newData).forEach((category) => {
      newData[category] = newData[category].filter((row) => row.id !== rowId);
    });
    setData(newData);
    map.removeInteraction(drawRef.current);

    if (openDropdownRowId === rowId) {
      setOpenDropdownRowId(null);
      setDropdownAnchor(null);
      setUserOpenedDropdown(false);
    }
  };

  const [allSelected, setAllSelected] = useState(false);
  const handleSelectAllToggle = () => {
    const items = Object.values(data)
      .flat()
      .filter(
        (item) =>
          drawnFeatures.some((f) => f.get("id") === item.id) &&
          item.id !== activeDrawingRow
      );
    items.forEach((item) => handleCheckboxChange(item.id, !allSelected));
    setAllSelected(!allSelected);
  };

  const handleAddItem = async (item) => {
    try {
      setData((prevData) => {
        const category = item.type === "Feature" ? "Features" : "Activities";
        return {
          ...prevData,
          [category]: [...prevData[category], item],
        };
      });
      showSnackbar(`${item.name} was successfully added!`);
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const handleFinishSession = () => {
    setActiveDrawingRow(null);
    drawRef.current?.setActive(false);
    drawnFeatures.forEach((feature) =>
      handleCheckboxChange(feature.get("id"), false)
    );
  };

  useEffect(() => {
    if (!openDropdownRowId) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setOpenDropdownRowId(null);
      setUserOpenedDropdown(false);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [openDropdownRowId]);

  const filteredData = data[selectedCategory]
    .filter(
      (row) =>
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        row.id !== activeDrawingRow
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "Name":
          return a.name.localeCompare(b.name);
        case "Color":
          return a.color.localeCompare(b.color);
        case "Active":
          return (
            (visibilityMap[b.id] ?? false) - (visibilityMap[a.id] ?? false)
          );
        case "Inactive":
          return (
            (visibilityMap[a.id] ?? false) - (visibilityMap[b.id] ?? false)
          );
        case "Drawings":
          return (
            drawnFeatures.filter((f) => f.get("id") === b.id).length -
            drawnFeatures.filter((f) => f.get("id") === a.id).length
          );
        case "Recent":
          if (a.id === lastSelectedId) return -1;
          if (b.id === lastSelectedId) return 1;
          return 0;
        default:
          return 0;
      }
    });

  const stickyRow = activeDrawingRow
    ? Object.values(data)
        .flat()
        .find((row) => row.id === activeDrawingRow)
    : null;

  return (
    <Box
      ref={menuRef}
      sx={{
        position: "absolute",
        top: isOpen ? `calc(20px + env(safe-area-inset-top))` : "20px",
        left: { xs: 1, sm: 5, lg: 10 },
        zIndex: 1000,
        bgcolor: isOpen ? "background.paper" : "transparent",
        p: 1.5,
        borderRadius: 2,
        boxShadow: 3,
        width: { xs: "60vw", sm: "45vw", md: "40vw", lg: "370px" },
        maxWidth: 360,
        maxHeight: isOpen ? "77vh" : stickyRow ? "25vh" : "8vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "max-height 0.4s ease, bgcolor 0.3s ease",
      }}
    >
      <Button
        onClick={toggleOpen}
        variant="contained"
        color="primary"
        sx={{
          mb: 2,
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          borderRadius: "24px",
          px: 3,
          py: 1.25,
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "0 4px 8px rgba(0, 86, 179, 0.3)",
        }}
      >
        {isOpen ? <ExpandLess /> : <ExpandMore />}
        {isOpen ? "Hide Menu" : "Show Menu"}
      </Button>

      {isOpen && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              justifyContent: "space-between",
            }}
          >
            <CategoryTabs
              categories={categoryList}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
            <SortSelect
              sortOption={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            />
          </Box>

          <SearchField
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
          />

          {stickyRow && (
            <Box sx={{ mb: 2 }}>
              <DataRow
                row={stickyRow}
                deleteRow={deleteRow}
                openDropdownRowId={openDropdownRowId}
                setOpenDropdownRowId={setOpenDropdownRowId}
                dropdownAnchor={dropdownAnchor}
                setDropdownAnchor={setDropdownAnchor}
                userOpenedDropdown={userOpenedDropdown}
                setUserOpenedDropdown={setUserOpenedDropdown}
              />
            </Box>
          )}

          <Box
            ref={scrollContainerRef}
            sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}
          >
            {isLoading ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "text.secondary",
                  py: 5,
                }}
              >
                <CircularProgress color="primary" size={40} thickness={4} />
                <Typography variant="body1" sx={{ mt: 2, fontWeight: 500 }}>
                  Loading data...
                </Typography>
              </Box>
            ) : filteredData.length > 0 ? (
              filteredData.map((row) => (
                <DataRow
                  key={row.id}
                  row={row}
                  deleteRow={deleteRow}
                  openDropdownRowId={openDropdownRowId}
                  setOpenDropdownRowId={setOpenDropdownRowId}
                  dropdownAnchor={dropdownAnchor}
                  setDropdownAnchor={setDropdownAnchor}
                  userOpenedDropdown={userOpenedDropdown}
                  setUserOpenedDropdown={setUserOpenedDropdown}
                />
              ))
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                  mt: 4,
                  userSelect: "none",
                }}
              >
                <SearchOffIcon
                  sx={{ fontSize: 48, mb: 1, color: "primary.main" }}
                />
                <Box
                  sx={{
                    mb: 3,
                    fontWeight: 500,
                    fontSize: "1.1rem",
                    color: "primary.main",
                  }}
                >
                  No results found
                </Box>
              </Box>
            )}
          </Box>

          <Divider />

          <Box
            sx={{
              mt: 3,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 2,
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              userSelect: "none",
            }}
          >
            {/* Select All */}
            <Tooltip
              title={
                allSelected ? "Deselect All Drawings" : "Select All Drawings"
              }
            >
              <Box
                onClick={handleSelectAllToggle}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <IconButton
                  size="large"
                  sx={{
                    color: allSelected ? "primary.main" : "grey.700",
                    fontSize: 30,
                    p: 0,
                  }}
                  disableRipple
                >
                  {allSelected ? (
                    <CheckBoxIcon fontSize="inherit" />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize="inherit" />
                  )}
                </IconButton>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    mt: 0.5,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </Typography>
              </Box>
            </Tooltip>

            {/* Add Item */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AddItemDialog onAdd={handleAddItem} />
            </Box>

            {/* Clear All */}
            <Tooltip title="Clear All Drawings">
              <Box
                onClick={() => {
                  if (drawnFeatures.length === 0) return;
                  setConfirmProps({
                    title: "Clear All Drawings",
                    description: "Are you sure you want to clear all drawings?",
                    onConfirm: clearAllDrawings,
                  });
                  setConfirmOpen(true);
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: drawnFeatures.length > 0 ? "pointer" : "default",
                }}
              >
                <IconButton
                  disabled={drawnFeatures.length === 0}
                  size="large"
                  sx={{
                    color: drawnFeatures.length > 0 ? "error.main" : "grey.400",
                    fontSize: 30,
                    p: 0,
                  }}
                  disableRipple
                >
                  <DeleteSweepIcon fontSize="inherit" />
                </IconButton>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    mt: 0.5,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  Clear Drawings
                </Typography>
              </Box>
            </Tooltip>

            {/* Show Labels */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Switch
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                color="primary"
              />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  mt: -0.4,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {showLabels ? "Hide Labels" : "Show Labels"}
              </Typography>
            </Box>
          </Box>

          <FinishSessionButton onFinish={handleFinishSession} />
          <UserInfo />

          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title={confirmProps.title}
            description={confirmProps.description}
            onConfirm={confirmProps.onConfirm}
          />
        </>
      )}
    </Box>
  );
};

export default DataMenu;

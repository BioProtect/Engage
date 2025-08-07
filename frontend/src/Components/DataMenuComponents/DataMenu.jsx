import { useState, useEffect } from "react";
import { Box, Button, Divider, IconButton, Tooltip } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import LayersIcon from "@mui/icons-material/Layers";
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
import CircularProgress from "@mui/material/CircularProgress";
import { Typography } from "@mui/material";

const DataMenu = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    Features: [],
    Activities: [],
  });

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
        Features: transform(fetchedData.Features || []),
        Activities: transform(fetchedData.Activities || []),
      };

      setData(formattedData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
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
    geoTiffLayer,
    map,
    drawRef,
    vectorSource,
    setDrawnFeatures,
    setSelectedFeature,
    setActiveDrawingRow,
    visibilityMap,
    handleCheckboxChange,
    showSnackbar,
  } = useMapContext();

  const [geoTiffVisible, setGeoTiffVisible] = useState(true);
  const toggleGeoTiffLayer = () => {
    if (geoTiffLayer && map) {
      geoTiffLayer.setVisible(!geoTiffVisible);
      setGeoTiffVisible(!geoTiffVisible);
    }
  };

  const clearAllDrawings = () => {
    drawnFeatures.forEach((feature) => {
      vectorSource.removeFeature(feature);
      const featureId = feature.get("id");
      handleCheckboxChange(featureId, false);
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
  };

  const [allSelected, setAllSelected] = useState(false);

  const handleSelectAllToggle = () => {
    if (!allSelected) {
      Object.values(data)
        .flat()
        .filter((item) => {
          const hasDrawings = drawnFeatures.some(
            (feature) => feature.get("id") === item.id
          );
          return hasDrawings && item.id !== activeDrawingRow;
        })
        .forEach((item) => {
          handleCheckboxChange(item.id, true);
        });
    } else {
      Object.values(data)
        .flat()
        .filter((item) => {
          const hasDrawings = drawnFeatures.some(
            (feature) => feature.get("id") === item.id
          );
          return hasDrawings && item.id !== activeDrawingRow;
        })
        .forEach((item) => {
          handleCheckboxChange(item.id, false);
        });
    }
    setAllSelected(!allSelected);
  };

  const handleAddItem = async (item) => {
    try {
      await loadData();
      showSnackbar(item.name + " was sucessfully added!");
    } catch (error) {
      console.error("Failed to add item or refresh data:", error);
    }
  };

  const handleFinishSession = () => {
    setActiveDrawingRow(null);
    drawRef.current?.setActive(false);

    drawnFeatures.forEach((feature) => {
      const featureId = feature.get("id");
      handleCheckboxChange(featureId, false);
    });
  };

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
        case "Active": {
          const aVisible = visibilityMap[a.id] ?? false;
          const bVisible = visibilityMap[b.id] ?? false;
          return bVisible - aVisible;
        }
        case "Inactive": {
          const aVisible = visibilityMap[a.id] ?? false;
          const bVisible = visibilityMap[b.id] ?? false;
          return aVisible - bVisible;
        }
        case "Drawings": {
          const aCount = drawnFeatures.filter(
            (f) => f.get("id") === a.id
          ).length;
          const bCount = drawnFeatures.filter(
            (f) => f.get("id") === b.id
          ).length;
          return bCount - aCount;
        }
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
      sx={{
        position: "absolute",
        top: { xs: 1, sm: 5, lg: 10 },
        left: { xs: 1, sm: 5, lg: 10 },
        zIndex: 1000,
        bgcolor: "background.paper",
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        width: { xs: "60vw", sm: "45vw", md: "40vw", lg: "370px" },
        maxWidth: 370,
        maxHeight: isOpen ? 600 : stickyRow ? 170 : 60,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "max-height 0.4s ease",
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
              marginBottom: 2,
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
        </>
      )}

      {stickyRow && (
        <Box sx={{ marginBottom: 2 }}>
          <DataRow row={stickyRow} deleteRow={deleteRow} />
        </Box>
      )}

      {isOpen && (
        <>
          <Box sx={{ flexGrow: 1, overflowY: "auto", paddingRight: 1 }}>
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
                <DataRow key={row.id} row={row} deleteRow={deleteRow} />
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
              marginTop: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              userSelect: "none",
            }}
          >
            <Tooltip
              title={
                allSelected ? "Deselect All Drawings" : "Select All Drawings"
              }
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={handleSelectAllToggle}
                aria-label={
                  allSelected ? "Deselect All Drawings" : "Select All Drawings"
                }
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleSelectAllToggle();
                }}
              >
                <IconButton
                  size="large"
                  sx={{
                    color: allSelected ? "primary.main" : "grey.700",
                    fontSize: 28,
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
                <Box
                  component="span"
                  sx={{
                    fontSize: 11,
                    fontWeight: 500,
                    fontFamily:
                      "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    color: "text.primary",
                    mt: 0.5,
                    letterSpacing: 0.15,
                    userSelect: "none",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    height: 16,
                  }}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </Box>
              </Box>
            </Tooltip>

            <Tooltip
              title={
                geoTiffVisible ? "Hide GeoTIFF Layer" : "Show GeoTIFF Layer"
              }
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  userSelect: "none",
                }}
                onClick={toggleGeoTiffLayer}
                aria-label={
                  geoTiffVisible ? "Hide GeoTIFF Layer" : "Show GeoTIFF Layer"
                }
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleGeoTiffLayer();
                }}
              >
                <IconButton
                  size="large"
                  sx={{
                    color: geoTiffVisible ? "success.main" : "grey.700",
                    fontSize: 28,
                    p: 0,
                  }}
                  disableRipple
                >
                  <LayersIcon fontSize="inherit" />
                </IconButton>
                <Box
                  component="span"
                  sx={{
                    fontSize: 11,
                    fontWeight: 500,
                    fontFamily:
                      "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    color: "text.primary",
                    mt: 0.5,
                    letterSpacing: 0.15,
                    userSelect: "none",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    height: 16,
                  }}
                >
                  GeoTIFF
                </Box>
              </Box>
            </Tooltip>

            <AddItemDialog onAdd={handleAddItem} />

            <Tooltip title="Clear All Drawings">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  userSelect: "none",
                }}
                aria-label="Clear All Drawings"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (
                    (e.key === "Enter" || e.key === " ") &&
                    drawnFeatures.length > 0
                  )
                    clearAllDrawings();
                }}
              >
                <IconButton
                  disabled={drawnFeatures.length === 0}
                  size="large"
                  sx={{
                    color: drawnFeatures.length > 0 ? "error.main" : "grey.400",
                    fontSize: 28,
                    p: 0,
                  }}
                  disableRipple
                  onClick={clearAllDrawings}
                >
                  <DeleteSweepIcon fontSize="inherit" />
                </IconButton>
                <Box
                  component="span"
                  sx={{
                    fontSize: 11,
                    fontWeight: 500,
                    fontFamily:
                      "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    color: drawnFeatures.length > 0 ? "error.main" : "grey.400",
                    mt: 0.5,
                    letterSpacing: 0.15,
                    userSelect: "none",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    height: 16,
                  }}
                >
                  Clear Drawings
                </Box>
              </Box>
            </Tooltip>
          </Box>

          <FinishSessionButton onFinish={handleFinishSession} />
          <UserInfo></UserInfo>
        </>
      )}
    </Box>
  );
};

export default DataMenu;

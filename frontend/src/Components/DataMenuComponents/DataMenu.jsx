import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState } from "react";

import AddItemDialog from "./AddItemDialog";
import BioProtectLogo from "../../images/bioprotect_nobgrnd.png";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CategoryTabs from "./CategoryTabs";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CircularProgress from "@mui/material/CircularProgress";
import ConfirmDialog from "./ConfirmDialog";
import DataRow from "./DataRow";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import Divider from "@mui/material/Divider";
import FinishSessionButton from "./FinishButton";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchField from "./Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import SortSelect from "./SortSelect";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import UserInfo from "../Authentication/UserInfo";
import { get_drawing_items } from "../../Api/DataMenuApi";
import { useColorContext } from "../../Contexts/ColorContext";
import { useMapContext } from "../../Contexts/MapContext";

const DataMenu = () => {
  const menuRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ Features: [], Activities: [] });
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [openDropdownRowId, setOpenDropdownRowId] = useState(null);
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const [userOpenedDropdown, setUserOpenedDropdown] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Features");
  const [sortOption, setSortOption] = useState("Name");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: "",
    description: "",
    onConfirm: () => {},
  });
  const [allSelected, setAllSelected] = useState(false);
  const { generateColor } = useColorContext();

  const categoryList = ["Features", "Activities"];

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const fetchedData = get_drawing_items();
        const transform = (arr) =>
          arr.map(({ id, name, description, type, eunis2022code }) => ({
            id,
            name,
            description,
            type,
            eunis2022code,
            color: generateColor(id),
          }));

        const formattedData = {
          Features: transform(fetchedData?.Features || []),
          Activities: transform(fetchedData?.Activities || []),
        };

        setData(formattedData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [generateColor]);

  useEffect(() => {
    if (activeDrawingRow) setLastSelectedId(activeDrawingRow);
  }, [activeDrawingRow]);

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

    if (drawRef.current) map.removeInteraction(drawRef.current);

    if (openDropdownRowId === rowId) {
      setOpenDropdownRowId(null);
      setDropdownAnchor(null);
      setUserOpenedDropdown(false);
    }
  };

  const handleSelectAllToggle = () => {
    const items = Object.values(data)
      .flat()
      .filter(
        (item) =>
          drawnFeatures.some((f) => f.get("id") === item.id) &&
          item.id !== activeDrawingRow,
      );
    items.forEach((item) => handleCheckboxChange(item.id, !allSelected));
    setAllSelected((prev) => !prev);
  };

  const handleAddItem = (item) => {
    setData((prevData) => {
      const category = item.type === "Features" ? "Features" : "Activities";
      return { ...prevData, [category]: [...prevData[category], item] };
    });
    showSnackbar(`${item.name} was successfully added!`);
  };

  const handleFinishSession = () => {
    setActiveDrawingRow(null);
    drawRef.current?.setActive(false);
    drawnFeatures.forEach((feature) =>
      handleCheckboxChange(feature.get("id"), false),
    );
  };

  const filteredData = useMemo(() => {
    let drawingCounts = null;
    if (sortOption === "Drawings") {
      drawingCounts = {};
      drawnFeatures.forEach((f) => {
        const id = f.get("id");
        drawingCounts[id] = (drawingCounts[id] || 0) + 1;
      });
    }

    return data[selectedCategory]
      .filter((row) =>
        row.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
            return (drawingCounts[b.id] || 0) - (drawingCounts[a.id] || 0);
          case "Recent":
            if (a.id === lastSelectedId) return -1;
            if (b.id === lastSelectedId) return 1;
            return 0;
          default:
            return 0;
        }
      });
  }, [
    data,
    selectedCategory,
    searchQuery,
    drawnFeatures,
    visibilityMap,
    lastSelectedId,
    sortOption,
  ]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <Box
      ref={menuRef}
      sx={{
        position: "absolute",
        top: isOpen ? `calc(20px + env(safe-area-inset-top))` : "20px",
        left: { xs: 1, sm: 5, lg: 10 },
        zIndex: 1000,
        bgcolor: isOpen ? "rgba(255, 255, 255, 0.5)" : "transparent",
        backdropFilter: isOpen ? "blur(8px)" : "none",
        border: isOpen ? "1px solid rgba(255, 255, 255, 0.35)" : "none",
        p: 1.5,
        borderRadius: 2,
        boxShadow: 3,
        width: { xs: "60vw", sm: "45vw", md: "40vw", lg: "370px" },
        maxWidth: 360,
        maxHeight: isOpen ? "77vh" : "8vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "max-height 0.4s ease, bgcolor 0.3s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 1.5,
        }}
      >
        <img
          width="58px"
          src={BioProtectLogo}
          alt="bioprotect logo"
          loading="lazy"
        />
        <Typography
          sx={{
            color: "primary.main",
            display: "flex",
            alignItems: "center",
          }}
        >
          BioProtect Engage
        </Typography>
        <Button
          onClick={toggleOpen}
          variant="contained"
          color="primary"
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            px: 3,
            py: 1.25,
            boxShadow: "0 4px 8px rgba(0, 86, 179, 0.3)",
          }}
        >
          <MenuIcon />
          Menu
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </Button>
      </Box>

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
            onSearchChange={setSearchQuery}
          />

          {/* Scrollable Data Rows */}
          <Box
            ref={scrollContainerRef}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              pr: 1,
              "&::-webkit-scrollbar": { width: 5 },
              "&::-webkit-scrollbar-track": {
                borderRadius: 10,
                bgcolor: "rgba(255,255,255,0.1)",
              },
              "&::-webkit-scrollbar-thumb": {
                borderRadius: 10,
                bgcolor: "rgba(25, 118, 210, 0.3)",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                bgcolor: "rgba(25, 118, 210, 0.55)",
              },
            }}
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
                  featureType={selectedCategory}
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
              bgcolor: "rgba(255, 255, 255, 0.4)",
              p: 2,
              borderRadius: 3,
              border: "1px solid rgba(200, 215, 240, 0.7)",
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

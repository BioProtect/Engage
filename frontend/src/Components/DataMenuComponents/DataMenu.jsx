import { Box, Button, Divider, IconButton, Tooltip } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import AddItemDialog from './AddItemDialog';
import CategoryTabs from './CategoryTabs';
import DataRow from './DataRow';
import FinishSessionButton from './FinishButton';
import LayersIcon from '@mui/icons-material/Layers';
import SearchField from './Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import SnackbarNotification from './SnackbarNotification';
import SortSelect from './SortSelect';
import { useMapContext } from '../../Contexts/MapContext';
import { useState } from 'react';

const DataMenu = () => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  const [data, setData] = useState({
    Features: [
      { id: 1, Name: 'Coral Reef', color: '#FF6666', description: 'A diverse underwater ecosystem found in warm ocean waters.' },
      { id: 2, Name: 'Fresh Water', color: '#8A2BE2', description: 'A habitat of rivers, lakes, and ponds that are low in salt content.' },
      { id: 3, Name: 'Kelp Forest', color: '#32CD32', description: 'A coastal underwater forest of giant kelp plants, home to many species.' },
      { id: 4, Name: 'Open Ocean', color: '#1E90FF', description: 'The vast, deep waters of the ocean away from the coast.' },
      { id: 5, Name: 'Salt Marsh', color: '#D2691E', description: 'A coastal ecosystem of salt-tolerant plants and tidal waters.' },
    ],
    Activities: [
      { id: 10, Name: 'Overfishing', color: '#FF4500', description: 'The depletion of fish species due to excessive fishing.' },
      { id: 11, Name: 'Pollution', color: '#2E8B57', description: 'The introduction of harmful substances into the environment.' },
      { id: 12, Name: 'Rain', color: '#4169E1', description: 'Precipitation in the form of water droplets falling from the sky.' },
      { id: 13, Name: 'Wind', color: '#FFD700', description: 'The movement of air from high to low pressure areas.' },
    ],
  });

  const categoryList = ['Features', 'Activities'];
  const [selectedCategory, setSelectedCategory] = useState(categoryList[0]);
  const handleCategoryChange = (category) => setSelectedCategory(category);

  const [sortOption, setSortOption] = useState('Name');
  const handleSortChange = (event) => setSortOption(event.target.value);

  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const {
    activeDrawingRow,
    selectedFeature,
    setSelectedFeature,
    drawnFeatures,
    setDrawnFeatures,
    vectorSource,
    geoTiffLayer,
    map,
    drawRef,
    setActiveDrawingRow
  } = useMapContext();

  const [geoTiffVisible, setGeoTiffVisible] = useState(true);
  const toggleGeoTiffLayer = () => {
    if (geoTiffLayer && map) {
      geoTiffLayer.setVisible(!geoTiffVisible);
      setGeoTiffVisible(!geoTiffVisible);
    }
  };

  const [visibilityMap, setVisibilityMap] = useState({});
  const handleCheckboxSelection = (id) => {
    setVisibilityMap((prev) => ({ ...prev, [id]: !prev[id] }));
    setSelectedFeature(null);
  };
  const handleCheckboxChange = (id, isVisible) =>
    setVisibilityMap((prev) => ({ ...prev, [id]: isVisible }));

  const deleteRow = (rowId) => {
    const newData = { ...data };
    Object.keys(newData).forEach((category) => {
      newData[category] = newData[category].filter((row) => row.id !== rowId);
    });
    setData(newData);
    map.removeInteraction(drawRef.current);
    handleSnackbarOpen('Row deleted successfully!');
  };

  const filteredData = data[selectedCategory]
    .filter(
      (row) =>
        row.Name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        row.id !== activeDrawingRow
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'Name':
          return a.Name.localeCompare(b.Name);
        case 'Color':
          return a.color.localeCompare(b.color);
        case 'Active': {
          const aVisible = visibilityMap[a.id] ?? false;
          const bVisible = visibilityMap[b.id] ?? false;
          return bVisible - aVisible;
        }
        case 'Inactive': {
          const aVisible = visibilityMap[a.id] ?? false;
          const bVisible = visibilityMap[b.id] ?? false;
          return aVisible - bVisible;
        }
        case 'Drawings': {
          const aDrawingCount = drawnFeatures.filter(
            (f) => f.get('id') === a.id
          ).length;
          const bDrawingCount = drawnFeatures.filter(
            (f) => f.get('id') === b.id
          ).length;
          return bDrawingCount - aDrawingCount;
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

  const handleAddItem = (item) => {
    const newId = Math.max(...data[item.Category].map((i) => i.id)) + 1;
    const newData = {
      ...data,
      [item.Category]: [
        ...data[item.Category],
        { ...item, id: newId, color: item.Color || '#000000' },
      ],
    };
    setData(newData);
    handleSnackbarOpen('Item added successfully!');
  };

  const handleFinishSession = () => {
    setActiveDrawingRow(null);
    map.removeInteraction(drawRef.current);

    drawnFeatures.forEach((feature) => {
      const featureId = feature.get('id');
      handleCheckboxChange(featureId, false);
    });
    handleSnackbarOpen('Session sucessfully saved!');
  };

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarOpen = (message) => {
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: { xs: 1, sm: 5, lg: 10 },         // theme.spacing(1) = 8px
        left: { xs: 1, sm: 5, lg: 10 },
        zIndex: 1000,

        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 2,
        boxShadow: 3,

        /* fluid width: 90% on xs, 370px on sm+ */
        width: { xs: '60vw', sm: '45vw', md: '40vw', lg: '370px' },
        maxWidth: 370,

        /* maxHeight + transition copied from your inline style */
        maxHeight: isOpen ? 600 : stickyRow ? 170 : 60,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'max-height 0.4s ease',
      }}
    >


      <Button
        onClick={toggleOpen}
        variant="contained"
        color="primary"
        sx={{
          mb: 2,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          borderRadius: '24px',
          px: 3,
          py: 1.25,
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 4px 8px rgba(0, 86, 179, 0.3)',
        }}
      >
        {isOpen ? <ExpandLess /> : <ExpandMore />}
        {isOpen ? 'Hide Menu' : 'Show Menu'}
      </Button>

      {isOpen && (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 2,
              justifyContent: 'space-between',
            }}
          >
            <CategoryTabs
              categories={categoryList}
              selectedCategory={selectedCategory}
              onSelect={handleCategoryChange}
            />
            <SortSelect sortOption={sortOption} onChange={handleSortChange} />
          </Box>

          <SearchField searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        </>
      )}

      {stickyRow && (
        <Box sx={{ marginBottom: 2 }}>
          <DataRow
            row={stickyRow}
            visibilityMap={visibilityMap}
            handleCheckboxSelection={handleCheckboxSelection}
            handleCheckboxChange={handleCheckboxChange}
            deleteRow={deleteRow}
          />
        </Box>
      )}

      {isOpen && (
        <>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', paddingRight: 1 }}>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <DataRow
                  key={row.id}
                  row={row}
                  visibilityMap={visibilityMap}
                  handleCheckboxSelection={handleCheckboxSelection}
                  handleCheckboxChange={handleCheckboxChange}
                  deleteRow={deleteRow}
                />
              ))
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  mt: 4,
                  userSelect: 'none',
                }}
              >
                <SearchOffIcon sx={{ fontSize: 48, mb: 1, color: 'primary.main' }} />
                <Box sx={{ mb: 3, fontWeight: 500, fontSize: '1.1rem', color: 'primary.main' }}>
                  No results found
                </Box>
              </Box>
            )}
          </Box>

          <Divider />

          <Box
            sx={{
              marginTop: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <AddItemDialog onAdd={handleAddItem} />

            <Tooltip title={geoTiffVisible ? 'Hide GeoTIFF Layer' : 'Show GeoTIFF Layer'}>
              <IconButton
                sx={{ color: geoTiffVisible ? 'green' : 'gray' }}
                onClick={toggleGeoTiffLayer}
              >
                <LayersIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <FinishSessionButton onFinish={handleFinishSession} />
        </>
      )}

      <SnackbarNotification
        open={openSnackbar}
        message={snackbarMessage}
        onClose={handleSnackbarClose}
      />
    </Box>
  );
};

export default DataMenu;

import React, { useState } from 'react';
import { Box, Divider, IconButton, Tooltip } from '@mui/material';
import { useMapContext } from '../../Contexts/MapContext';
import AddItemDialog from './AddItemDialog';
import CategoryTabs from './CategoryTabs';
import SortSelect from './SortSelect';
import TogglePanel from './TogglePanel';
import DataRow from './DataRow';
import FinishSessionButton from './FinishButton';
import SearchField from './Search';
import DeleteIcon from '@mui/icons-material/Delete';
import LayersIcon from '@mui/icons-material/Layers';

const DataMenu = () => {
  const [data, setData] = useState({
    ecosystem: [
      { id: 1, Name: 'Coral Reef', color: '#FF0000' },
      { id: 2, Name: 'Fresh Water', color: '#00FF00' },
      { id: 3, Name: 'Kelp Forest', color: '#0000FF' },
      { id: 4, Name: 'Open Ocean', color: '#FFA500' },
      { id: 5, Name: 'Salt Marsh', color: '#800080' },
    ],
    impacts: [
      { id: 10, Name: 'Overfishing', color: '#FF0000' },
      { id: 11, Name: 'Pollution', color: '#00FF00' },
      { id: 12, Name: 'Rain', color: '#0000FF' },
      { id: 13, Name: 'Wind', color: '#FFA500' },
    ],
  });

  const categoryList = ['ecosystem', 'impacts'];
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
  } = useMapContext();

  const [geoTiffVisible, setGeoTiffVisible] = useState(true);
  const toggleGeoTiffLayer = () => {
    if (geoTiffLayer && map) {
      geoTiffLayer.setVisible(!geoTiffVisible);
      setGeoTiffVisible(!geoTiffVisible);
    }
  };

  const [visibilityMap, setVisibilityMap] = useState({});
  const handleCheckboxSelection = (id) =>
    setVisibilityMap((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleCheckboxChange = (id, isVisible) =>
    setVisibilityMap((prev) => ({ ...prev, [id]: isVisible }));

  const deleteRow = (rowId) => {
    const newData = { ...data };
    Object.keys(newData).forEach((category) => {
      newData[category] = newData[category].filter((row) => row.id !== rowId);
    });
    setData(newData);
  };

  const handleDeleteSelectedFeature = () => {
    if (selectedFeature) {
      vectorSource.removeFeature(selectedFeature);
      setDrawnFeatures((prev) => prev.filter((f) => f !== selectedFeature));
      setSelectedFeature(null);
    }
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
  };

  const handleFinishSession = () => {
  };

  const getRowStyle = (rowId) =>
    rowId === activeDrawingRow
      ? {
          boxShadow: '0 0 10px 2px rgba(0, 0, 255, 0.7)',
          backgroundColor: '#f0f8ff',
        }
      : {};

  return (
    <TogglePanel>
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

      {stickyRow && (
        <Box sx={{ marginBottom: 2 }}>
          <DataRow
            row={stickyRow}
            visibilityMap={visibilityMap}
            handleCheckboxSelection={handleCheckboxSelection}
            handleCheckboxChange={handleCheckboxChange}
            deleteRow={deleteRow}
            style={getRowStyle(stickyRow.id)}
          />
        </Box>
      )}

      <Box sx={{ flexGrow: 1, overflowY: 'auto', paddingRight: 1 }}>
        {filteredData.map((row) => (
          <DataRow
            key={row.id}
            row={row}
            visibilityMap={visibilityMap}
            handleCheckboxSelection={handleCheckboxSelection}
            handleCheckboxChange={handleCheckboxChange}
            deleteRow={deleteRow}
            style={getRowStyle(row.id)}
          />
        ))}
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

        <IconButton
          sx={{ color: selectedFeature ? 'red' : 'gray' }}
          disabled={!selectedFeature}
          onClick={handleDeleteSelectedFeature}
        >
          <DeleteIcon />
        </IconButton>

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
    </TogglePanel>
  );
};

export default DataMenu;

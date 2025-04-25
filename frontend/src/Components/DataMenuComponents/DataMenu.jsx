import React, { useState } from 'react';
import { Box, Divider, IconButton } from '@mui/material';
import { useMapContext } from '../../Contexts/MapContext';
import AddItemDialog from './AddItemDialog';
import CategoryTabs from './CategoryTabs';
import SortSelect from './SortSelect';
import TogglePanel from './TogglePanel';
import DataRow from './DataRow';
import FinishSessionButton from './FinishButton';
import SearchField from './Search'; 
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DeleteIcon from '@mui/icons-material/Delete';

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

  const [activeDrawingRow, setActiveDrawingRow] = useState(null);
  const [visibilityMap, setVisibilityMap] = useState({});

  const { drawnFeatures } = useMapContext();

  const getDrawingCount = (id) => (drawnFeatures?.filter((f) => f.get('id') === id).length) || 0;

  const handleCheckboxSelection = (id) => setVisibilityMap((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleCheckboxChange = (id, isVisible) => setVisibilityMap((prev) => ({ ...prev, [id]: isVisible }));


  const deleteRow = (rowId) => {
    const newData = { ...data };
    Object.keys(newData).forEach((category) => {
      newData[category] = newData[category].filter((row) => row.id !== rowId);
    });
    setData(newData);
  };

  const filteredData = data[selectedCategory].filter(
    (row) => row.Name.toLowerCase().includes(searchQuery.toLowerCase()) && row.id !== activeDrawingRow
  );

  const stickyRow = activeDrawingRow ? Object.values(data).flat().find((row) => row.id === activeDrawingRow) : null;

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

  return (
    <TogglePanel>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, justifyContent: 'space-between' }}>
        <CategoryTabs categories={categoryList} selectedCategory={selectedCategory} onSelect={handleCategoryChange} />
        <SortSelect sortOption={sortOption} onChange={handleSortChange} />
      </Box>

      {/* Use the SearchField component */}
      <SearchField searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      {stickyRow && (
        <Box sx={{ marginBottom: 2 }}>
          <DataRow
            row={stickyRow}
            visibilityMap={visibilityMap}
            handleCheckboxSelection={handleCheckboxSelection}
            handleCheckboxChange={handleCheckboxChange}
            getDrawingCount={getDrawingCount}
            activeDrawingRow={activeDrawingRow}
            setActiveDrawingRow={setActiveDrawingRow}
            deleteRow={deleteRow}
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
            getDrawingCount={getDrawingCount}
            activeDrawingRow={activeDrawingRow}
            setActiveDrawingRow={setActiveDrawingRow}
            deleteRow={deleteRow}
          />
        ))}
      </Box>

      <Divider />
      

      <Box sx={{ marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <AddItemDialog onAdd={handleAddItem} />
        <IconButton
          sx={{ color: 'gray' }}
          onClick={() => console.log('Undo action')}
        >
          <UndoIcon />
        </IconButton>
        <IconButton
          sx={{ color: 'gray' }}
          onClick={() => console.log('Redo action')}
        >
          <RedoIcon />
        </IconButton>
        <IconButton
          sx={{ color: 'red' }}
          onClick={() => console.log('Delete action')}
        >
          <DeleteIcon />
        </IconButton>

      </Box>
      <FinishSessionButton onFinish={handleFinishSession} />
    </TogglePanel>
  );
};

export default DataMenu;

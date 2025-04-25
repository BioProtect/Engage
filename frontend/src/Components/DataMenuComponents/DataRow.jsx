import React, { useState } from 'react';
import { Checkbox, Paper, Box, Typography, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';  
import ClearIcon from '@mui/icons-material/Clear';  
import DrawingComponent from '../DrawingComponent/Draw'; 
import { useMapContext } from '../../Contexts/MapContext';

const DataRow = ({
  row,
  visibilityMap,
  handleCheckboxSelection,
  handleCheckboxChange,
  getDrawingCount,
  activeDrawingRow,
  setActiveDrawingRow,
  deleteRow, 
}) => {
  const [SettingsMenu, setSettingsMenu] = useState(null);
  const open = Boolean(SettingsMenu);
  const { vectorSource, drawnFeatures, setDrawnFeatures } = useMapContext();

 
  const clearRowDrawings = (rowId) => {
    drawnFeatures.forEach((feature) => {
      if (feature.get('id') === rowId) {
        vectorSource.removeFeature(feature);
      }
    });
    setDrawnFeatures((prev) => prev.filter((feature) => feature.get('id') !== rowId));
  };

 
  const handleSettingsMenuClick = (event) => {
    setSettingsMenu(event.currentTarget);
  };

  
  const handleSettingsMenuClose = () => {
    setSettingsMenu(null);
  };

  
  const handleDeleteRow = () => {
    clearRowDrawings(row.id); 
    deleteRow(row.id);
    handleSettingsMenuClose();
  };

  
  const drawingCount = getDrawingCount(row.id);
  const canToggleCheckbox = drawingCount > 0; 

  return (
    <Paper
      key={row.id}
      elevation={1}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 1.5,
        marginBottom: 1.5,
        borderRadius: 2,
        border: '1px solid #ddd',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          aria-label="more"
          aria-controls={`menu-${row.id}`}
          aria-haspopup="true"
          onClick={handleSettingsMenuClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id={`menu-${row.id}`}
          anchorEl={SettingsMenu}
          open={open}
          onClose={handleSettingsMenuClose}
        >
          <MenuItem
            onClick={() => clearRowDrawings(row.id)}
            disabled={drawingCount === 0} 
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <IconButton aria-label="clear" sx={{ color: 'blue' }}>
              <ClearIcon />
            </IconButton>
            Clear All Drawings
          </MenuItem>
          
          <Divider />

          <MenuItem onClick={handleDeleteRow} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'red' }}>
            <IconButton aria-label="delete" sx={{ color: 'red' }}>
              <DeleteIcon />
            </IconButton>
            Delete
          </MenuItem>
        </Menu>
        <Checkbox
          checked={visibilityMap[row.id] === true}
          onChange={() => handleCheckboxSelection(row.id)}
          size="small"
          disabled={!canToggleCheckbox}
        />
        <Typography variant="body1" fontWeight="bold">
          {row.Name} ({drawingCount})
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 25,
            height: 25,
            backgroundColor: row.color,
            border: '1px solid #999',
            borderRadius: '4px',
          }}
        />
        <DrawingComponent
          name={row.Name}
          rowId={row.id}
          isActive={activeDrawingRow === row.id}
          setActiveDrawingRow={setActiveDrawingRow}
          rowColor={row.color}
          visible={visibilityMap[row.id] === true}
          handleCheckboxChange={handleCheckboxChange}
        />
      </Box>
    </Paper>
  );
};

export default DataRow;

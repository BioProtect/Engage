import React, { useState } from 'react';
import {
  Checkbox,
  Paper,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import InfoIcon from '@mui/icons-material/Info';
import DrawingComponent from '../DrawingComponent/Draw';
import { useMapContext } from '../../Contexts/MapContext';

const InfoDialog = ({ open, onClose, name, description }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{name} Information</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">Close</Button>
    </DialogActions>
  </Dialog>
);

const DataRow = ({
  row,
  visibilityMap,
  handleCheckboxSelection,
  handleCheckboxChange,
  deleteRow,
}) => {
  const [SettingsMenu, setSettingsMenu] = useState(null);
  const open = Boolean(SettingsMenu);
  const {
    vectorSource,
    drawnFeatures,
    setDrawnFeatures,
    activeDrawingRow,
    setSelectedFeature,
  } = useMapContext();

  const [infoOpen, setInfoOpen] = useState(false);

  const clearRowDrawings = (rowId) => {
    drawnFeatures.forEach((feature) => {
      if (feature.get('id') === rowId) {
        vectorSource.removeFeature(feature);
      }
    });
    if (activeDrawingRow !== rowId) {
      handleCheckboxChange(rowId, false);
    }

    setSelectedFeature(null);
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

  const getDrawingCount = (id) => (drawnFeatures?.filter((f) => f.get('id') === id).length) || 0;
  const drawingCount = getDrawingCount(row.id);
  const canToggleCheckbox = drawingCount > 0;

  return (
    <>
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
          border: row.id === activeDrawingRow
            ? '2px solid #64b5f6'
            : '1px solid #ddd',
          backgroundColor: row.id === activeDrawingRow ? '#80d6ff' : 'transparent',
          boxShadow: row.id === activeDrawingRow
            ? '0 0 15px rgba(66, 165, 245, 0.9)'
            : 'none',
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

            <MenuItem
              onClick={handleDeleteRow}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'red' }}
            >
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
            disabled={row.id === activeDrawingRow || !canToggleCheckbox}
          />

          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{ display: 'flex', alignItems: 'center', gap: 0 }}
          >
            <Tooltip title="Show info">
              <IconButton
                size="small"
                onClick={() => setInfoOpen(true)}
                aria-label="info"
                sx={{
                  padding: '4px',
                  color: '#1976d2',
                  marginRight: '4px',
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {row.Name}
            <Box component="span" sx={{ marginLeft: 0.5 }}>
              ({drawingCount})
            </Box>
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
            rowColor={row.color}
            visible={visibilityMap[row.id] === true}
            handleCheckboxChange={handleCheckboxChange}
          />
        </Box>
      </Paper>

      <InfoDialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        name={row.Name}
        description={row.description}
      />
    </>
  );
};

export default DataRow;

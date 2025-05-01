import React from 'react';
import { FormControl, Select, MenuItem, ListItemIcon, Typography } from '@mui/material';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LayersClearIcon from '@mui/icons-material/LayersClear';

const SortSelect = ({ sortOption, onChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 130 }}>
      <Select value={sortOption} onChange={onChange} displayEmpty>
        <MenuItem value="Name">
          <ListItemIcon sx={{ minWidth: 30 }}>
            <SortByAlphaIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ display: 'inline' }}>Name</Typography>
        </MenuItem>
        <MenuItem value="Color">
          <ListItemIcon sx={{ minWidth: 30 }}>
            <PaletteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ display: 'inline' }}>Color</Typography>
        </MenuItem>
        <MenuItem value="Active">
          <ListItemIcon sx={{ minWidth: 30 }}>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ display: 'inline' }}>Active</Typography>
        </MenuItem>
        <MenuItem value="Inactive">
          <ListItemIcon sx={{ minWidth: 30 }}>
            <CancelIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ display: 'inline' }}>Inactive</Typography>
        </MenuItem>
        <MenuItem value="Drawings">
          <ListItemIcon sx={{ minWidth: 30 }}>
            <LayersClearIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ display: 'inline' }}>Drawings</Typography>
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default SortSelect;

import React from 'react';
import { FormControl, Select, MenuItem, ListItemIcon, Typography } from '@mui/material';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LayersClearIcon from '@mui/icons-material/LayersClear';

const options = [
  { value: 'Name', label: 'Name', icon: <SortByAlphaIcon fontSize="small" /> },
  { value: 'Color', label: 'Color', icon: <PaletteIcon fontSize="small" /> },
  { value: 'Active', label: 'Active', icon: <CheckCircleIcon fontSize="small" /> },
  { value: 'Inactive', label: 'Inactive', icon: <CancelIcon fontSize="small" /> },
  { value: 'Drawings', label: 'Drawings', icon: <LayersClearIcon fontSize="small" /> },
];

const SortSelect = ({ sortOption, onChange }) => {
  // Find the selected option object so we can render icon + label in renderValue
  const selectedOption = options.find((opt) => opt.value === sortOption);

  return (
    <FormControl size="small" sx={{ minWidth: 130 }}>
      <Select
        value={sortOption}
        onChange={onChange}
        displayEmpty
        renderValue={() => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              {selectedOption?.icon}
            </ListItemIcon>
            <Typography variant="body2" sx={{ display: 'inline' }}>
              {selectedOption?.label || ''}
            </Typography>
          </div>
        )}
      >
        {options.map(({ value, label, icon }) => (
          <MenuItem key={value} value={value}>
            <ListItemIcon sx={{ minWidth: 30 }}>{icon}</ListItemIcon>
            <Typography variant="body2" sx={{ display: 'inline' }}>
              {label}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SortSelect;

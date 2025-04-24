// SortSelect.js
import React from 'react';
import { FormControl, Select, MenuItem } from '@mui/material';

const SortSelect = ({ sortOption, onChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <Select value={sortOption} onChange={onChange} displayEmpty>
        <MenuItem value="Name">Sort by Name</MenuItem>
        <MenuItem value="Color">Sort by Color</MenuItem>
        <MenuItem value="Active">Sort by Active</MenuItem>
        <MenuItem value="Inactive">Sort by Inactive</MenuItem>
      </Select>
    </FormControl>
  );
};

export default SortSelect;

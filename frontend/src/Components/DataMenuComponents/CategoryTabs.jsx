import React from 'react';
import { Box } from '@mui/material';

const CategoryTabs = ({ categories, selectedCategory, onSelect }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {categories.map((category) => (
        <Box
          key={category}
          onClick={() => onSelect(category)}
          sx={{
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px 4px 0 0',
            backgroundColor: selectedCategory === category ? '#1976d2' : '#f5f5f5',
            color: selectedCategory === category ? 'white' : '#1976d2',
            marginRight: 1,
          }}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Box>
      ))}
    </Box>
  );
};

export default CategoryTabs;

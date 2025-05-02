import React from 'react';
import { Box } from '@mui/material';
import NatureIcon from '@mui/icons-material/Nature'; 
import WarningIcon from '@mui/icons-material/Warning'; 

const CategoryTabs = ({ categories, selectedCategory, onSelect }) => {
  const categoryIcons = {
    ecosystem: <NatureIcon fontSize="small" />, 
    impacts: <WarningIcon fontSize="small" />,  
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {categories.map((category) => (
        <Box
          key={category}
          onClick={() => onSelect(category)}
          sx={{
            padding: '8px 12px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px 4px 0 0',
            backgroundColor: selectedCategory === category ? '#1976d2' : '#f5f5f5',
            color: selectedCategory === category ? 'white' : '#1976d2',
            marginRight: 1,
            display: 'flex', 
            alignItems: 'center',
            gap: '3px', 
            maxWidth: '90px', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden',
          }}
        >
          {categoryIcons[category]} 
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Box>
      ))}
    </Box>
  );
};

export default CategoryTabs;

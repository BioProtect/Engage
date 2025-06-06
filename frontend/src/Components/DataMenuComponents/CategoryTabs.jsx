import React from 'react';
import { Box } from '@mui/material';
import NatureIcon from '@mui/icons-material/Nature'; 
import WarningIcon from '@mui/icons-material/Warning'; 

const CategoryTabs = ({ categories, selectedCategory, onSelect }) => {
  const categoryIcons = {
    Features: <NatureIcon fontSize="small" />, 
    Activities: <WarningIcon fontSize="small" />,  
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <Box
            key={category}
            onClick={() => onSelect(category)}
            sx={{
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '4px 4px 0 0',
              backgroundColor: isSelected ? '#1976d2' : '#f5f5f5',
              color: isSelected ? 'white' : '#1976d2',
              marginRight: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              maxWidth: '90px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              boxShadow: isSelected
                ? '0 0 8px 3px rgba(25, 118, 210, 0.7)'
                : 'none',
              transition: 'box-shadow 0.3s ease, background-color 0.3s ease, color 0.3s ease',
              '&:hover': {
                backgroundColor: isSelected ? '#1976d2' : 'rgba(25, 118, 210, 0.1)',
              },
            }}
          >
            {categoryIcons[category]}
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Box>
        );
      })}
    </Box>
  );
};

export default CategoryTabs;

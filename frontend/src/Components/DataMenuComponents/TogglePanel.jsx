import React, { useState } from 'react';
import { Button } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material'; 

const TogglePanel = ({ children, initialOpen = true, width = '370px', height = '600px' }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <div
      style={{
        width,
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0px 0px 15px rgba(0,0,0,0.1)',
        zIndex: 1000,
        height: isOpen ? height : '50px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'height 0.3s ease',
      }}
    >
      <Button
        onClick={toggleOpen}
        variant="contained"
        color="primary"
        sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}
      >
        {isOpen ? <ExpandLess /> : <ExpandMore />} 
        {isOpen ? 'Hide Menu' : 'Show Menu'}
      </Button>

      {isOpen && children}
    </div>
  );
};

export default TogglePanel;

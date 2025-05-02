import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useMapContext } from '../../Contexts/MapContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 

const FinishSessionButton = ({ onFinish }) => {
  const { drawnFeatures, vectorSource, setDrawnFeatures } = useMapContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    if (drawnFeatures && drawnFeatures.length > 0) {
      setIsButtonEnabled(true);  
    } else {
      setIsButtonEnabled(false); 
    }
  }, [drawnFeatures]);

  const clearAllDrawings = () => {
    drawnFeatures.forEach((feature) => {
      vectorSource.removeFeature(feature); 
    });
    setDrawnFeatures([]); 
  };

  const handleFinishSessionClick = () => {
    if (drawnFeatures && drawnFeatures.length > 0) {
      setOpenDialog(true);
    } else {
      alert("No drawings to save.");
    }
  };

  const handleSaveSession = () => {
    clearAllDrawings(); 
    onFinish(); 
    setOpenDialog(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); 
  };

  return (
    <>
      <Button
        variant="contained" 
        color="primary"  
        onClick={handleFinishSessionClick}
        disabled={!isButtonEnabled} 
        sx={{ marginTop: 2 }}
        startIcon={<CheckCircleIcon />} 
      >
        Finish Session
      </Button>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 8, 
            padding: 3, 
            backgroundColor: '#f5f5f5', 
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)', 
          }
        }}
      >
        <DialogTitle sx={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Finish Session</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: '#555' }}>
            Are you sure you would like to save the session and clear all drawings? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
      
          <Button
            onClick={handleCloseDialog}
            color="error"  
            variant="contained"  
          >
            Cancel
          </Button>
         
          <Button
            onClick={handleSaveSession}
            color="primary"  
            variant="contained" 
          >
            Save & Clear
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FinishSessionButton;

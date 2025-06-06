// InfoDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const InfoDialog = ({ open, onClose, title, description }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" fontSize="large" />
          <Typography variant="h6" component="span" color="primary">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 2 }}>
        <DialogContentText component="div" sx={{ whiteSpace: 'pre-line', fontSize: '1rem' }}>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pr: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 2,
            boxShadow: '0 2px 8px rgb(25 118 210 / 0.3)',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoDialog;

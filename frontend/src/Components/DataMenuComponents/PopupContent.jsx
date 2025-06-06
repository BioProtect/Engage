import React from 'react';
import { IconButton, Tooltip, Slider, Typography, Box, Stack, Divider, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

const PopupContent = ({
  density,
  onChange,
  drawingName,
  onSave,
  onDelete,
  onClose,
  description,
  onDescriptionChange,
}) => (
  <Box
    sx={{
      position: 'relative',
      backgroundColor: 'white',
      borderRadius: 2,
      p: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      width: 200,
      height: 250,
      userSelect: 'none',
      fontFamily: 'Roboto, sans-serif',
    }}
  >
    <IconButton
      size="small"
      onClick={onClose}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        color: 'grey.600',
      }}
      aria-label="close"
    >
      <CloseIcon fontSize="small" />
    </IconButton>

    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      {drawingName}
    </Typography>

    <Divider sx={{ mb: 2 }} />

    <Typography variant="body2" gutterBottom>
      Density: {density}
    </Typography>
    <Slider
      value={density}
      min={1}
      max={100}
      size="small"
      onChange={onChange}
      aria-label="density slider"
      sx={{ mb: 3 }}
    />

    <TextField
      label="Description"
      value={description}
      onChange={(e) => onDescriptionChange(e.target.value)}
      variant="outlined"
      size="small"
      multiline
      maxRows={3}
      sx={{ mb: 3, width: '100%' }}
    />

    <Divider sx={{ mb: 2 }} />

    <Stack direction="row" spacing={2} justifyContent="center">
      <Tooltip title="Save">
        <IconButton color="primary" onClick={onSave} aria-label="save">
          <SaveIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton color="error" onClick={onDelete} aria-label="delete">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Stack>

    <Box
      sx={{
        position: 'absolute',
        bottom: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '8px solid white',
        filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.1))',
        pointerEvents: 'none',
      }}
    />
  </Box>
);

export default PopupContent;

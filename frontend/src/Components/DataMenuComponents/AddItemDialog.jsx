import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle'; 

const AddNewItem = ({ onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    Name: '',
    Description: '',
    Category: 'ecosystem',
    Color: '#000000',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    if (newItem.Name && newItem.Description && newItem.Color) {
      onAdd(newItem);
      setShowModal(false);
      setNewItem({
        Name: '',
        Description: '',
        Category: 'ecosystem',
        Color: '#000000',
      });
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setNewItem({
      Name: '',
      Description: '',
      Category: 'ecosystem',
      Color: '#000000',
    });
  };

  const isFormValid = newItem.Name && newItem.Description && newItem.Color;

  return (
    <div>
      <IconButton
        color="primary"
        onClick={() => setShowModal(true)}
        sx={{
          width: 40,  
          height: 40, 
          padding: 0,
        }}
      >
        <AddCircleIcon sx={{ fontSize: 30 }} />
      </IconButton>

      <Dialog open={showModal} onClose={handleCancel}>
        <DialogTitle>Create New Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="Name"
            value={newItem.Name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            name="Description"
            value={newItem.Description}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="Category"
              value={newItem.Category}
              onChange={handleInputChange}
              label="Category"
            >
              <MenuItem value="ecosystem">Ecosystem</MenuItem>
              <MenuItem value="impacts">Impacts</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Color"
            type="color"
            name="Color"
            value={newItem.Color}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}  
            color="error"  
            variant="contained"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddItem}
            color="primary"
            variant="contained" 
            disabled={!isFormValid}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddNewItem;

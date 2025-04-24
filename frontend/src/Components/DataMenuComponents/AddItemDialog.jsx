// components/AddNewItem.jsx
import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

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
    onAdd(newItem);
    setShowModal(false);
    setNewItem({
      Name: '',
      Description: '',
      Category: 'ecosystem',
      Color: '#000000',
    });
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() => setShowModal(true)}
        sx={{ marginTop: 2 }}
      >
        Add New Item
      </Button>

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
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
          <Button onClick={() => setShowModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddItem} color="primary">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddNewItem;

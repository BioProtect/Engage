import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const SearchField = ({ searchQuery, onSearchChange }) => {
  const handleClear = () => {
    onSearchChange({ target: { value: "" } });
  };

  return (
    <TextField
      fullWidth
      value={searchQuery}
      onChange={onSearchChange}
      variant="outlined"
      size="small"
      sx={{
        marginBottom: 2,
        borderRadius: "20px",
        "& .MuiOutlinedInput-root": {
          borderRadius: "20px",
        },
        "& .MuiInputLabel-root": {
          fontSize: "1rem",
        },
        "& .MuiOutlinedInput-input": {
          paddingLeft: "0.75rem",
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: 20 }} />
          </InputAdornment>
        ),
        endAdornment: searchQuery && (
          <InputAdornment position="end">
            <IconButton onClick={handleClear}>
              <ClearIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchField;

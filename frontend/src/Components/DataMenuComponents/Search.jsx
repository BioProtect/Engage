import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";

// Inline 32px search field that takes the place of the category tabs.
// The close button clears the query and hands the space back.
const SearchField = ({ searchQuery, onSearchChange, onClose }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      height: 32,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      pl: "10px",
      mr: "4px",
      borderRadius: "9px",
      color: "text.secondary",
      bgcolor: (t) => alpha(t.palette.primary.main, 0.09),
      "&:focus-within": { outline: "2px solid", outlineColor: "primary.main" },
    }}
  >
    <SearchIcon sx={{ fontSize: 18 }} />
    <InputBase
      autoFocus
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search"
      inputProps={{ "aria-label": "Search items" }}
      sx={{ flex: 1, minWidth: 0, fontSize: 13, color: "text.primary" }}
    />
    <IconButton
      aria-label="Clear and close search"
      onClick={() => {
        onSearchChange("");
        onClose();
      }}
      sx={{ width: 28, height: 28, p: 0, color: "text.secondary" }}
    >
      <CloseIcon sx={{ fontSize: 18 }} />
    </IconButton>
  </Box>
);

export default SearchField;

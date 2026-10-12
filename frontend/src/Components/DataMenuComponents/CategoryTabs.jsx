import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";

// Segmented control: one segment per category, with its item count.
const CategoryTabs = ({ categories, selectedCategory, onSelect, counts }) => (
  <Box
    role="tablist"
    aria-label="Category"
    sx={{
      flex: 1,
      minWidth: 0,
      display: "flex",
      bgcolor: (t) => alpha(t.palette.primary.main, 0.09),
      borderRadius: "9px",
      p: "2px",
      mr: "4px",
    }}
  >
    {categories.map((category) => {
      const isSelected = selectedCategory === category;
      return (
        <ButtonBase
          key={category}
          role="tab"
          aria-selected={isSelected}
          onClick={() => onSelect(category)}
          sx={{
            flex: 1,
            minWidth: 0,
            height: 28,
            borderRadius: "7px",
            fontFamily: "inherit",
            fontWeight: 600,
            fontSize: 12,
            whiteSpace: "nowrap",
            color: isSelected ? "primary.contrastText" : "primary.main",
            bgcolor: isSelected ? "primary.main" : "transparent",
            "&.Mui-focusVisible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 1,
            },
          }}
        >
          {category}
          <Box
            component="span"
            sx={{ ml: "4px", fontSize: 10, fontWeight: 500, opacity: 0.75 }}
          >
            {counts[category]}
          </Box>
        </ButtonBase>
      );
    })}
  </Box>
);

export default CategoryTabs;

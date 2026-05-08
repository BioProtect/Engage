import { Box, Typography } from "@mui/material";
import PhishingIcon from "@mui/icons-material/Phishing";
import SetMealIcon from "@mui/icons-material/SetMeal";

const categoryIcons = {
  Features: <SetMealIcon fontSize="small" />,
  Activities: <PhishingIcon fontSize="small" />,
};

const CategoryTabs = ({ categories, selectedCategory, onSelect }) => {
  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "rgba(255,255,255,0.35)",
        borderRadius: "12px",
        p: "3px",
        gap: "3px",
        border: "1px solid rgba(255,255,255,0.5)",
        backdropFilter: "blur(6px)",
      }}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <Box
            key={category}
            onClick={() => onSelect(category)}
            sx={{
              px: 1.5,
              py: 0.75,
              cursor: "pointer",
              borderRadius: "9px",
              backgroundColor: isSelected
                ? "rgba(25, 118, 210, 0.85)"
                : "transparent",
              color: isSelected ? "#fff" : "#1976d2",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.2s ease",
              boxShadow: isSelected
                ? "0 2px 8px rgba(25, 118, 210, 0.4)"
                : "none",
              "&:hover": {
                backgroundColor: isSelected
                  ? "rgba(25, 118, 210, 0.85)"
                  : "rgba(25, 118, 210, 0.12)",
              },
            }}
          >
            {categoryIcons[category]}
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: "0.8rem", whiteSpace: "nowrap" }}
            >
              {category}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default CategoryTabs;

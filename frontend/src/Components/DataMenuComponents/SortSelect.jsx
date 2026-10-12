import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  ListItemIcon,
  Typography,
} from "@mui/material";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import PaletteIcon from "@mui/icons-material/Palette";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const options = [
  {
    value: "Name",
    label: "Name",
    icon: <SortByAlphaIcon fontSize="small" color="primary" />,
  },
  {
    value: "Color",
    label: "Color",
    icon: <PaletteIcon fontSize="small" sx={{ color: "purple" }} />,
  },
  {
    value: "Drawings",
    label: "Drawings",
    icon: <EditIcon fontSize="small" sx={{ color: "orange" }} />,
  },
  {
    value: "Recent",
    label: "Recent",
    icon: <AccessTimeIcon fontSize="small" color="action" />,
  },
  {
    value: "Active",
    label: "Active",
    icon: <CheckBoxIcon fontSize="small" color="success" />,
  },
  {
    value: "Inactive",
    label: "Inactive",
    icon: <CheckBoxOutlineBlankIcon fontSize="small" color="disabled" />,
  },
];

const SortSelect = ({ sortOption, onChange }) => {
  const selectedOption = options.find((opt) => opt.value === sortOption);

  return (
    <FormControl size="small" sx={{ minWidth: 110 }}>
      <Select
        value={sortOption}
        onChange={onChange}
        displayEmpty
        MenuProps={{
          PaperProps: {
            sx: {
              "& .MuiMenuItem-root": {
                borderRadius: 1,
                mx: 0.5,
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.1)" },
                "&.Mui-selected": {
                  bgcolor: "rgba(25, 118, 210, 0.15)",
                  "&:hover": { bgcolor: "rgba(25, 118, 210, 0.2)" },
                },
              },
            },
          },
        }}
        sx={{
          bgcolor: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(6px)",
          borderRadius: 2,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.5)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(25, 118, 210, 0.4)",
          },
        }}
        renderValue={() => (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ListItemIcon sx={{ minWidth: 26 }}>
              {selectedOption?.icon}
            </ListItemIcon>
            <Typography variant="body2" sx={{ display: "inline" }}>
              {selectedOption?.label || ""}
            </Typography>
          </div>
        )}
      >
        {options.map(({ value, label, icon }) => (
          <MenuItem key={value} value={value}>
            <ListItemIcon sx={{ minWidth: 26 }}>{icon}</ListItemIcon>
            <Typography variant="body2" sx={{ display: "inline" }}>
              {label}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SortSelect;

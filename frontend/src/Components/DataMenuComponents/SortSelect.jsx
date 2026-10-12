import React, { useState } from "react";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PaletteIcon from "@mui/icons-material/Palette";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import SortIcon from "@mui/icons-material/Sort";
import Tooltip from "@mui/material/Tooltip";
import { iconButtonSx } from "../../theme";

const options = [
  { value: "Name", icon: <SortByAlphaIcon fontSize="small" /> },
  { value: "Color", icon: <PaletteIcon fontSize="small" /> },
  { value: "Drawings", icon: <EditIcon fontSize="small" /> },
  { value: "Recent", icon: <AccessTimeIcon fontSize="small" /> },
  { value: "Active", icon: <CheckBoxIcon fontSize="small" /> },
  { value: "Inactive", icon: <CheckBoxOutlineBlankIcon fontSize="small" /> },
];

// Sort button: opens a menu of the six sort orders, ticking the current one.
const SortSelect = ({ sortOption, onChange }) => {
  const [anchor, setAnchor] = useState(null);

  return (
    <>
      <Tooltip title={`Sort: ${sortOption}`}>
        <IconButton
          aria-label={`Sort, currently by ${sortOption}`}
          aria-haspopup="menu"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={iconButtonSx}
        >
          <SortIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        {options.map(({ value, icon }) => (
          <MenuItem
            key={value}
            selected={value === sortOption}
            onClick={() => {
              onChange(value);
              setAnchor(null);
            }}
            sx={{ fontSize: 13, minHeight: 36 }}
          >
            <ListItemIcon sx={{ color: "primary.main" }}>{icon}</ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13 }}>
              {value}
            </ListItemText>
            {value === sortOption && (
              <CheckIcon sx={{ fontSize: 18, ml: 2, color: "primary.main" }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default SortSelect;

import React, { useState } from "react";

import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import LogoutIcon from "@mui/icons-material/Logout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PersonIcon from "@mui/icons-material/Person";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { iconButtonSx } from "../../theme";
import { useAuth } from "../../Contexts/AuthenticationContext";
import { useMapStable } from "../../Contexts/MapContext";

// Account button for the data menu footer; renders nothing when signed out.
const UserInfo = () => {
  const { user, logout } = useAuth();
  const { showSnackbar } = useMapStable();
  const [anchor, setAnchor] = useState(null);

  if (!user) return null;

  const handleLogout = () => {
    setAnchor(null);
    logout();
    showSnackbar(user.username + " has logged out!");
  };

  return (
    <>
      <Tooltip title="Account">
        <IconButton
          aria-label={`Account: ${user.username}`}
          aria-haspopup="menu"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ ...iconButtonSx, color: "primary.main" }}
        >
          <PersonIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        <Typography
          sx={{ px: 2, py: 0.75, fontSize: 13, fontWeight: 700 }}
          color="text.primary"
        >
          {user.username}
        </Typography>
        <MenuItem onClick={handleLogout} sx={{ fontSize: 13 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserInfo;

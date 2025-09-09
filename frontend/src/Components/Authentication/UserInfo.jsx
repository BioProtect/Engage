import React from "react";
import { Button, Typography, Box, Divider } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../../Contexts/AuthenticationContext";
import { useMapContext } from "../../Contexts/MapContext";

const UserInfo = () => {
  const { user, logout } = useAuth();

  const { showSnackbar } = useMapContext();

  const handleLogout = () => {
    logout();
    showSnackbar(user.username + " has logged out!");
  };

  if (!user) return null;

  return (
    <>
      <Divider sx={{ my: 1, borderColor: "rgba(0, 0, 0, 0.2)" }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1,
          borderRadius: 3,
          border: "1px solid rgba(0, 0, 0, 0.15)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon sx={{ color: "#2196f3" }} />
          <Typography sx={{ fontWeight: "bold", color: "#2196f3" }}>
            {user.username}
          </Typography>
        </Box>

        <Button
          onClick={handleLogout}
          variant="contained"
          color="primary"
          size="small"
          startIcon={<LogoutIcon />}
          sx={{
            fontWeight: 600,
            textTransform: "none",
            px: 2.5,
            py: 1,
            borderRadius: 2,
            boxShadow: "0 4px 14px rgba(25, 118, 210, 0.25)",
          }}
        >
          Sign Out
        </Button>
      </Box>
    </>
  );
};

export default UserInfo;

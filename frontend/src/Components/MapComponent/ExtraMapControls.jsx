import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useMapStable } from "../../Contexts/MapContext";

const ExtraMapControls = ({ map }) => {
  const { showSnackbar } = useMapStable();

  const handleHome = () => {
    if (map) {
      const view = map.getView();
      view.animate({ center: [-8, 53], zoom: 4, duration: 500 });
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation || !map) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        map
          .getView()
          .animate({ center: [longitude, latitude], zoom: 12, duration: 500 });
      },
      (err) => {
        console.error("Geolocation failed:", err);
        showSnackbar("Unable to get your location.", "error");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <Tooltip title="Zoom Out to Full World">
        <IconButton
          size="medium"
          onClick={handleHome}
          sx={{ bgcolor: "white", "&:hover": { bgcolor: "#e3f2fd" } }}
        >
          <HomeIcon color="primary" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Go to My Location">
        <IconButton
          size="medium"
          onClick={handleGeolocate}
          sx={{ bgcolor: "white", "&:hover": { bgcolor: "#e8f5e9" } }}
        >
          <MyLocationIcon sx={{ color: "#2e7d32" }} />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default ExtraMapControls;

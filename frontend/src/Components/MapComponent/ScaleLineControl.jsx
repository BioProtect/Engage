import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const NICE_NUMBERS = [
  1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000,
  100000, 200000, 500000, 1000000,
];

const formatDistance = (meters) => {
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${Number.isInteger(km) ? km : km.toFixed(1)} km`;
  }
  return `${meters} m`;
};

const ScaleLineControl = ({ map, targetPixels = 120 }) => {
  const [scale, setScale] = useState(null);

  useEffect(() => {
    if (!map) return;

    const update = () => {
      const view = map.getView();
      const resolution = view.getResolution();
      const center = view.getCenter();
      if (!resolution || !center) return;

      const latRad = (center[1] * Math.PI) / 180;
      const mpp = resolution * Math.cos(latRad);
      if (!mpp || mpp <= 0) return;

      const targetMeters = mpp * targetPixels;
      const nice =
        NICE_NUMBERS.find((n) => n >= targetMeters) ??
        NICE_NUMBERS[NICE_NUMBERS.length - 1];
      const pixels = Math.round(nice / mpp);

      setScale({ pixels, label: formatDistance(nice) });
    };

    const view = map.getView();
    view.on("change:resolution", update);
    view.on("change:center", update);
    update();

    return () => {
      view.un("change:resolution", update);
      view.un("change:center", update);
    };
  }, [map, targetPixels]);

  if (!scale) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: "calc(18px + env(safe-area-inset-bottom, 0px))",
        left: "calc(18px + env(safe-area-inset-left, 0px))",
        zIndex: 1000,
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
        px: 1.5,
        pt: 0.75,
        pb: 1,
        background: "rgba(255,255,255,0.5)",
        backdropFilter: "blur(8px)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.4)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "#1a1a2e",
          letterSpacing: "0.4px",
          lineHeight: 1,
        }}
      >
        {scale.label}
      </Typography>

      {/* Scale bar */}
      <Box sx={{ width: scale.pixels, position: "relative", height: 10 }}>
        {/* Gradient fill */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 2,
            right: 2,
            height: 3,
            borderRadius: "999px",
            background:
              "linear-gradient(90deg, rgba(25,118,210,0.35), #1976d2)",
          }}
        />
        {/* Left tick */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "2px",
            height: "100%",
            bgcolor: "#1976d2",
            borderRadius: "1px",
          }}
        />
        {/* Quarter tick */}
        <Box
          sx={{
            position: "absolute",
            left: "25%",
            bottom: 0,
            width: "1.5px",
            height: "55%",
            bgcolor: "rgba(25,118,210,0.5)",
            borderRadius: "1px",
          }}
        />
        {/* Mid tick */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 0,
            width: "1.5px",
            height: "70%",
            bgcolor: "rgba(25,118,210,0.7)",
            borderRadius: "1px",
          }}
        />
        {/* Three-quarter tick */}
        <Box
          sx={{
            position: "absolute",
            left: "75%",
            bottom: 0,
            width: "1.5px",
            height: "55%",
            bgcolor: "rgba(25,118,210,0.5)",
            borderRadius: "1px",
          }}
        />
        {/* Right tick */}
        <Box
          sx={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: "2px",
            height: "100%",
            bgcolor: "#1976d2",
            borderRadius: "1px",
          }}
        />
      </Box>
    </Box>
  );
};

export default ScaleLineControl;

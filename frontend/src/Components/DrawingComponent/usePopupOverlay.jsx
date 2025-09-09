import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Overlay } from "ol";
import { useMapContext } from "../../Contexts/MapContext";
import {
  IconButton,
  Slider,
  Typography,
  Box,
  Stack,
  TextField,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

const allOverlays = [];

export const PopupContent = ({
  density,
  onChange,
  drawingName,
  drawingNumber,
  areaLabel,
  onSave,
  onDelete,
  onClose,
  description,
  onDescriptionChange,
  direction = "top",
  zoom = 10,
}) => {
  const maxLength = 50;
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const scale = Math.min(Math.max(zoom / 10, 0.8), 1.5);
  const fontSize = isSmall ? 12 * scale : 14 * scale;
  const sliderSize = Math.max(8 * scale, 6);

  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        borderRadius: 1.5,
        p: 1.5 * scale,
        minWidth: 160 * scale,
        maxWidth: isSmall ? "80vw" : 260 * scale,
        width: "fit-content",
        fontFamily: "Roboto, sans-serif",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.4)",
        color: "#222",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ position: "relative", textAlign: "center", mb: 1 }}>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: -18,
            right: -10,
            color: "rgba(0,0,0,0.6)",
          }}
          aria-label="close"
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Heading */}
        <Typography
          variant="h6"
          sx={{
            mb: 0.5,
            fontSize: fontSize + 2,
            fontWeight: "bold",
            color: "#000",
          }}
        >
          {drawingName}
        </Typography>

        {/* Drawing number and distance */}
        <Typography
          variant="body2"
          sx={{
            fontSize: fontSize - 2,
            fontWeight: "normal",
            color: "#000",
          }}
        >
          {`Drawing ${drawingNumber}${areaLabel ? ` (${areaLabel})` : ""}`}
        </Typography>
      </Box>

      {/* Slick modern divider */}
      <Divider sx={{ borderColor: "rgba(0,0,0,0.2)", mb: 1 }} />

      {/* Density */}
      <Typography variant="body2" sx={{ fontSize: fontSize - 2, mb: 0.5 }}>
        Density: {density}
      </Typography>
      <Slider
        value={density}
        min={1}
        max={100}
        size="small"
        onChange={onChange}
        aria-label="density slider"
        sx={{
          mb: 0.5,
          height: 6,
          "& .MuiSlider-track": {
            border: "none",
            background: "linear-gradient(90deg, #2196f3, #64b5f6)",
          },
          "& .MuiSlider-rail": {
            opacity: 0.3,
            backgroundColor: "#bdbdbd",
          },
          "& .MuiSlider-thumb": {
            width: 16,
            height: 16,
            backgroundColor: "#fff",
            border: "2px solid #2196f3",
            "&:hover": {
              boxShadow: "0 0 0 8px rgba(33,150,243,0.16)",
            },
            "&.Mui-active": {
              boxShadow: "0 0 0 14px rgba(33,150,243,0.16)",
            },
          },
          "& .MuiSlider-valueLabel": {
            backgroundColor: "#2196f3",
            color: "#fff",
            fontSize: 12,
          },
        }}
      />

      {/* Description */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <TextField
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          variant="filled"
          size="small"
          inputProps={{
            maxLength,
            style: {
              fontSize: fontSize - 2,
              padding: `${6 * scale}px ${8 * scale}px`,
              color: "#222",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 6 * scale,
            },
            placeholder: "Add Description",
          }}
          InputProps={{
            disableUnderline: true,
            sx: {
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 1,
              "& input": {
                padding: `${6 * scale}px ${8 * scale}px`,
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.25)",
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(255,255,255,0.3)",
                boxShadow: "0 0 6px rgba(255,255,255,0.6)",
              },
            },
          }}
          sx={{ flexGrow: 1 }}
        />
        <Typography
          sx={{
            ml: 0.5,
            fontSize: fontSize - 4,
            color: "rgba(0,0,0,0.6)",
            userSelect: "none",
            minWidth: 32,
            textAlign: "right",
          }}
        >
          {description.length} / {maxLength}
        </Typography>
      </Box>

      {/* Action buttons */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ mb: 0, transform: `scale(${scale})` }}
      >
        <IconButton
          color="primary"
          onClick={onSave}
          aria-label="save"
          size="small"
          sx={{ p: "4px" }}
        >
          <SaveIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          onClick={onDelete}
          aria-label="delete"
          size="small"
          sx={{ p: "4px" }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Pointer */}
      {direction === "top" && (
        <Box
          sx={{
            position: "absolute",
            top: -6 * scale,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: `${6 * scale}px solid transparent`,
            borderRight: `${6 * scale}px solid transparent`,
            borderBottom: `${6 * scale}px solid #fff`,
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
      {direction === "bottom" && (
        <Box
          sx={{
            position: "absolute",
            bottom: -6 * scale,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: `${6 * scale}px solid transparent`,
            borderRight: `${6 * scale}px solid transparent`,
            borderTop: `${6 * scale}px solid #fff`,
            filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.3))",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
    </Box>
  );
};

export const usePopupOverlay = ({
  map,
  selectedFeature,
  density,
  description,
  setDensity,
  setDescription,
  setSelectedFeature,
  handleDelete,
  visibilityMap,
  activeDrawingRow,
  selectRef,
}) => {
  const overlayRef = useRef(null);
  const rootRef = useRef(null);
  const { showSnackbar } = useMapContext();
  const [zoom, setZoom] = useState(map?.getView().getZoom() || 10);

  useEffect(() => {
    if (!map) return;
    const view = map.getView();
    const updateZoom = () => setZoom(view.getZoom());
    view.on("change:resolution", updateZoom);
    return () => view.un("change:resolution", updateZoom);
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const isVisible = visibilityMap?.[activeDrawingRow] !== false;
    if (!selectedFeature || !isVisible) {
      if (overlayRef.current) {
        map.removeOverlay(overlayRef.current);
        allOverlays.splice(
          allOverlays.findIndex((o) => o.overlay === overlayRef.current),
          1
        );
        const rootToUnmount = rootRef.current;
        if (rootToUnmount) queueMicrotask(() => rootToUnmount.unmount());
        overlayRef.current = null;
        rootRef.current = null;
      }
      return;
    }

    const geom = selectedFeature.getGeometry();
    if (!geom) return;

    const coords =
      geom.getType() === "Polygon"
        ? geom.getCoordinates()[0]
        : geom.getCoordinates();

    let topPoint = coords[0];
    let bottomPoint = coords[0];
    coords.forEach((pt) => {
      if (pt[1] > topPoint[1]) topPoint = pt;
      if (pt[1] < bottomPoint[1]) bottomPoint = pt;
    });

    const topPixel = map.getPixelFromCoordinate(topPoint);
    const popupHeightPx = 140;
    const showAbove = topPixel[1] - popupHeightPx > 0;

    const positioning = showAbove ? "bottom-center" : "top-center";
    const offset = showAbove ? [0, -8] : [0, 8];
    const popupCoordinate = showAbove ? topPoint : bottomPoint;

    if (!overlayRef.current) {
      allOverlays.forEach(({ overlay, root }) => {
        map.removeOverlay(overlay);
        root?.unmount();
      });
      allOverlays.length = 0;

      const container = document.createElement("div");
      const root = ReactDOM.createRoot(container);
      const overlay = new Overlay({
        element: container,
        position: popupCoordinate,
        positioning,
        offset,
        stopEvent: true,
      });
      map.addOverlay(overlay);

      overlayRef.current = overlay;
      rootRef.current = root;
      allOverlays.push({ overlay, root });
    } else {
      overlayRef.current.setPosition(popupCoordinate);
      overlayRef.current.setPositioning(positioning);
      overlayRef.current.setOffset(offset);
    }

    const direction = showAbove ? "bottom" : "top";

    rootRef.current.render(
      <PopupContent
        density={density}
        description={description}
        drawingName={selectedFeature?.get("name") || ""}
        drawingNumber={selectedFeature?.get("drawingNumber")}
        areaLabel={selectedFeature?.get("areaLabel")}
        onChange={(e, val) => setDensity(val)}
        onDescriptionChange={setDescription}
        onSave={() => {
          if (selectedFeature) {
            selectedFeature.set("density", density);
            selectedFeature.set("description", description);
          }
          setSelectedFeature(null);
          showSnackbar("Successfully saved density/description");
          selectRef.current?.getFeatures().clear();
        }}
        onDelete={handleDelete}
        onClose={() => {
          setSelectedFeature(null);
          selectRef.current?.getFeatures().clear();
        }}
        direction={direction}
        zoom={zoom}
      />
    );
  }, [
    map,
    selectedFeature,
    density,
    description,
    visibilityMap,
    activeDrawingRow,
    setDensity,
    setDescription,
    setSelectedFeature,
    handleDelete,
    selectRef,
    showSnackbar,
    zoom,
  ]);
};

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Popper,
  useTheme,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMapContext } from "../../Contexts/MapContext";
import SuccessSnackbar from "../DataMenuComponents/SnackBar";
import { createFeatureStyle } from "./FeatureStyle";

const DrawingDropdown = ({ anchorEl, open, onClose, row }) => {
  const {
    map,
    selectRef,
    setSelectedFeature,
    vectorSource,
    setDrawnFeatures,
    handleCheckboxChange,
    rowRefs,
    drawnFeatures,
  } = useMapContext();

  const theme = useTheme();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleGoToDrawing = (feature) => {
    if (!map) return;
    const geometry = feature.getGeometry();
    if (!geometry) return;

    const view = map.getView();
    view.fit(geometry.getExtent(), {
      padding: [40, 40, 40, 40],
      duration: 700,
      maxZoom: 6,
    });

    setSelectedFeature(feature);
    selectRef.current?.getFeatures().clear();
    selectRef.current?.getFeatures().push(feature);

    handleCheckboxChange(row.id, true);
    rowRefs?.current[row.id]?.scrollIntoView?.({ behavior: "smooth" });
  };

  const handleDeleteDrawing = (feature) => {
    vectorSource.removeFeature(feature);

    setDrawnFeatures((prev) => {
      const updated = prev.filter((f) => f !== feature);

      const sameRowFeatures = updated
        .filter((f) => f.get("id") === row.id)
        .sort((a, b) => a.get("timestamp") - b.get("timestamp"));

      sameRowFeatures.forEach((f, index) => {
        f.set("drawingNumber", index + 1);
        f.setStyle(createFeatureStyle(f, { map, showLabels: true }));
      });

      return updated;
    });

    if (feature === selectRef.current?.getFeatures().getArray()[0]) {
      selectRef.current?.getFeatures().clear();
      setSelectedFeature(null);
    }

    setSnackbarMessage("Drawing deleted");
    setSnackbarOpen(true);
  };

  const drawings = drawnFeatures.filter((f) => f.get("id") === row.id);

  if (!open) return null;

  return (
    <>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom"
        modifiers={[{ name: "offset", options: { offset: [0, 12] } }]}
        style={{ zIndex: 1300 }}
      >
        <Box sx={{ position: "relative", overflow: "visible" }}>
          {/* Pointer */}
          <Box
            sx={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: `10px solid #888`,
              zIndex: 2,
            }}
          />

          <Paper
            elevation={6}
            sx={{
              width: 280,
              maxHeight: 360,
              overflowY: "auto",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              boxShadow: theme.shadows[5],
              position: "relative",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
                px: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ flex: 1, textAlign: "center" }}
              >
                {row.name}
              </Typography>
              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  color: theme.palette.text.primary,
                  "&:hover": { backgroundColor: theme.palette.action.hover },
                }}
              >
                ✕
              </IconButton>
            </Box>

            {drawings.length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  p: 2,
                  textAlign: "center",
                  color: theme.palette.text.secondary,
                }}
              >
                No drawings available
              </Typography>
            )}

            {drawings.map((f, idx) => {
              const isSelected =
                f === selectRef.current?.getFeatures().getArray()[0];

              return (
                <Paper
                  key={f.ol_uid || idx}
                  elevation={isSelected ? 4 : 1}
                  sx={{
                    width: "95%",
                    margin: "6px auto",
                    cursor: "pointer",
                    borderRadius: 2,
                    backgroundColor: isSelected
                      ? theme.palette.primary.light
                      : theme.palette.background.default,
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onClick={() => handleGoToDrawing(f)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                      px: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        gap: 0.25,
                        wordBreak: "break-word",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: theme.palette.text.primary }}
                      >
                        Drawing {f.get("drawingNumber") || idx + 1}
                      </Typography>

                      {(f.get("description") ||
                        f.get("density") !== undefined) && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-start",
                            gap: 0.5,
                            flexWrap: "wrap",
                            mt: 0.25,
                          }}
                        >
                          {f.get("description") && (
                            <Typography
                              variant="caption"
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              {f.get("description")}
                            </Typography>
                          )}

                          {f.get("density") !== undefined && (
                            <Box
                              component="span"
                              sx={{
                                px: 1.2,
                                py: 0.3,
                                borderRadius: 1,
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.primary.contrastText,
                                fontWeight: 500,
                                fontSize: "0.65rem",
                              }}
                            >
                              Density: {f.get("density")}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        flexShrink: 0,
                        alignItems: "center",
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: "#fff",
                          borderRadius: 1,
                          p: 0.5,
                          "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToDrawing(f);
                        }}
                      >
                        <MyLocationIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: theme.palette.error.main,
                          color: "#fff",
                          borderRadius: 1,
                          p: 0.5,
                          "&:hover": {
                            backgroundColor: theme.palette.error.dark,
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDrawing(f);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Paper>
        </Box>
      </Popper>

      <SuccessSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        onClose={handleCloseSnackbar}
        severity="success"
      />
    </>
  );
};

export default DrawingDropdown;

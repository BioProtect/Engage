import React, { useRef, useState, useEffect, useCallback } from "react";
import * as olExtent from "ol/extent";
import { useMapContext } from "../../Contexts/MapContext";
import { createFeatureStyle } from "./FeatureStyle";
import { useDrawingInteraction } from "./useDrawingInteraction";
import { useSelectionInteraction } from "./useSelectionInteraction";
import { usePopupOverlay } from "./usePopupOverlay";
import { DistanceTooltip } from "./DistanceTooltip";
import PinchWarningSnackbar from "./PinchWarningSnackbar";

const DrawingLayer = () => {
  const {
    map,
    vectorSource,
    selectRef,
    setDrawnFeatures,
    drawnFeatures,
    activeColor,
    activeDrawingRow,
    activeName,
    handleCheckboxChange,
    visibilityMap,
    selectedFeature,
    setSelectedFeature,
    showSnackbar,
    showLabels,
  } = useMapContext();

  const colorRef = useRef(activeColor);
  const idRef = useRef(activeDrawingRow);
  const nameRef = useRef(activeName);

  useEffect(() => {
    colorRef.current = activeColor;
    idRef.current = activeDrawingRow;
    nameRef.current = activeName;
  }, [activeColor, activeDrawingRow, activeName]);

  const [density, setDensity] = useState(1);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!selectedFeature) return;
    setDensity(selectedFeature.get("density") ?? 1);
    setDescription(selectedFeature.get("description") ?? "");
  }, [selectedFeature]);

  const handleDelete = useCallback(() => {
    if (!selectedFeature) return;

    const rowId = selectedFeature.get("id");
    vectorSource.removeFeature(selectedFeature);

    setDrawnFeatures((prev) => {
      const updated = prev.filter((f) => f !== selectedFeature);

      const featuresForRow = updated
        .filter((f) => f.get("id") === rowId)
        .sort(
          (a, b) => new Date(a.get("timestamp")) - new Date(b.get("timestamp"))
        );

      featuresForRow.forEach((f, index) => f.set("drawingNumber", index + 1));
      featuresForRow.forEach((f) =>
        f.setStyle(
          createFeatureStyle(f, {
            map,
            showLabels: true,
            selected: f === selectedFeature,
          })
        )
      );

      return updated;
    });

    setSelectedFeature(null);
    selectRef.current?.getFeatures().clear();
    showSnackbar("Successfully deleted drawing!");
  }, [
    selectedFeature,
    vectorSource,
    setDrawnFeatures,
    setSelectedFeature,
    selectRef,
    showSnackbar,
    map,
  ]);

  const {
    drawRef,
    tooltipCoord,
    tooltipText,
    showPinchWarning,
    setShowPinchWarning,
  } = useDrawingInteraction({
    map,
    vectorSource,
    colorRef,
    idRef,
    nameRef,
    setDrawnFeatures,
    handleCheckboxChange,
    selectRef,
    setSelectedFeature,
    createFeatureStyle,
  });

  useSelectionInteraction({
    map,
    createFeatureStyle,
    setSelectedFeature,
    selectRef,
  });

  usePopupOverlay({
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
  });

  const prevActiveDrawingRow = useRef(null);
  useEffect(() => {
    const currentRow = activeDrawingRow;
    const previousRow = prevActiveDrawingRow.current;
    const shouldDraw = !!(activeColor && currentRow);
    drawRef.current?.setActive(shouldDraw);

    if (shouldDraw && currentRow) handleCheckboxChange(currentRow, true);
    else if (!shouldDraw && previousRow) {
      const hasDrawings = drawnFeatures.some(
        (feature) => String(feature.get("id")) === String(previousRow)
      );
      if (!hasDrawings) handleCheckboxChange(previousRow, false);
    }

    prevActiveDrawingRow.current = currentRow;
  }, [
    activeDrawingRow,
    activeColor,
    drawnFeatures,
    handleCheckboxChange,
    drawRef,
  ]);

  useEffect(() => {
    if (!map || !selectedFeature) return;

    if (drawRef.current?.getActive()) return;

    const geometry = selectedFeature.getGeometry();
    if (!geometry) return;

    const center = olExtent.getCenter(geometry.getExtent());
    map.getView().animate({
      center,
      duration: 500,
    });
  }, [map, selectedFeature, drawRef]);

  useEffect(() => {
    if (!map) return;

    drawnFeatures.forEach((feature) => {
      const selected = feature === selectedFeature;
      const style = createFeatureStyle(feature, {
        map,
        showLabels,
        selected,
      });
      feature.setStyle(style);
    });
  }, [drawnFeatures, selectedFeature, showLabels, map]);

  return (
    <>
      {tooltipCoord && activeDrawingRow && drawRef.current?.getActive() && (
        <DistanceTooltip
          map={map}
          coordinate={tooltipCoord}
          text={tooltipText}
          activeDrawingRow={activeDrawingRow}
        />
      )}

      <PinchWarningSnackbar
        open={showPinchWarning}
        onClose={() => setShowPinchWarning(false)}
        duration={5000}
      />
    </>
  );
};

export default DrawingLayer;

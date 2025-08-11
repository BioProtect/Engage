import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { Fill, Stroke, Style, Text } from "ol/style";
import Draw from "ol/interaction/Draw";
import Select from "ol/interaction/Select";
import Overlay from "ol/Overlay";
import { singleClick } from "ol/events/condition";
import { useMapContext } from "../../Contexts/MapContext";
import PopupContent from "../DataMenuComponents/PopupContent";
import { getArea } from "ol/sphere";

const allOverlays = [];

const formatArea = (polygon) => {
  const geom3857 = polygon.clone().transform("EPSG:4326", "EPSG:3857");
  const area = getArea(geom3857);
  const nf = new Intl.NumberFormat();

  return area > 1e6
    ? `${nf.format((area / 1e6).toFixed(2))} km²`
    : `${nf.format(area.toFixed(0))} m²`;
};

const tooltipStyle = {
  position: "absolute",
  background: "rgba(30, 144, 255, 0.6)",
  borderRadius: 4,
  color: "white",
  padding: "4px 8px",
  whiteSpace: "nowrap",
  fontSize: 12,
  fontWeight: "500",
  pointerEvents: "none",
  userSelect: "none",
  transform: "translate(-50%, -100%)",
  opacity: 0.8,
  boxShadow: "0 0 4px rgba(30, 144, 255, 0.5)",
  textShadow: "none",
  zIndex: 1000,
  lineHeight: 1,
  fontFamily: '"Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif',
};

const styleCache = {};

const createFeatureStyle = (feature, map) => {
  const color = feature.get("color") || "#000";
  const name = feature.get("name") || "";
  const geometry = feature.getGeometry();
  if (!geometry) return null;

  const zoom = Math.round(map.getView().getZoom());
  const cacheKey = `${feature.getId() || name}-${zoom}`;

  if (styleCache[cacheKey]) return styleCache[cacheKey];

  const coords = geometry.getCoordinates()[0];
  const pixelCoords = coords.map((c) => map.getPixelFromCoordinate(c));
  const xs = pixelCoords.map((p) => p[0]);
  const ys = pixelCoords.map((p) => p[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const boxWidth = maxX - minX;
  const boxHeight = maxY - minY;

  const paddingX = Math.max(boxWidth * 0.25, 16);
  const paddingY = Math.max(boxHeight * 0.25, 16);

  const maxTextWidth = boxWidth - 2 * paddingX;
  const maxTextHeight = boxHeight - 2 * paddingY;

  if (maxTextWidth <= 0 || maxTextHeight <= 0) {
    const style = new Style({
      fill: new Fill({ color: `${color}33` }),
      stroke: new Stroke({ color, width: 3, lineDash: [6, 4] }),
    });
    styleCache[cacheKey] = style;
    return style;
  }

  const ctx =
    createFeatureStyle._ctx ||
    (createFeatureStyle._ctx = document
      .createElement("canvas")
      .getContext("2d"));

  const MIN_FONT_SIZE = 6;
  const MAX_FONT_SIZE = 12;
  let fontSize = Math.min(
    MAX_FONT_SIZE,
    Math.max(MIN_FONT_SIZE, maxTextHeight * 0.5)
  );

  ctx.font = `bold ${fontSize}px Roboto, sans-serif`;

  const labelGeometry = geometry.getInteriorPoint
    ? geometry.getInteriorPoint()
    : {
        getCoordinates: () => {
          const ext = geometry.getExtent();
          return [(ext[0] + ext[2]) / 2, (ext[1] + ext[3]) / 2];
        },
      };

  const style = new Style({
    fill: new Fill({ color: `${color}33` }),
    stroke: new Stroke({ color, width: 3, lineDash: [6, 4] }),
    text: new Text({
      text: name,
      font: `bold ${fontSize}px "Roboto", sans-serif`,
      fill: new Fill({ color: "#fff" }),
      stroke: new Stroke({ color: "#000", width: 4 }),
      placement: "point",
      geometry: labelGeometry,
      overflow: true,
    }),
    zIndex: 10,
  });

  styleCache[cacheKey] = style;
  return style;
};

const usePopupOverlay = ({
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
        rootRef.current?.unmount();
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
        onChange={(e, val) => setDensity(val)}
        onDescriptionChange={setDescription}
        onSave={() => {
          if (selectedFeature) {
            selectedFeature.set("density", density);
            selectedFeature.set("description", description);
          }
          setSelectedFeature(null);
          showSnackbar("successfully saved density/description");
          selectRef.current?.getFeatures().clear();
        }}
        onDelete={handleDelete}
        onClose={() => {
          setSelectedFeature(null);
          selectRef.current?.getFeatures().clear();
        }}
        direction={direction}
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
  ]);
};

const useDrawingInteraction = ({
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
}) => {
  const sketchOverlayRef = useRef(null);
  const sketchElementRef = useRef(null);
  const drawRef = useRef(null);

  useEffect(() => {
    if (!map || !vectorSource) return;

    if (!sketchElementRef.current) {
      const tooltip = document.createElement("div");
      Object.assign(tooltip.style, tooltipStyle);
      sketchElementRef.current = tooltip;

      const overlay = new Overlay({
        element: tooltip,
        offset: [0, -15],
        positioning: "bottom-center",
      });
      map.addOverlay(overlay);
      sketchOverlayRef.current = overlay;
    }

    drawRef.current = new Draw({
      source: vectorSource,
      type: "Polygon",
      freehand: true,
    });

    drawRef.current.setActive(false);

    let sketch = null;

    const pointerMoveHandler = (evt) => {
      if (!drawRef.current?.getActive() || !sketch) {
        sketchElementRef.current.style.display = "none";
        return;
      }
      sketchElementRef.current.style.display = "block";
      const geom = sketch.getGeometry();
      if (!geom) return;
      const area = formatArea(geom);
      sketchElementRef.current.innerHTML = `<span>${area}</span>`;
      sketchOverlayRef.current.setPosition(evt.coordinate);
    };

    map.on("pointermove", pointerMoveHandler);

    drawRef.current.on("drawstart", (evt) => {
      sketch = evt.feature;
      sketchElementRef.current.style.display = "block";
      sketchOverlayRef.current.setPosition(undefined);
    });

    drawRef.current.on("drawend", (evt) => {
      sketch = null;
      sketchElementRef.current.style.display = "none";

      const feature = evt.feature;
      feature.set("id", idRef.current || "UnnamedID");
      feature.set("name", nameRef.current || "Unnamed");
      feature.set("color", colorRef.current || "#000");
      feature.set("timestamp", new Date().toISOString());
      feature.setStyle(createFeatureStyle(feature, map));

      setDrawnFeatures((prev) => [...prev, feature]);
      handleCheckboxChange(idRef.current, true);

      selectRef.current?.getFeatures().clear();
      selectRef.current?.getFeatures().push(feature);
      setSelectedFeature(feature);
    });

    map.addInteraction(drawRef.current);

    return () => {
      map.un("pointermove", pointerMoveHandler);
      map.removeInteraction(drawRef.current);

      if (sketchOverlayRef.current) {
        map.removeOverlay(sketchOverlayRef.current);
        sketchOverlayRef.current = null;
      }
      sketchElementRef.current = null;
    };
  }, [
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
  ]);

  useEffect(() => {
    if (!map || !drawRef.current) return;

    const handleTouchStart = (e) => {
      if (e.touches.length > 1) {
        drawRef.current.setActive(false);
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length === 0) {
        const currentId = idRef.current;
        const currentColor = colorRef.current;
        if (currentId && currentColor) {
          drawRef.current.setActive(true);
        }
      }
    };

    const viewport = map.getViewport();
    viewport.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    viewport.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      viewport.removeEventListener("touchstart", handleTouchStart);
      viewport.removeEventListener("touchend", handleTouchEnd);
    };
  }, [map]);

  return drawRef;
};

const useSelectionInteraction = ({
  map,
  createFeatureStyle,
  setSelectedFeature,
  selectRef,
}) => {
  useEffect(() => {
    if (!map) return;

    selectRef.current = new Select({
      condition: singleClick,
      style: (feature) => {
        const baseStyle = createFeatureStyle(feature, map);
        const color = feature.get("color") || "#000";
        return new Style({
          fill: new Fill({ color: `${color}aa` }),
          stroke: new Stroke({ color, width: 3 }),
          text: baseStyle?.getText(),
        });
      },
    });

    map.addInteraction(selectRef.current);

    selectRef.current.on("select", (e) => {
      const selected = e.selected?.[0];
      setSelectedFeature(selected || null);
    });

    return () => {
      map.removeInteraction(selectRef.current);
    };
  }, [map, createFeatureStyle, setSelectedFeature, selectRef]);
};

const Drawing = () => {
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
    if (selectedFeature?.get("id") === activeDrawingRow) {
      setDensity(selectedFeature.get("density") ?? 1);
      setDescription(selectedFeature.get("description") ?? "");
    }
  }, [selectedFeature, activeDrawingRow]);

  const handleDelete = useCallback(() => {
    if (!selectedFeature) return;
    vectorSource.removeFeature(selectedFeature);
    setDrawnFeatures((prev) => prev.filter((f) => f !== selectedFeature));
    setSelectedFeature(null);
    showSnackbar("successfully deleted drawing!");
    selectRef.current?.getFeatures().clear();
  }, [
    selectedFeature,
    vectorSource,
    setDrawnFeatures,
    setSelectedFeature,
    selectRef,
  ]);

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
    activeName,
    selectRef,
  });

  const drawInteractionRef = useDrawingInteraction({
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

  const prevActiveDrawingRow = useRef(null);
  useEffect(() => {
    const currentRow = activeDrawingRow;
    const previousRow = prevActiveDrawingRow.current;
    const shouldDraw = !!(activeColor && currentRow);
    drawInteractionRef.current?.setActive(shouldDraw);
    if (shouldDraw && currentRow) {
      handleCheckboxChange(currentRow, true);
    } else if (!shouldDraw && previousRow) {
      const hasDrawings = drawnFeatures.some(
        (feature) => String(feature.get("id")) === String(previousRow)
      );
      if (!hasDrawings) {
        handleCheckboxChange(previousRow, false);
      }
    }
    prevActiveDrawingRow.current = currentRow;
  }, [
    activeDrawingRow,
    activeColor,
    drawnFeatures,
    handleCheckboxChange,
    drawInteractionRef,
  ]);

  return null;
};

export default Drawing;

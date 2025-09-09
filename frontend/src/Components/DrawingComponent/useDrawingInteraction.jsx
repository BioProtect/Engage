import { useEffect, useRef, useState, useCallback } from "react";
import Draw from "ol/interaction/Draw";
import { formatArea } from "./FeatureStyle";

export const useDrawingInteraction = ({
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
  const drawRef = useRef(null);
  const [tooltipCoord, setTooltipCoord] = useState(null);
  const [tooltipText, setTooltipText] = useState("");
  const pinchActive = useRef(false);
  const [showPinchWarning, setShowPinchWarning] = useState(false);
  const warningTimeoutRef = useRef(null);

  const createDraw = useCallback(() => {
    if (!map || !vectorSource) return;

    if (drawRef.current) {
      drawRef.current.setActive(false);
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    const draw = new Draw({
      source: vectorSource,
      type: "Polygon",
      freehand: true,
    });

    let pointerMoveHandler = null;

    draw.on("drawstart", (evt) => {
      const sketch = evt.feature;
      setTooltipCoord(null);
      setTooltipText("");

      pointerMoveHandler = (evt) => {
        const geom = sketch.getGeometry();
        if (!geom) return;
        setTooltipText(formatArea(geom));
        setTooltipCoord(evt.coordinate);
      };

      map.on("pointermove", pointerMoveHandler);
    });

    draw.on("drawend", (evt) => {
      if (pointerMoveHandler) {
        map.un("pointermove", pointerMoveHandler);
        pointerMoveHandler = null;
      }
      setTooltipCoord(null);
      setTooltipText("");

      const feature = evt.feature;

      const existing = vectorSource
        .getFeatures()
        .filter((f) => f.get("id") === idRef.current);

      const drawingNumber = existing.length + 1;
      const geom = feature.getGeometry();

      feature.set("id", idRef.current || "UnnamedID");
      feature.set("name", nameRef.current || "Unnamed");
      feature.set("color", colorRef.current || "#000");
      feature.set("timestamp", new Date().toISOString());
      feature.set("drawingNumber", drawingNumber);
      feature.set("areaLabel", geom ? formatArea(geom) : "");

      feature.setStyle(createFeatureStyle(feature, { map }));

      setDrawnFeatures((prev) => [...prev, feature]);
      handleCheckboxChange(idRef.current, true);

      selectRef.current?.getFeatures().clear();
      selectRef.current?.getFeatures().push(feature);
      setSelectedFeature(feature);
    });

    map.addInteraction(draw);
    drawRef.current = draw;

    return draw;
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
    if (!map || !vectorSource) return;

    createDraw();

    const pointerDownHandler = (evt) => {
      if (evt.pointerType === "touch" && !evt.isPrimary) {
        if (drawRef.current?.getActive()) {
          pinchActive.current = true;

          setShowPinchWarning(true);
          if (warningTimeoutRef.current)
            clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = setTimeout(() => {
            setShowPinchWarning(false);
          }, 5000);

          drawRef.current.setActive(false);
          map.removeInteraction(drawRef.current);
          drawRef.current = null;
        }
      }
    };

    const pointerUpHandler = () => {
      if (pinchActive.current) {
        pinchActive.current = false;
        createDraw();
      }
    };

    map.getViewport().addEventListener("pointerdown", pointerDownHandler);
    map.getViewport().addEventListener("pointerup", pointerUpHandler);

    return () => {
      map.getViewport().removeEventListener("pointerdown", pointerDownHandler);
      map.getViewport().removeEventListener("pointerup", pointerUpHandler);

      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

      if (drawRef.current) {
        drawRef.current.setActive(false);
        map.removeInteraction(drawRef.current);
        drawRef.current = null;
      }
    };
  }, [map, vectorSource, createDraw]);

  return {
    drawRef,
    tooltipCoord,
    tooltipText,
    showPinchWarning,
    setShowPinchWarning,
  };
};

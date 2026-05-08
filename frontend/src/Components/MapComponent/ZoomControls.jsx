import React, { useState, useEffect } from "react";

const MIN_ZOOM = 3;
const MAX_ZOOM = 24;

const ZoomControls = ({ map, size = 48 }) => {
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    if (!map) return;
    const view = map.getView();
    setZoom(view.getZoom());
    const handler = () => setZoom(view.getZoom());
    view.on("change:resolution", handler);
    return () => view.un("change:resolution", handler);
  }, [map]);

  if (!map || zoom === null) return null;

  const EPS = 0.001;
  const zoomInDisabled = zoom >= MAX_ZOOM - EPS;
  const zoomOutDisabled = zoom <= MIN_ZOOM + EPS;

  const zoomIn = () => {
    if (!zoomInDisabled) map.getView().setZoom(zoom + 1);
  };

  const zoomOut = () => {
    if (!zoomOutDisabled) map.getView().setZoom(zoom - 1);
  };

  const baseStyle = {
    width: size,
    height: size,
    fontSize: size * 0.5,
    borderRadius: 12,
    border: "1px solid #ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  };

  const enabledStyle = {
    backgroundColor: "#fff",
    color: "#333",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  };

  const disabledStyle = {
    backgroundColor: "#eee",
    color: "#999",
    cursor: "not-allowed",
    boxShadow: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        onClick={zoomIn}
        disabled={zoomInDisabled}
        style={{ ...baseStyle, ...(zoomInDisabled ? disabledStyle : enabledStyle) }}
      >
        +
      </button>

      <button
        onClick={zoomOut}
        disabled={zoomOutDisabled}
        style={{ ...baseStyle, ...(zoomOutDisabled ? disabledStyle : enabledStyle) }}
      >
        −
      </button>
    </div>
  );
};

export default ZoomControls;

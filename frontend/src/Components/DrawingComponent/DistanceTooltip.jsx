import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import Overlay from "ol/Overlay";

const tooltipStyle = {
  position: "absolute",
  background: "rgba(30, 144, 255, 0.85)",
  borderRadius: 6,
  color: "#fff",
  padding: "4px 10px",
  fontSize: 12,
  fontWeight: 500,
  pointerEvents: "none",
  transform: "translate(-50%, -100%)",
  opacity: 0.95,
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
  lineHeight: 1.2,
  fontFamily: '"Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif',
  whiteSpace: "nowrap",
};

export const DistanceTooltip = ({ map, coordinate, text }) => {
  const overlayRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!map || overlayRef.current) return;

    const container = document.createElement("div");
    Object.assign(container.style, tooltipStyle);
    const root = ReactDOM.createRoot(container);

    const overlay = new Overlay({
      element: container,
      offset: [0, -15],
      positioning: "bottom-center",
      stopEvent: false,
    });

    map.addOverlay(overlay);
    overlayRef.current = overlay;
    rootRef.current = root;

    return () => {
      if (overlayRef.current) {
        map.removeOverlay(overlayRef.current);
        overlayRef.current = null;
      }
      rootRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (overlayRef.current && rootRef.current && coordinate) {
      overlayRef.current.setPosition(coordinate);
      rootRef.current.render(<span>{text}</span>);
    }
  }, [coordinate, text]);

  return null;
};

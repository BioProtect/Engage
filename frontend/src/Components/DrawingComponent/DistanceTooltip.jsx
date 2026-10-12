import { useEffect, useRef } from "react";
import Overlay from "ol/Overlay";

const tooltipStyle = {
  position: "absolute",
  background: "rgba(30, 144, 255, 0.85)",
  borderRadius: "6px",
  color: "#fff",
  padding: "4px 10px",
  fontSize: "12px",
  fontWeight: 500,
  pointerEvents: "none",
  transform: "translateY(-100%)",
  opacity: 0.95,
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
  lineHeight: 1.2,
  fontFamily: '"Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif',
  whiteSpace: "nowrap",
};

export const DistanceTooltip = ({ map, coordinate, text }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const container = document.createElement("div");
    Object.assign(container.style, tooltipStyle);

    const overlay = new Overlay({
      element: container,
      offset: [20, -10],
      positioning: "bottom-left",
      stopEvent: false,
    });
    map.addOverlay(overlay);
    overlayRef.current = overlay;

    return () => {
      map.removeOverlay(overlay);
      overlayRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !coordinate) return;
    overlay.setPosition(coordinate);
    overlay.getElement().textContent = text;
  }, [coordinate, text]);

  return null;
};

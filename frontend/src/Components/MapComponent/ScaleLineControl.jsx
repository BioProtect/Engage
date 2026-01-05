import { useEffect } from "react";
import ScaleLine from "ol/control/ScaleLine";
import "ol/ol.css";

const NiceScaleLine = ({ map, minWidth = 120 }) => {
  useEffect(() => {
    if (!map) return;

    const scaleLine = new ScaleLine({
      units: "metric",
      bar: false,
      text: true,
      minWidth,
    });

    map.addControl(scaleLine);

    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      /* OUTER CONTAINER */
      .ol-scale-line {
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(12px);
        padding: 6px 10px;
        border-radius: 16px;
        box-shadow:
          0 4px 12px rgba(0,0,0,0.12),
          inset 0 1px 0 rgba(255,255,255,0.3);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      /* TEXT CONTAINER */
      .ol-scale-line-inner {
        font-size: 11px;
        font-weight: 600;
        color: #111;
        white-space: nowrap;
        text-align: center;
        text-shadow: 0 1px 2px rgba(0,0,0,0.12);
        margin-bottom: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      /* MAIN SCALE LINE */
      .ol-scale-line-inner::after {
        content: "";
        display: block;
        width: 100%;
        height: 6px;
        border-radius: 999px;
        background: linear-gradient(
          90deg,
          #bbdefb,
          #42a5f5,
          #1e88e5
        );
        box-shadow:
          inset 0 1px 2px rgba(255,255,255,0.5),
          inset 0 -1px 2px rgba(0,0,0,0.2);
        position: relative;
      }

      /* SIDE BARS MATCHING MAIN SCALE */
      .ol-scale-line-inner::before,
      .ol-scale-line-inner::after {
        border-radius: 999px;
      }
    `;

    document.head.appendChild(styleEl);

    return () => {
      map.removeControl(scaleLine);
      document.head.removeChild(styleEl);
    };
  }, [map, minWidth]);

  return null;
};

export default NiceScaleLine;

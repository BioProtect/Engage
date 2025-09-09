import { Fill, Stroke, Style, Text } from "ol/style";
import { getArea } from "ol/sphere";

const styleCache = {};

export const formatArea = (polygon) => {
  const geom3857 = polygon.clone().transform("EPSG:4326", "EPSG:3857");
  const area = getArea(geom3857);
  const nf = new Intl.NumberFormat();

  return area > 1e6
    ? `${nf.format((area / 1e6).toFixed(2))} km²`
    : `${nf.format(area.toFixed(0))} m²`;
};

export const createFeatureStyle = (
  feature,
  { map, showLabels = true, selected = false }
) => {
  const color = feature.get("color") || "#000";
  const name = feature.get("name") || "";
  const number = feature.get("drawingNumber") || "";
  const areaLabel = feature.get("areaLabel") || "";

  const geometry = feature.getGeometry();
  if (!geometry) return null;

  const zoom = map?.getView ? map.getView().getZoom() : 10;
  const cacheKey = `${
    feature.getId() || name
  }-${zoom}-${showLabels}-${selected}-${number}-${areaLabel}`;
  if (styleCache[cacheKey]) return styleCache[cacheKey];

  const fillColor = selected ? `${color}aa` : `${color}33`;
  const strokeWidth = selected ? 3 : 2;
  const lineDash = selected ? undefined : [6, 4];

  const centerGeom = geometry.getInteriorPoint?.() || geometry;

  const baseFont = Math.max(11, zoom);
  const numberFontSize = baseFont;
  const nameFontSize = baseFont + 1;
  const areaFontSize = baseFont;

  const spacing = 14;

  const styles = [
    new Style({
      fill: new Fill({ color: fillColor }),
      stroke: new Stroke({ color, width: strokeWidth, lineDash }),
    }),
  ];

  if (showLabels) {
    const labels = [
      {
        text: number ? `#${number}` : null,
        font: `500 ${numberFontSize}px "Inter", sans-serif`,
        offset: 0,
      },
      {
        text: name || null,
        font: `600 ${nameFontSize}px "Inter", sans-serif`,
        offset: number ? -spacing : 0,
      },
      {
        text: areaLabel || null,
        font: `400 ${areaFontSize}px "Inter", sans-serif`,
        offset: spacing,
      },
    ];

    labels.forEach((label, index) => {
      if (label.text) {
        styles.push(
          new Style({
            text: new Text({
              text: label.text,
              font: label.font,
              fill: new Fill({ color: "rgba(30,30,30,0.85)" }),
              stroke: new Stroke({ color: "rgba(255,255,255,0.6)", width: 2 }),
              placement: "point",
              geometry: centerGeom,
              textAlign: "center",
              offsetY: label.offset,
              overflow: false,
            }),
            zIndex: selected ? 1000 + index : 100 + index,
          })
        );
      }
    });
  }

  styleCache[cacheKey] = styles;
  return styles;
};

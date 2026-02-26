import { Fill, Stroke, Style } from "ol/style.js";
import React, { useEffect, useRef, useState } from "react";

import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import View from "ol/View.js";
import { fromExtent } from "ol/geom/Polygon.js";
import { getTileLayerSource } from "./BaseMapLayers";

const MiniMap = ({
  mainMap,
  width = 220,
  height = 150,
  zoomOutDelta = 7,
  minZoom = 2,
}) => {
  const miniMapRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const viewportFeatureRef = useRef(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!mainMap || !miniMapRef.current) return;

    const baseLayer = new TileLayer({ source: getTileLayerSource() });
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({ source: vectorSource });

    const viewportFeature = new Feature();
    viewportFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: "rgba(0,0,0,0.5)",
          width: 2,
        }),
        fill: new Fill({
          color: "rgba(0,0,0,0.05)",
        }),
      }),
    );
    vectorSource.addFeature(viewportFeature);
    viewportFeatureRef.current = viewportFeature;

    const miniMap = new Map({
      target: miniMapRef.current,
      layers: [baseLayer, vectorLayer],
      view: new View({
        center: mainMap.getView().getCenter(),
        zoom: Math.max(mainMap.getView().getZoom() - zoomOutDelta, minZoom),
        minZoom: minZoom,
      }),
      controls: [],
      interactions: [],
    });
    miniMapInstanceRef.current = miniMap;

    const updateViewport = () => {
      if (!mainMap || !viewportFeatureRef.current) return;
      const extent = mainMap.getView().calculateExtent(mainMap.getSize());
      viewportFeatureRef.current.setGeometry(fromExtent(extent));

      miniMap.getView().setCenter(mainMap.getView().getCenter());

      const newZoom = Math.max(
        mainMap.getView().getZoom() - zoomOutDelta,
        minZoom,
      );
      miniMap.getView().setZoom(newZoom);
    };

    mainMap.getView().on("change:center", updateViewport);
    mainMap.getView().on("change:resolution", updateViewport);
    mainMap.getView().on("change:zoom", updateViewport);

    updateViewport();

    miniMap.on("singleclick", (evt) => {
      const coord = miniMap.getCoordinateFromPixel(evt.pixel);
      if (coord) mainMap.getView().setCenter(coord);
    });

    return () => miniMap.setTarget(null);
  }, [mainMap, zoomOutDelta, minZoom]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: open ? "10px" : `-${width}px`,
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: "12px",
          overflow: "hidden",
          zIndex: 1500,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          backgroundColor: "rgba(255,255,255,0.95)",
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {open && (
          <button
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              top: "6px",
              left: "6px",
              zIndex: 10,
              background: "rgba(0,0,0,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: "bold",
              color: "#000",
              fontSize: "16px",
            }}
          >
            ✕
          </button>
        )}

        <div ref={miniMapRef} style={{ flex: 1 }} />
      </div>

      {!open && (
        <div
          onClick={() => setOpen(true)}
          style={{
            position: "absolute",
            top: "50px",
            right: "0px",
            width: "40px",
            height: "80px",
            background: "rgba(255,255,255,0.9)",
            borderRadius: "20px 0 0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#000",
            fontSize: "18px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          <span style={{ transform: "translateX(-1px)" }}>◀</span>
        </div>
      )}
    </>
  );
};

export default MiniMap;

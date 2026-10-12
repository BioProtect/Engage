import "ol/ol.css";

import React, { useEffect, useRef, useState } from "react";
import { availableLayers, getTileLayerSource } from "./BaseMapLayers";

import ExtraMapControls from "./ExtraMapControls";
import Joystick from "./Joystick";
import LayerSelector from "./LayerSelector";
import LocationSearch from "./LocationSearch";
import Map from "ol/Map.js";
import OverviewMap from "ol/control/OverviewMap.js";
import PinchZoom from "ol/interaction/PinchZoom.js";
import ScaleLine from "ol/control/ScaleLine.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import View from "ol/View.js";
import Zoom from "ol/control/Zoom.js";
import { defaults as defaultControls } from "ol/control.js";
import { defaults as defaultInteractions } from "ol/interaction.js";
import { useGeographic } from "ol/proj.js";
import { useMapStable } from "../../Contexts/MapContext";

const MapComponent = () => {
  useGeographic();
  const mapRef = useRef(null);
  const zoomRef = useRef(null);
  const { setMap, setVectorSource } = useMapStable();
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    const baseLayer = new TileLayer({ source: getTileLayerSource() });

    const vectorSource = new VectorSource({ wrapX: false });
    const vectorLayer = new VectorLayer({ source: vectorSource });

    availableLayers.forEach((layerObj) => layerObj.layer.setVisible(false));

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, ...availableLayers.map((l) => l.layer), vectorLayer],
      view: new View({
        center: [-9.8, 53.3],
        zoom: 12,
        minZoom: 3,
        maxZoom: 24,
        constrainOnlyCenter: true,
      }),
      // Scale line, overview map and zoom are OpenLayers' own controls,
      // positioned and styled in App.css.
      controls: defaultControls({ zoom: false, rotate: false }).extend([
        new ScaleLine({ minWidth: 100 }),
        new OverviewMap({
          layers: [new TileLayer({ source: getTileLayerSource() })],
          collapsed: false,
        }),
      ]),
      interactions: defaultInteractions({ pinchRotate: false }).extend([
        new PinchZoom(),
      ]),
    });

    setMap(map);
    setVectorSource(vectorSource);
    setMapInstance(map);

    return () => map.setTarget(null);
  }, [setMap, setVectorSource]);

  // The zoom buttons live in the control panel below, which only exists once
  // the map does.
  useEffect(() => {
    if (!mapInstance) return;
    const zoom = new Zoom({ target: zoomRef.current });
    mapInstance.addControl(zoom);
    return () => mapInstance.removeControl(zoom);
  }, [mapInstance]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          touchAction: "none",
        }}
      />

      {mapInstance && (
        <div
          style={{
            position: "absolute",
            bottom: `calc(10px + env(safe-area-inset-bottom, 0px))`,
            right: `calc(10px + env(safe-area-inset-right, 0px))`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            zIndex: 1000,
            padding: "12px",
            borderRadius: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            backdropFilter: "blur(8px)",
            maxHeight: "80vh",
            minWidth: "fit-content",
          }}
        >
          <LocationSearch mapInstance={mapInstance} />

          <Joystick
            map={mapInstance}
            size={Math.min(90, window.innerHeight * 0.15)}
          />

          <div ref={zoomRef} className="zoom-controls" />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <LayerSelector mapInstance={mapInstance} />

            <ExtraMapControls map={mapInstance} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;

import React, { useEffect, useRef, useState } from "react";
import {
  availableLayers,
  getTileLayerSource,
} from "./BaseMapLayers";

import ExtraMapControls from "./ExtraMapControls";
import GeoTiffSelector from "./GeoTiffSelector";
import Joystick from "./Joystick";
import LocationSearch from "./LocationSearch";
import Map from "ol/Map.js";
import MiniMap from "./MiniMap";
import PinchZoom from "ol/interaction/PinchZoom.js";
import ScaleLineControl from "./ScaleLineControl";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import View from "ol/View.js";
import ZoomControls from "./ZoomControls";
import { defaults as defaultControls } from "ol/control.js";
import { defaults as defaultInteractions } from "ol/interaction.js";
import { useGeographic } from "ol/proj.js";
import { useMapContext } from "../../Contexts/MapContext";

const MapComponent = () => {
  const mapRef = useRef(null);
  const { setMap, setVectorSource, setGeoTiffLayer } = useMapContext();
  const [mapInstance, setMapInstance] = useState(null);

  useGeographic();

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
      controls: defaultControls({ zoom: false, rotate: false }),
      interactions: defaultInteractions({ pinchRotate: false }).extend([
        new PinchZoom(),
      ]),
    });

    setMap(map);
    setVectorSource(vectorSource);
    setMapInstance(map);

    return () => map.setTarget(null);
  }, [setMap, setVectorSource, setGeoTiffLayer]);

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

      {mapInstance && <MiniMap mainMap={mapInstance} />}

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

          <ScaleLineControl map={mapInstance} />

          <Joystick
            map={mapInstance}
            size={Math.min(90, window.innerHeight * 0.15)}
          />

          <ZoomControls
            map={mapInstance}
            size={Math.min(48, window.innerHeight * 0.08)}
          />

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
            <GeoTiffSelector
              mapInstance={mapInstance}
              setGeoTiffLayer={setGeoTiffLayer}
            />

            <ExtraMapControls map={mapInstance} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;

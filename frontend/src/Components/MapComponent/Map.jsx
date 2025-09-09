import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { defaults as defaultControls } from "ol/control.js";
import { defaults as defaultInteractions } from "ol/interaction.js";
import PinchZoom from "ol/interaction/PinchZoom.js";
import { useGeographic } from "ol/proj.js";
import { useMapContext } from "../../Contexts/MapContext";
import { getTileLayerSource, mapBoxRasterLayer } from "./BaseMapLayers";
import Joystick from "./Joystick";
import ZoomControls from "./ZoomControls";
import ExtraMapControls from "./ExtraMapControls";
import GeoTiffSelector from "./GeoTiffSelector";

const MapComponent = () => {
  const mapRef = useRef(null);
  const { setMap, setVectorSource, setGeoTiffLayer } = useMapContext();
  const [mapInstance, setMapInstance] = useState(null);

  useGeographic();

  useEffect(() => {
    const baseLayer = new TileLayer({ source: getTileLayerSource("streets") });
    const rasterLayer = mapBoxRasterLayer;
    const vectorSource = new VectorSource({ wrapX: false });
    const vectorLayer = new VectorLayer({ source: vectorSource });

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, rasterLayer, vectorLayer],
      view: new View({
        center: [-26.3, 59.99],
        zoom: 5,
        constrainOnlyCenter: true,
      }),
      controls: defaultControls({ zoom: false, rotate: false }),
      interactions: defaultInteractions({ pinchRotate: false }).extend([
        new PinchZoom(),
      ]),
    });

    setMap(map);
    setVectorSource(vectorSource);
    setGeoTiffLayer(rasterLayer);
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

      {mapInstance && (
        <div
          style={{
            position: "absolute",
            bottom: `calc(10px + env(safe-area-inset-bottom, 0px))`,
            right: `calc(10px + env(safe-area-inset-right, 0px))`,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "15px",
            zIndex: 1000,
            padding: "12px",
            borderRadius: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            backdropFilter: "blur(8px)",
            maxHeight: "80vh",
          }}
        >
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
              gap: "10px",
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

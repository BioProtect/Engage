// src/components/MapComponent.js
import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import XYZ from 'ol/source/XYZ.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import { useMapContext } from '../../Contexts/MapContext'; // Import context

const TILE_SOURCE = 'mapbox';
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYWxhbnJlaWR5IiwiYSI6ImNtNXdpd2RxczA5NmIyb3NjbHB3aWJ3bjcifQ.Ew9OYib3ETPK0cwUUWhPcA';
const MAPBOX_STYLE = 'streets-v12';

// Get tile source (Mapbox or OSM)
const getTileLayerSource = () => {
  return TILE_SOURCE === 'mapbox'
    ? new XYZ({
        url: `https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLE}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`,
        tileSize: 512,
        maxZoom: 22,
        crossOrigin: 'anonymous',
      })
    : new OSM();
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const { setMap, setVectorSource } = useMapContext(); // Access context values

  useEffect(() => {
    const raster = new TileLayer({ source: getTileLayerSource() });
    const source = new VectorSource({ wrapX: false });
    const vector = new VectorLayer({ source });

    const olMap = new Map({
      layers: [raster, vector],
      target: mapRef.current,
      view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
        extent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
        constrainOnlyCenter: true,
      }),
      controls: [],
    });

    // Set the map and vectorSource in context
    setMap(olMap);
    setVectorSource(source);

    // Cleanup function to remove the map target on unmount
    return () => olMap.setTarget(null);
  }, [setMap, setVectorSource]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default MapComponent;

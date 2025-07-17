// src/components/MapComponent.js
import React, { useEffect, useRef } from 'react';

import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import WebGLTileLayer from 'ol/layer/WebGLTile.js';
import XYZ from 'ol/source/XYZ.js';
import { useGeographic } from 'ol/proj.js';
import { useMapContext } from '../../Contexts/MapContext';

const TILE_SOURCE = 'mapbox';
const MAPBOX_PUBLIC_ACCESS_TOKEN = 'pk.eyJ1IjoiYWxhbnJlaWR5IiwiYSI6ImNtNXdpd2RxczA5NmIyb3NjbHB3aWJ3bjcifQ.Ew9OYib3ETPK0cwUUWhPcA';
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const MAPBOX_STYLE = 'streets-v12';
// const MAPBOX_STYLE = 'craicerjack/ckf6p8lax0q4319my1f2dbi7v';
const MAPBOX_USER = 'craicerjack'
const TILESET_ID = 'impact_e0db42b42ced448fafbb6d66a'

const getTileLayerSource = () => {
  return TILE_SOURCE === 'mapbox'
    ? new XYZ({
      url: `https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLE}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_PUBLIC_ACCESS_TOKEN}`,
      tileSize: 512,
      maxZoom: 22,
      crossOrigin: 'anonymous',
    })
    : new OSM();
};


const mapBoxRasterLayer = new TileLayer({
  source: new XYZ({
    url: `https://api.mapbox.com/v4/${MAPBOX_USER}.${TILESET_ID}/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_PUBLIC_ACCESS_TOKEN}`,
    tileSize: 512,          // 512px tiles match the @2x PNG
    maxZoom: 7,             // match your tileset’s maxzoom
    crossOrigin: 'anonymous'
  }),
  opacity: 0.6,
  visible: true
})

const geoTiffLayer = new WebGLTileLayer({
  source: new GeoTIFF({
    sources: [
      {
        url: 'https://openlayers.org/data/raster/no-overviews.tif',
        overviews: ['https://openlayers.org/data/raster/no-overviews.tif.ovr'],
      },
    ],
  }),
  opacity: 0.6,
  visible: true,
});

const MapComponent = () => {
  const mapRef = useRef(null);
  const { setMap, setVectorSource, setGeoTiffLayer } = useMapContext();
  useGeographic();


  useEffect(() => {
    const baseLayer = new TileLayer({ source: getTileLayerSource() });
    const rasterLayer = mapBoxRasterLayer;

    const vectorSource = new VectorSource({ wrapX: false });
    const vectorLayer = new VectorLayer({ source: vectorSource });

    const map = new Map({
      target: mapRef.current,
      // layers: [baseLayer, geoTiffLayer, vectorLayer],
      layers: [baseLayer, rasterLayer, vectorLayer],
      view: new View({
        // center: [26.344610, -77.409801],
        // zoom: 8,
        center: [-26.30, 59.99],
        zoom: 5,
        constrainOnlyCenter: true,
      }),
      controls: [],
    });

    setMap(map);
    setVectorSource(vectorSource);
    // setGeoTiffLayer(geoTiffLayer);
    setGeoTiffLayer(rasterLayer);

    return () => map.setTarget(null);
  }, [setMap, setVectorSource, setGeoTiffLayer]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapComponent;

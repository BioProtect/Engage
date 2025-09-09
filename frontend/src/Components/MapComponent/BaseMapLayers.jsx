import GeoTIFF from "ol/source/GeoTIFF.js";
import TileLayer from "ol/layer/Tile.js";
import WebGLTileLayer from "ol/layer/WebGLTile.js";
import XYZ from "ol/source/XYZ.js";

const TILE_SOURCE = "mapbox";
const MAPBOX_PUBLIC_ACCESS_TOKEN =
  "pk.eyJ1IjoiYWxhbnJlaWR5IiwiYSI6ImNtNXdpd2RxczA5NmIyb3NjbHB3aWJ3bjcifQ.Ew9OYib3ETPK0cwUUWhPcA";
const MAPBOX_USER = "craicerjack";
const TILESET_ID = "impact_e0db42b42ced448fafbb6d66a";
const MAPBOX_STYLE = "streets-v12";

export const getTileLayerSource = () =>
  TILE_SOURCE === "mapbox"
    ? new XYZ({
        url: `https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLE}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_PUBLIC_ACCESS_TOKEN}`,
        tileSize: 512,
        maxZoom: 22,
        crossOrigin: "anonymous",
      })
    : new XYZ();

export const mapBoxRasterLayer = new TileLayer({
  source: new XYZ({
    url: `https://api.mapbox.com/v4/${MAPBOX_USER}.${TILESET_ID}/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_PUBLIC_ACCESS_TOKEN}`,
    tileSize: 512,
    maxZoom: 7,
    crossOrigin: "anonymous",
  }),
  opacity: 0.6,
  visible: true,
});

export const geoTiffLayer = new WebGLTileLayer({
  source: new GeoTIFF({
    sources: [
      {
        url: "https://openlayers.org/data/raster/no-overviews.tif",
        overviews: ["https://openlayers.org/data/raster/no-overviews.tif.ovr"],
      },
    ],
  }),
  opacity: 0.6,
  visible: true,
});

export const availableLayers = [
  { name: "Mapbox Raster", layer: mapBoxRasterLayer },
  { name: "GeoTIFF EPSG:3857", layer: geoTiffLayer },
];

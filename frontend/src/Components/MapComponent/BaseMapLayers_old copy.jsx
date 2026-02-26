import GeoTIFF from "ol/source/GeoTIFF.js";
import TileArcGISRest from "ol/source/TileArcGISRest.js";
import TileLayer from "ol/layer/Tile.js";
import WebGLTileLayer from "ol/layer/WebGLTile.js";
import XYZ from "ol/source/XYZ.js";

const MAPBOX_PUBLIC_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const MAPBOX_USER = "craicerjack";
const TILESET_ID = "impact_e0db42b42ced448fafbb6d66a";
const MAPBOX_STYLE_ID = "cmm2i1ibc001201qyancw7xr1";
const TILE_SIZE = 512;
const DENSITY_SUFFIX = "@2x";

export const customBaseLayer = new TileLayer({
  source: new XYZ({
    url: `https://api.mapbox.com/styles/v1/craicerjack/cmm2i1ibc001201qyancw7xr1/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_PUBLIC_ACCESS_TOKEN}`,
    tileSize: 512,
    maxZoom: 22,
    crossOrigin: "anonymous",
  }),
  visible: true,
});

export const getTileLayerSource = () =>
  new XYZ({
    url: `https://api.mapbox.com/styles/v1/${MAPBOX_USER}/${MAPBOX_STYLE_ID}/tiles/${TILE_SIZE}/{z}/{x}/{y}${DENSITY_SUFFIX}?access_token=${MAPBOX_PUBLIC_ACCESS_TOKEN}`,
    tileSize: TILE_SIZE,
    maxZoom: 22, // you can adjust if your style maxzoom differs
    crossOrigin: "anonymous",
  });

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

// INFOMAR Broad Benthic Habitats (ArcGIS MapServer layer 0)
export const infomarBenthicLayer = new TileLayer({
  source: new TileArcGISRest({
    url: "https://maps.marine.ie/arcgis/rest/services/Infomar/INFOMAR_BroadBenthicHabitats/MapServer",
    params: {
      // optional: limit to sublayer 0 explicitly
      layers: "show:0",
      // recommended for crisp tiles
      format: "png32",
      transparent: true,
    },
    crossOrigin: "anonymous",
  }),
  opacity: 0.85, // tweak to taste
  visible: false, // off by default; toggle via UI
});

export const availableLayers = [
  { name: "Mapbox Raster", layer: mapBoxRasterLayer },
  { name: "GeoTIFF EPSG:3857", layer: geoTiffLayer },
  { name: "INFOMAR Benthic (ArcGIS)", layer: infomarBenthicLayer },
];

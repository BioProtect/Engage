import MVT from "ol/format/MVT.js";
import TileArcGISRest from "ol/source/TileArcGISRest.js";
import TileLayer from "ol/layer/Tile.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from "ol/source/VectorTile.js";
import XYZ from "ol/source/XYZ.js";

const MAPBOX_PUBLIC_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const MAPBOX_USER = "craicerjack";
const TILESET_ID = "impact_e0db42b42ced448fafbb6d66a";
const MAPBOX_STYLE = "streets-v12";
const MARTIN_BASE_URL = process.env.REACT_APP_MARTIN_BASE_URL;

export const getTileLayerSource = () =>
  new XYZ({
    url: `https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLE}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_PUBLIC_ACCESS_TOKEN}`,
    tileSize: 512,
    maxZoom: 22,
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

// Martin serves everything through two function sources (defined in the main
// BioProtect repo, server/db/functions): grid_tiles for planning grids and
// layer_tiles for features and activities. The table is named in ?layer=, so
// newly created data shows up without restarting Martin.
// `table` may be a bare table name or a "user.table" tileset id.
export const createMartinLayer = (table, alias, source = "layer_tiles") => ({
  id: table, // names are not unique (two activities can share one)
  name: alias,
  layer: new VectorTileLayer({
    source: new VectorTileSource({
      format: new MVT(),
      url: `${MARTIN_BASE_URL}/${source}/{z}/{x}/{y}?layer=${encodeURIComponent(table.split(".").pop())}`,
    }),
    visible: false,
  }),
});

export const availableLayers = [
  { id: "mapbox-raster", name: "Mapbox Raster", layer: mapBoxRasterLayer },
  {
    id: "infomar-benthic",
    name: "INFORMAR Benthic Layer",
    layer: infomarBenthicLayer,
  },
];

import MVT from "ol/format/MVT.js";
import TileArcGISRest from "ol/source/TileArcGISRest.js";
import TileLayer from "ol/layer/Tile.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from "ol/source/VectorTile.js";
import XYZ from "ol/source/XYZ.js";

const TILE_SOURCE = "mapbox";
const MAPBOX_PUBLIC_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const MAPBOX_USER = "craicerjack";
const TILESET_ID = "impact_e0db42b42ced448fafbb6d66a";
const MAPBOX_STYLE = "streets-v12";
//####################################################################################
// const MARTIN_BASE_URL = "http://localhost:3000";
const MARTIN_BASE_URL = process.env.REACT_APP_MARTIN_BASE_URL;
console.log("MARTIN_BASE_URL ", MARTIN_BASE_URL);
//####################################################################################

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

export const createPlanningUnitLayer = (tilesetid, alias) => {
  const tableName = tilesetid.includes(".")
    ? tilesetid.split(".")[1]
    : tilesetid;

  return {
    name: alias,
    layer: new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT(),
        url: `${MARTIN_BASE_URL}/${tableName}/{z}/{x}/{y}`,
      }),
      visible: false,
    }),
  };
};

export const availableLayers = [
  { name: "Mapbox Raster", layer: mapBoxRasterLayer },
  { name: "INFORMAR Benthic Layer", layer: infomarBenthicLayer },
];

export const createPlanningUnitLayer = (tilesetId, alias) => {
  const layer = new TileLayer({
    source: new XYZ({
      url: `https://api.mapbox.com/v4/${tilesetId}/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_PUBLIC_ACCESS_TOKEN}`,
      tileSize: 512,
      maxZoom: 22,
      crossOrigin: "anonymous",
    }),
    opacity: 0.7,
    visible: false,
  });
  return { name: alias, layer };
};

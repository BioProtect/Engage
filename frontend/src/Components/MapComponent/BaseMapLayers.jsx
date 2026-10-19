import MVT from "ol/format/MVT.js";
import OSM from "ol/source/OSM.js";
import TileArcGISRest from "ol/source/TileArcGISRest.js";
import TileLayer from "ol/layer/Tile.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from "ol/source/VectorTile.js";

const MARTIN_BASE_URL = process.env.REACT_APP_MARTIN_BASE_URL;

export const getTileLayerSource = () => new OSM();

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
  {
    id: "infomar-benthic",
    name: "INFORMAR Benthic Layer",
    layer: infomarBenthicLayer,
  },
];

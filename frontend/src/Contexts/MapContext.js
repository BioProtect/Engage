import React, { createContext, useContext, useRef, useState } from "react";

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [map, setMap] = useState(null);
  const [vectorSource, setVectorSource] = useState(null);

  const drawRef = useRef(null);
  const [drawnFeatures, setDrawnFeatures] = useState([]);

  const [activeDrawingRow, setActiveDrawingRow] = useState(null);

  const [selectedFeature, setSelectedFeature] = useState(null);

  const [geoTiffLayer, setGeoTiffLayer] = useState(null);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        vectorSource,
        setVectorSource,
        drawRef,
        drawnFeatures,
        setDrawnFeatures,
        activeDrawingRow,
        setActiveDrawingRow,
        selectedFeature,
        setSelectedFeature,
        geoTiffLayer,
        setGeoTiffLayer,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);

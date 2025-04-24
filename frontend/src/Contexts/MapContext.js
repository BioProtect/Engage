// src/contexts/MapContext.js
import React, { createContext, useContext, useRef, useState } from "react";

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [map, setMap] = useState(null);
  const [vectorSource, setVectorSource] = useState(null);

  // Shared drawRef and drawnFeatures
  const drawRef = useRef(null);
  const [drawnFeatures, setDrawnFeatures] = useState([]);

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
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);

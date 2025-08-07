import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";
import SuccessSnackbar from "../Components/DataMenuComponents/SnackBar";

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [map, setMap] = useState(null);
  const [vectorSource, setVectorSource] = useState(null);

  const drawRef = useRef(null);
  const selectRef = useRef(null);
  const [drawnFeatures, setDrawnFeatures] = useState([]);

  const [activeDrawingRow, setActiveDrawingRow] = useState(null);
  const [activeColor, setActiveColor] = useState(null);
  const [activeName, setActiveName] = useState(null);

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [geoTiffLayer, setGeoTiffLayer] = useState(null);

  const [visibilityMap, setVisibilityMap] = useState({});

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showSnackbar = useCallback((msg) => {
    setSnackbarMessage(msg);
    setSnackbarOpen(true);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handleCheckboxChange = useCallback(
    (id, isVisible) => {
      setVisibilityMap((prev) => ({ ...prev, [id]: isVisible }));

      drawnFeatures.forEach((feature) => {
        if (feature.get("id") === id) {
          if (isVisible) {
            if (!vectorSource.hasFeature(feature)) {
              vectorSource.addFeature(feature);
            }
          } else {
            vectorSource.removeFeature(feature);
            if (selectedFeature === feature) {
              setSelectedFeature(null);
              selectRef.current?.getFeatures().clear();
            }
          }
        }
      });
    },
    [drawnFeatures, selectedFeature, vectorSource]
  );

  const handleCheckboxSelection = useCallback(
    (id) => {
      const currentlyVisible = visibilityMap[id] !== false;
      handleCheckboxChange(id, !currentlyVisible);
    },
    [visibilityMap, handleCheckboxChange]
  );

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        vectorSource,
        setVectorSource,
        drawRef,
        selectRef,
        drawnFeatures,
        setDrawnFeatures,
        activeDrawingRow,
        setActiveDrawingRow,
        visibilityMap,
        handleCheckboxSelection,
        handleCheckboxChange,
        setVisibilityMap,
        activeColor,
        setActiveColor,
        activeName,
        setActiveName,
        selectedFeature,
        setSelectedFeature,
        geoTiffLayer,
        setGeoTiffLayer,
        showSnackbar,
      }}
    >
      {children}
      <SuccessSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        onClose={closeSnackbar}
      />
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);

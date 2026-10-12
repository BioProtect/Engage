import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import SuccessSnackbar from "../Components/DataMenuComponents/SnackBar";

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [map, setMap] = useState(null);
  const [vectorSource, setVectorSource] = useState(null);
  const [geoTiffLayer, setGeoTiffLayer] = useState(null);

  const drawRef = useRef(null);
  const selectRef = useRef(null);
  const [drawnFeatures, setDrawnFeatures] = useState([]);

  const [activeDrawingRow, setActiveDrawingRow] = useState(null);
  const [activeColor, setActiveColor] = useState(null);
  const [activeName, setActiveName] = useState(null);
  const [activeEunisCode, setActiveEunisCode] = useState(null);
  const [activeFeatureType, setActiveFeatureType] = useState(null);

  const [selectedFeature, setSelectedFeature] = useState(null);

  const [visibilityMap, setVisibilityMap] = useState({});

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarKey, setSnackbarKey] = useState(0);

  const [showLabels, setShowLabels] = useState(true);

  const drawnFeaturesRef = useRef(drawnFeatures);
  const selectedFeatureRef = useRef(selectedFeature);
  const vectorSourceRef = useRef(vectorSource);
  const visibilityMapRef = useRef(visibilityMap);

  drawnFeaturesRef.current = drawnFeatures;
  selectedFeatureRef.current = selectedFeature;
  vectorSourceRef.current = vectorSource;
  visibilityMapRef.current = visibilityMap;

  const showSnackbar = useCallback((msg, severity = "success") => {
    setSnackbarOpen(false);
    setTimeout(() => {
      setSnackbarMessage(msg);
      setSnackbarSeverity(severity);
      setSnackbarKey((k) => k + 1);
      setSnackbarOpen(true);
    }, 50);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handleCheckboxChange = useCallback((id, isVisible) => {
    // Same object back when nothing changed, so React skips the re-render
    setVisibilityMap((prev) =>
      prev[id] === isVisible ? prev : { ...prev, [id]: isVisible },
    );

    const vs = vectorSourceRef.current;
    if (!vs) return;

    drawnFeaturesRef.current.forEach((feature) => {
      if (feature.get("id") === id) {
        if (isVisible) {
          if (!vs.hasFeature(feature)) vs.addFeature(feature);
        } else {
          vs.removeFeature(feature);
          if (selectedFeatureRef.current === feature) {
            setSelectedFeature(null);
            selectRef.current?.getFeatures().clear();
          }
        }
      }
    });
  }, []);

  const handleCheckboxSelection = useCallback(
    (id) => {
      const currentlyVisible = visibilityMapRef.current[id] === true;
      handleCheckboxChange(id, !currentlyVisible);
    },
    [handleCheckboxChange],
  );

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        vectorSource,
        setVectorSource,
        geoTiffLayer,
        setGeoTiffLayer,
        drawRef,
        selectRef,
        drawnFeatures,
        setDrawnFeatures,
        activeDrawingRow,
        setActiveDrawingRow,
        visibilityMap,
        setVisibilityMap,
        handleCheckboxSelection,
        handleCheckboxChange,
        activeColor,
        setActiveColor,
        activeName,
        setActiveName,
        activeEunisCode,
        setActiveEunisCode,
        activeFeatureType,
        setActiveFeatureType,
        selectedFeature,
        setSelectedFeature,
        showSnackbar,
        showLabels,
        setShowLabels,
      }}
    >
      {children}
      <SuccessSnackbar
        key={snackbarKey}
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={closeSnackbar}
      />
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);

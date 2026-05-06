import { useEffect } from "react";
import Select from "ol/interaction/Select";
import { singleClick } from "ol/events/condition";
import { useMapContext } from "../../Contexts/MapContext";

export const useSelectionInteraction = ({
  map,
  createFeatureStyle,
  setSelectedFeature,
  selectRef,
}) => {
  const { showLabels } = useMapContext();

  useEffect(() => {
    if (!map) return;

    selectRef.current = new Select({
      condition: singleClick,
      style: (feature) =>
        createFeatureStyle(feature, { map, showLabels, selected: true }),
    });

    map.addInteraction(selectRef.current);

    selectRef.current.on("select", (e) => {
      setSelectedFeature(e.selected?.[0] || null);
    });

    return () => map.removeInteraction(selectRef.current);
  }, [map, createFeatureStyle, setSelectedFeature, selectRef, showLabels]);
};

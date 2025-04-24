import React, { useEffect, useRef } from 'react';
import Draw from 'ol/interaction/Draw.js';
import { Style, Fill, Stroke } from 'ol/style';
import Button from '@mui/material/Button';
import { useMapContext } from '../../Contexts/MapContext';

const DrawingComponent = ({
  name,
  rowId,
  isActive,
  setActiveDrawingRow,
  rowColor,
  visible,
  handleCheckboxChange,
}) => {
  const drawRef = useRef(null);
  const activeRowRef = useRef(null);
  const { map, vectorSource, drawnFeatures, setDrawnFeatures } = useMapContext();

  // Initialize drawRef once
  useEffect(() => {
    if (!drawRef.current && map) {
      drawRef.current = new Draw({
        source: vectorSource,
        type: 'Polygon',
        freehand: true,
      });

      drawRef.current.on('drawend', (event) => {
        const feature = event.feature;
        feature.set('id', activeRowRef.current);
        feature.setStyle(
          new Style({
            fill: new Fill({ color: rowColor + 'CC' }),
            stroke: new Stroke({ color: rowColor, width: 2 }),
            zIndex: 0,
          })
        );
        setDrawnFeatures((prev) => [...prev, feature]);
      });
    }
  }, [map, vectorSource, rowColor, setDrawnFeatures]);

  // Update the active interaction based on isActive
  useEffect(() => {
    if (!map || !drawRef.current) return;

    if (isActive) {
      activeRowRef.current = rowId;
      map.addInteraction(drawRef.current);
    } else {
      map.removeInteraction(drawRef.current);
    }

    return () => {
      // Clean-up if unmounting or deactivating
      if (map && map.getInteractions().getArray().includes(drawRef.current)) {
        map.removeInteraction(drawRef.current);
      }
    };
  }, [isActive, map, rowId]);

  // Update feature visibility styling
  useEffect(() => {
    drawnFeatures.forEach((feature) => {
      if (feature.get('id') === rowId) {
        feature.setStyle(
          new Style({
            fill: new Fill({ color: visible ? rowColor + 'CC' : 'transparent' }),
            stroke: new Stroke({ color: visible ? rowColor : 'transparent', width: 2 }),
            zIndex: 0,
          })
        );
      }
    });
  }, [visible, drawnFeatures, rowId, rowColor]);

  const toggleDrawing = () => {
    if (isActive) {
      map.removeInteraction(drawRef.current);
      setActiveDrawingRow(null);
    } else {
      setActiveDrawingRow(rowId);
      handleCheckboxChange(rowId, true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Button
        variant="contained"
        color={isActive ? 'error' : 'success'}
        onClick={toggleDrawing}
      >
        {isActive ? 'Stop Drawing' : 'Start Drawing'}
      </Button>
    </div>
  );
};

export default DrawingComponent;

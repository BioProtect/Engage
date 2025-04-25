import React, { useEffect, useRef } from 'react';
import Draw from 'ol/interaction/Draw.js';
import { Style, Fill, Stroke } from 'ol/style';
import EditIcon from '@mui/icons-material/Edit';
import StopIcon from '@mui/icons-material/Stop';
import { useMapContext } from '../../Contexts/MapContext';
import { IconButton, Tooltip } from '@mui/material';

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

  useEffect(() => {
    if (!map || !drawRef.current) return;

    if (isActive) {
      activeRowRef.current = rowId;
      map.addInteraction(drawRef.current);
    } else {
      map.removeInteraction(drawRef.current);
    }

    return () => {
     
      if (map && map.getInteractions().getArray().includes(drawRef.current)) {
        map.removeInteraction(drawRef.current);
      }
    };
  }, [isActive, map, rowId]);

  useEffect(() => {
    drawnFeatures.forEach((feature) => {
      if (feature.get('id') === rowId) {
        feature.setStyle(
          new Style({
            fill: new Fill({
              color: visible ? rowColor + '40' : 'transparent',
            }),
            stroke: new Stroke({
              color: visible ? rowColor : 'transparent',
              width: 4,
              lineDash: [6, 4],
            }),
            zIndex: 10,
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
    <Tooltip title={isActive ? 'Stop Drawing' : 'Start Drawing'} arrow>
  <IconButton
    onClick={toggleDrawing}
    color={isActive ? 'error' : 'success'}
    sx={{
      borderRadius: '12px',
      backgroundColor: isActive ? 'error.main' : 'success.main',
      color: '#fff',
      '&:hover': {
        backgroundColor: isActive ? 'error.dark' : 'success.dark',
      },
      boxShadow: 2,
    }}
  >
    {isActive ? <StopIcon /> : <EditIcon />}
  </IconButton>
</Tooltip>
    </div>
  );
};

export default DrawingComponent;

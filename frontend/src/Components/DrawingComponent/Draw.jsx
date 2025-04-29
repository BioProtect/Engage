import React, { useEffect, useRef, memo } from 'react';
import Draw from 'ol/interaction/Draw.js';
import { Style, Fill, Stroke } from 'ol/style';
import EditIcon from '@mui/icons-material/Edit';
import StopIcon from '@mui/icons-material/Stop';
import { useMapContext } from '../../Contexts/MapContext';
import { IconButton, Tooltip } from '@mui/material';
import {click} from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { getUid } from 'ol/util';

const DrawingComponent = ({
  name,
  rowId,
  isActive,
  rowColor,
  visible,
  handleCheckboxChange,
}) => {
  const { map, vectorSource, drawnFeatures, setDrawnFeatures, drawRef, setActiveDrawingRow, activeDrawingRow, setSelectedFeature } = useMapContext();

  const selectRef = useRef(null);
  
  const selected = new Style({
    fill: new Fill({
      color: '#eeeeee',
    }),
    stroke: new Stroke({
      color: 'rgba(255, 255, 255, 0.7)',
      width: 2,
    }),
  });

  function selectStyle(feature) {
    return new Style({
      fill: new Fill({
        color: 'rgba(51, 153, 204, 0.25)', // semi-transparent sky blue
      }),
      stroke: new Stroke({
        color: '#3399cc', // sky blue
        width: 4,
        lineDash: [6, 4], // mimic the default style
      }),
      zIndex: 11, // optional: draw on top
    });
  }
  

  const createFeatureStyle = (rowColor, visible) => {
    return new Style({
      fill: new Fill({
        color: visible ? `${rowColor}40` : 'transparent',
      }),
      stroke: new Stroke({
        color: visible ? rowColor : 'transparent',
        width: 4,
        lineDash: [6, 4],
      }),
      zIndex: 10,
    });
  };
  useEffect(() => {
    drawnFeatures.forEach((feature) => {
      if (feature.get('id') === rowId) {
        if (visible) {
          if (!vectorSource.hasFeature(feature)) {
            vectorSource.addFeature(feature);  
          }
          feature.setStyle(createFeatureStyle(rowColor, visible));
        } else {
          if (vectorSource.hasFeature(feature)) {
            vectorSource.removeFeature(feature);
          }
        }
      }
    });
  }, [visible, rowColor, drawnFeatures, rowId, vectorSource]);
  

  const toggleDrawing = () => {
    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
      setActiveDrawingRow(null);
      handleCheckboxChange(rowId, false);
    }
    if (selectRef.current) {
      map.removeInteraction(selectRef.current);
      selectRef.current = null;
    }
  
    if (!isActive || activeDrawingRow !== rowId) {
      const newDrawInteraction = new Draw({
        source: vectorSource,
        type: 'Polygon',
        freehand: true,
      });
  
      drawRef.current = newDrawInteraction;
      setActiveDrawingRow(rowId);
      handleCheckboxChange(rowId, true);
  
      newDrawInteraction.on('drawend', (event) => {
        const feature = event.feature;
        feature.set('id', rowId);
        feature.setStyle(createFeatureStyle(rowColor, visible));
        setDrawnFeatures((prev) => [...prev, feature]);
      });
  
      const selectInteraction = new Select({
        condition: click,
        style: selectStyle,
      });
  
      selectInteraction.on('select', (event) => {
        const selected = event.selected[0] || null;
        setSelectedFeature(selected);
      });
  
      selectRef.current = selectInteraction;
  
      map.addInteraction(selectInteraction);
      map.addInteraction(newDrawInteraction);
    } else {
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

export default memo(DrawingComponent);

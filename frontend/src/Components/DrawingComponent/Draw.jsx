import { Box, Divider, IconButton, Slider, Stack, Tooltip, Typography } from '@mui/material';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { memo, useEffect, useRef, useState } from 'react';

import Draw from 'ol/interaction/Draw.js';
import EditIcon from '@mui/icons-material/Edit';
import Overlay from 'ol/Overlay';
import PopupContent from '../DataMenuComponents/PopupContent';
import ReactDOM from 'react-dom/client';
import Select from 'ol/interaction/Select';
import StopIcon from '@mui/icons-material/Stop';
import { click } from 'ol/events/condition';
import { useMapContext } from '../../Contexts/MapContext';

const allOverlays = [];

const DrawingComponent = ({
  name,
  rowId,
  isActive,
  rowColor,
  visible,
  handleCheckboxChange,
}) => {
  const {
    map,
    vectorSource,
    drawnFeatures,
    setDrawnFeatures,
    drawRef,
    setActiveDrawingRow,
    activeDrawingRow,
    setSelectedFeature,
    selectedFeature,
  } = useMapContext();
  const selectRef = useRef(null);
  const overlayRef = useRef(null);
  const rootRef = useRef(null);
  const [density, setDensity] = useState(0);
  const [description, setDescription] = useState(''); // New description state

  const createFeatureStyle = (
    color,
    visible,
    feature,
    featureName,
    mapInstance,
    selected = false,
    selectedColor = null
  ) => {
    const baseFontSize = 20;
    let fontSize = baseFontSize;
    let textGeometry = null;

    if (
      feature &&
      feature.getGeometry() &&
      feature.getGeometry().getType() === 'Polygon' &&
      featureName &&
      mapInstance
    ) {
      const geom = feature.getGeometry();
      textGeometry = geom.getInteriorPoint();

      const coords = geom.getCoordinates()[0];
      const pixelCoords = coords.map((coord) => mapInstance.getPixelFromCoordinate(coord));

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      pixelCoords.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      });

      const boxWidth = maxX - minX;
      const boxHeight = maxY - minY;

      const estimatedTextWidth = (text) => text.length * fontSize * 0.6;

      while (
        (estimatedTextWidth(featureName) > boxWidth || fontSize > boxHeight) &&
        fontSize > 8
      ) {
        fontSize -= 1;
      }
    }

    const fillColor = visible
      ? selected && selectedColor
        ? selectedColor + '33'
        : color + '33'
      : 'transparent';

    const strokeColor = visible
      ? selected && selectedColor
        ? selectedColor
        : color
      : 'transparent';

    return new Style({
      fill: new Fill({
        color: fillColor,
      }),
      stroke: new Stroke({
        color: strokeColor,
        width: 4,
        lineDash: [6, 4],
      }),
      text: new Text({
        text: visible ? featureName : '',
        font: `${fontSize}px "Roboto", sans-serif`,
        fill: new Fill({ color: '#fff' }),
        stroke: new Stroke({ color: '#000', width: 3 }),
        overflow: true,
        placement: 'point',
        geometry: textGeometry,
      }),
      zIndex: 10,
    });
  };

  const selectedColor = '#0FA5EA';

  useEffect(() => {
    drawnFeatures.forEach((feature) => {
      if (feature.get('id') === rowId) {
        if (visible) {
          if (!vectorSource.hasFeature(feature)) {
            vectorSource.addFeature(feature);
          }
          const isSelected = selectedFeature === feature;
          feature.setStyle(
            createFeatureStyle(
              rowColor,
              visible,
              feature,
              name,
              map,
              isSelected,
              selectedColor
            )
          );
        } else {
          if (vectorSource.hasFeature(feature)) {
            vectorSource.removeFeature(feature);
          }
        }
      }
    });
  }, [visible, rowColor, drawnFeatures, rowId, vectorSource, name, map, selectedFeature, selectedColor]);

  const handleDelete = () => {
    if (!selectedFeature) return;
    vectorSource.removeFeature(selectedFeature);
    setDrawnFeatures((prev) => prev.filter((feature) => feature !== selectedFeature));
    setSelectedFeature(null);
  };

  // Reset density and description when selectedFeature changes (popup opens)
  useEffect(() => {
    if (selectedFeature && selectedFeature.get('id') === rowId) {
      const featureDensity = selectedFeature.get('density') ?? 0;
      setDensity(featureDensity);

      const featureDescription = selectedFeature.get('description') ?? '';
      setDescription(featureDescription);
    }
  }, [selectedFeature, rowId]);

  useEffect(() => {
    if (!map) return;

    if (selectedFeature && selectedFeature.get('id') === rowId && visible) {
      const geom = selectedFeature.getGeometry();
      let coordinates;

      if (geom.getType() === 'Polygon') {
        const coords = geom.getCoordinates()[0];
        coordinates = coords.reduce((top, point) => (point[1] > top[1] ? point : top), coords[0]);
      } else {
        coordinates = geom.getInteriorPoint
          ? geom.getInteriorPoint().getCoordinates()
          : geom.getCoordinates()[0][0];
      }

      if (!overlayRef.current) {
        allOverlays.forEach(({ overlay, root }) => {
          map.removeOverlay(overlay);
          if (root) root.unmount();
        });
        allOverlays.length = 0;

        const container = document.createElement('div');
        rootRef.current = ReactDOM.createRoot(container);

        const overlay = new Overlay({
          element: container,
          position: coordinates,
          positioning: 'bottom-center',
          offset: [0, -8],
          stopEvent: true,
        });

        map.addOverlay(overlay);
        overlayRef.current = overlay;

        allOverlays.push({ overlay, root: rootRef.current });
      } else {
        overlayRef.current.setPosition(coordinates);
      }

      rootRef.current.render(
        <PopupContent
          density={density}
          description={description}
          drawingName={name}
          onChange={(e, val) => {
            setDensity(val);
          }}
          onDescriptionChange={(val) => {
            setDescription(val);
          }}
          onSave={() => {
            if (selectedFeature) {
              selectedFeature.set('density', density);
              selectedFeature.set('description', description);
            }
            setSelectedFeature(null);
          }}
          onDelete={handleDelete}
          onClose={() => setSelectedFeature(null)}
        />
      );
    } else {
      if (overlayRef.current) {
        map.removeOverlay(overlayRef.current);
        const idx = allOverlays.findIndex((item) => item.overlay === overlayRef.current);
        if (idx !== -1) allOverlays.splice(idx, 1);
        overlayRef.current = null;
        if (rootRef.current) {
          rootRef.current.unmount();
          rootRef.current = null;
        }
      }
    }
  }, [selectedFeature, visible, rowId, map, name, handleDelete, density, description]);

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
        feature.set('density', 0);
        feature.set('description', ''); // initialize description empty on new feature
        feature.setStyle(createFeatureStyle(rowColor, visible, feature, name, map));
        setDrawnFeatures((prev) => [...prev, feature]);
        setSelectedFeature(feature);
      });

      const selectInteraction = new Select({
        condition: click,
      });

      selectInteraction.on('select', (event) => {
        const selected = event.selected[0] || null;
        setSelectedFeature(selected);
      });

      selectRef.current = selectInteraction;

      map.addInteraction(selectInteraction);
      map.addInteraction(newDrawInteraction);
    } else {
      if (drawnFeatures.some((feature) => feature.get('id') === rowId)) {
        handleCheckboxChange(rowId, true);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Tooltip title={isActive ? 'Stop Drawing' : 'Start Drawing'} arrow>
        <IconButton
          onClick={toggleDrawing}
          color={isActive ? 'error' : 'success'}
          sx={{
            borderRadius: 2,
            backgroundColor: isActive ? 'error.main' : 'success.main',
            color: '#fff',
            '&:hover': {
              backgroundColor: isActive ? 'error.dark' : 'success.dark',
            },
          }}
          aria-label={isActive ? 'stop drawing' : 'start drawing'}
          size="small"
        >
          {isActive ? <StopIcon /> : <EditIcon />}
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default memo(DrawingComponent);

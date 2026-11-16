import * as olExtent from 'ol/extent'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useMapContext } from '../../Contexts/MapContext'
import { DistanceTooltip } from './DistanceTooltip'
import { createFeatureStyle } from './FeatureStyle'
import PinchWarningSnackbar from './PinchWarningSnackbar'
import { useDrawingInteraction } from './useDrawingInteraction'
import { usePopupOverlay } from './usePopupOverlay'
import { useSelectionInteraction } from './useSelectionInteraction'

function DrawingLayer() {
  const {
    map,
    vectorSource,
    selectRef,
    setDrawnFeatures,
    drawnFeatures,
    activeColor,
    activeDrawingRow,
    activeName,
    activeEunisCode,
    activeFeatureType,
    handleCheckboxChange,
    visibilityMap,
    selectedFeature,
    setSelectedFeature,
    showSnackbar,
    showLabels,
  } = useMapContext()

  const colorRef = useRef(activeColor)
  const idRef = useRef(activeDrawingRow)
  const nameRef = useRef(activeName)
  const eunisCombdRef = useRef(activeEunisCode)
  const featureTypeRef = useRef(activeFeatureType)
  // Mirrors `shouldDraw` so `useDrawingInteraction` can seed the active state
  // of a Draw it rebuilds internally (e.g. after pinch-zoom recovery).
  const shouldDrawRef = useRef(false)

  useEffect(() => {
    colorRef.current = activeColor
    idRef.current = activeDrawingRow
    nameRef.current = activeName
    eunisCombdRef.current = activeEunisCode
    featureTypeRef.current = activeFeatureType
  }, [
    activeColor,
    activeDrawingRow,
    activeName,
    activeEunisCode,
    activeFeatureType,
  ])

  const [density, setDensity] = useState(1)
  const [description, setDescription] = useState('')

  // Load the popup fields from a newly selected feature. Done during render
  // (React's "adjust state when a prop changes" pattern), not in an effect.
  const [loadedFeature, setLoadedFeature] = useState(null)
  if (selectedFeature !== loadedFeature) {
    setLoadedFeature(selectedFeature)
    if (selectedFeature) {
      setDensity(selectedFeature.get('density') ?? 1)
      setDescription(selectedFeature.get('description') ?? '')
    }
  }

  const handleDelete = useCallback(
    (featureToDelete = selectedFeature) => {
      if (!featureToDelete || !vectorSource)
        return

      const rowId = featureToDelete.get('id')
      const drawingNumber = featureToDelete.get('drawingNumber')
      const timestamp = featureToDelete.get('timestamp')

      const matchesFeatureToDelete = feature =>
        feature === featureToDelete
        || (feature.get('id') === rowId
          && feature.get('drawingNumber') === drawingNumber
          && feature.get('timestamp') === timestamp)

      selectRef.current?.getFeatures().clear()
      setSelectedFeature(null)

      vectorSource
        .getFeatures()
        .filter(matchesFeatureToDelete)
        .forEach(feature => vectorSource.removeFeature(feature))
      vectorSource.changed()

      setDrawnFeatures((prev) => {
        const updated = prev.filter(
          feature => !matchesFeatureToDelete(feature),
        )

        const featuresForRow = updated
          .filter(f => f.get('id') === rowId)
          .sort(
            (a, b) =>
              new Date(a.get('timestamp')) - new Date(b.get('timestamp')),
          )

        featuresForRow.forEach((f, index) => f.set('drawingNumber', index + 1))
        featuresForRow.forEach(f =>
          f.setStyle(
            createFeatureStyle(f, {
              map,
              showLabels: true,
              selected: f === selectedFeature,
            }),
          ),
        )

        return updated
      })

      const name = featureToDelete.get('name') || 'Unknown'
      showSnackbar(`Successfully deleted Drawing ${drawingNumber} of ${name}!`)
    },
    [
      selectedFeature,
      vectorSource,
      setDrawnFeatures,
      setSelectedFeature,
      selectRef,
      showSnackbar,
      map,
    ],
  )

  const {
    drawRef,
    tooltipCoord,
    tooltipText,
    isDrawing,
    showPinchWarning,
    setShowPinchWarning,
  } = useDrawingInteraction({
    map,
    vectorSource,
    colorRef,
    idRef,
    nameRef,
    eunisCombdRef,
    featureTypeRef,
    setDrawnFeatures,
    handleCheckboxChange,
    selectRef,
    setSelectedFeature,
    createFeatureStyle,
    showSnackbar,
    shouldDrawRef,
  })

  useSelectionInteraction({
    map,
    createFeatureStyle,
    setSelectedFeature,
    selectRef,
  })

  usePopupOverlay({
    map,
    selectedFeature,
    density,
    description,
    setDensity,
    setDescription,
    setSelectedFeature,
    handleDelete,
    visibilityMap,
    activeDrawingRow,
    selectRef,
  })

  const prevActiveDrawingRowRef = useRef(null)
  useEffect(() => {
    const currentRow = activeDrawingRow
    const previousRow = prevActiveDrawingRowRef.current
    const shouldDraw = !!(activeColor && currentRow)
    shouldDrawRef.current = shouldDraw
    drawRef.current?.setActive(shouldDraw)

    if (shouldDraw && currentRow) {
      handleCheckboxChange(currentRow, true)
    }
    else if (!shouldDraw && previousRow) {
      const hasDrawings = drawnFeatures.some(
        feature => String(feature.get('id')) === String(previousRow),
      )
      if (!hasDrawings)
        handleCheckboxChange(previousRow, false)
    }

    prevActiveDrawingRowRef.current = currentRow
  }, [
    activeDrawingRow,
    activeColor,
    drawnFeatures,
    handleCheckboxChange,
    drawRef,
  ])

  useEffect(() => {
    if (!map || !selectedFeature)
      return

    if (drawRef.current?.getActive())
      return

    const geometry = selectedFeature.getGeometry()
    if (!geometry)
      return

    const center = olExtent.getCenter(geometry.getExtent())
    map.getView().animate({
      center,
      duration: 500,
    })
  }, [map, selectedFeature, drawRef])

  useEffect(() => {
    if (!map)
      return

    drawnFeatures.forEach((feature) => {
      const selected = feature === selectedFeature
      const style = createFeatureStyle(feature, {
        map,
        showLabels,
        selected,
      })
      feature.setStyle(style)
    })
  }, [
    drawnFeatures,
    selectedFeature,
    showLabels,
    map,
  ])

  return (
    <>
      {isDrawing && tooltipCoord && activeDrawingRow && (
        <DistanceTooltip
          map={map}
          coordinate={tooltipCoord}
          text={tooltipText}
          activeDrawingRow={activeDrawingRow}
        />
      )}

      <PinchWarningSnackbar
        open={showPinchWarning}
        onClose={() => setShowPinchWarning(false)}
        duration={5000}
      />
    </>
  )
}

export default DrawingLayer

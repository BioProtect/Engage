import { Overlay } from 'ol'
import { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useMapContext } from '../../Contexts/MapContext'
import PopupContent from './PopupContent'

const allOverlays = []

// Highest and lowest vertex of a polygon/line, for placing the popup above
// or below the shape.
function verticalExtremes(geom) {
  const coords = geom.getType() === 'Polygon'
    ? geom.getCoordinates()[0]
    : geom.getCoordinates()
  let top = coords[0]
  let bottom = coords[0]
  coords.forEach((pt) => {
    if (pt[1] > top[1])
      top = pt
    if (pt[1] < bottom[1])
      bottom = pt
  })
  return [top, bottom]
}

export function usePopupOverlay({
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
}) {
  const overlayRef = useRef(null)
  const rootRef = useRef(null)
  const { showSnackbar } = useMapContext()
  const [zoom, setZoom] = useState(map?.getView().getZoom() || 10)
  const [saveRevision, setSaveRevision] = useState(0)

  // Take this hook's overlay off the map and unmount its React root. The
  // root is captured first: queueMicrotask runs later, when rootRef is null.
  const removeOverlay = (map) => {
    if (overlayRef.current) {
      map.removeOverlay(overlayRef.current)
      const idx = allOverlays.findIndex(o => o.overlay === overlayRef.current)
      if (idx !== -1)
        allOverlays.splice(idx, 1)
      overlayRef.current = null
    }
    const rootToUnmount = rootRef.current
    rootRef.current = null
    if (rootToUnmount)
      queueMicrotask(() => rootToUnmount.unmount())
  }

  useEffect(() => {
    if (!map)
      return
    const view = map.getView()
    const updateZoom = () => setZoom(view.getZoom())
    view.on('change:resolution', updateZoom)
    return () => view.un('change:resolution', updateZoom)
  }, [map])

  useEffect(() => {
    if (!map)
      return

    return () => removeOverlay(map)
  }, [map])

  useEffect(() => {
    if (!map)
      return

    const isVisible = visibilityMap?.[activeDrawingRow] !== false
    if (!selectedFeature || !isVisible) {
      removeOverlay(map)
      return
    }

    const geom = selectedFeature.getGeometry()
    if (!geom)
      return

    const [topPoint, bottomPoint] = verticalExtremes(geom)

    const topPixel = map.getPixelFromCoordinate(topPoint)
    const popupHeightPx = 140
    const showAbove = topPixel[1] - popupHeightPx > 0

    const positioning = showAbove ? 'bottom-center' : 'top-center'
    const offset = showAbove
      ? [0, -8]
      : [0, 8]
    const popupCoordinate = showAbove ? topPoint : bottomPoint

    if (!overlayRef.current) {
      allOverlays.forEach(({ overlay, root }) => {
        map.removeOverlay(overlay)
        root?.unmount()
      })
      allOverlays.length = 0

      const container = document.createElement('div')
      const root = ReactDOM.createRoot(container)
      const overlay = new Overlay({
        element: container,
        position: popupCoordinate,
        positioning,
        offset,
        stopEvent: true,
      })
      map.addOverlay(overlay)

      overlayRef.current = overlay
      rootRef.current = root
      allOverlays.push({ overlay, root })
    }
    else {
      overlayRef.current.setPosition(popupCoordinate)
      overlayRef.current.setPositioning(positioning)
      overlayRef.current.setOffset(offset)
    }

    const direction = showAbove ? 'bottom' : 'top'

    const savedDensity = selectedFeature?.get('density') ?? 1
    const savedDescription = selectedFeature?.get('description') ?? ''
    const isDirty = density !== savedDensity || description !== savedDescription
    const drawingName = selectedFeature?.get('name') || ''
    const itemName = drawingName || 'this item'
    const drawingNumber = selectedFeature?.get('drawingNumber')
    const drawingLabel = drawingNumber
      ? `Drawing ${drawingNumber}`
      : 'Drawing'

    rootRef.current.render(
      <PopupContent
        density={density}
        description={description}
        drawingName={drawingName}
        drawingNumber={drawingNumber}
        areaLabel={selectedFeature?.get('areaLabel')}
        featureColor={selectedFeature?.get('color')}
        onChange={(e, val) => setDensity(val)}
        onDescriptionChange={setDescription}
        isDirty={isDirty}
        onSave={() => {
          if (selectedFeature) {
            selectedFeature.set('density', density)
            selectedFeature.set('description', description)
          }
          setSaveRevision(current => current + 1)
          showSnackbar(
            `Density and description saved for ${drawingLabel} of ${itemName}.`,
          )
        }}
        onCancel={() => {
          setDensity(selectedFeature?.get('density') ?? 1)
          setDescription(selectedFeature?.get('description') ?? '')
        }}
        onDelete={() => handleDelete(selectedFeature)}
        onClose={() => {
          setSelectedFeature(null)
          selectRef.current?.getFeatures().clear()
        }}
        direction={direction}
        zoom={zoom}
      />,
    )
  }, [
    map,
    selectedFeature,
    density,
    description,
    visibilityMap,
    activeDrawingRow,
    setDensity,
    setDescription,
    setSelectedFeature,
    handleDelete,
    selectRef,
    showSnackbar,
    zoom,
    saveRevision,
  ])
}

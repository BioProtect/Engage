import Draw from 'ol/interaction/Draw'

import { useCallback, useEffect, useRef, useState } from 'react'
import { formatArea } from './FeatureStyle'

const EPSILON = 1e-9

function pointsEqual(a, b) {
  return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON
}

function crossProduct(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
}

function segmentsProperlyIntersect(a1, a2, b1, b2) {
  if (
    pointsEqual(a1, b1)
    || pointsEqual(a1, b2)
    || pointsEqual(a2, b1)
    || pointsEqual(a2, b2)
  ) {
    return false
  }

  const d1 = crossProduct(a1, a2, b1)
  const d2 = crossProduct(a1, a2, b2)
  const d3 = crossProduct(b1, b2, a1)
  const d4 = crossProduct(b1, b2, a2)

  if (Math.abs(d1) < EPSILON || Math.abs(d2) < EPSILON) {
    return false
  }
  if (Math.abs(d3) < EPSILON || Math.abs(d4) < EPSILON) {
    return false
  }

  return (
    ((d1 > EPSILON && d2 < -EPSILON) || (d1 < -EPSILON && d2 > EPSILON))
    && ((d3 > EPSILON && d4 < -EPSILON) || (d3 < -EPSILON && d4 > EPSILON))
  )
}

function isSelfIntersecting(ring = []) {
  const n = ring.length - 1
  if (n < 4)
    return false

  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1)
        continue
      if (segmentsProperlyIntersect(ring[i], ring[i + 1], ring[j], ring[j + 1]))
        return true
    }
  }

  return false
}

export function useDrawingInteraction({
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
  // Ref mirroring the parent's "should the user be drawing right now?" flag.
  // Used inside `createDraw` so a Draw rebuilt during pinch-zoom recovery
  // inherits the correct active state (the parent's activation effect won't
  // re-fire for ref/internal-only changes).
  shouldDrawRef,
}) {
  const drawRef = useRef(null)
  const [tooltipCoord, setTooltipCoord] = useState(null)
  const [tooltipText, setTooltipText] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const pinchActiveRef = useRef(false)
  const [showPinchWarning, setShowPinchWarning] = useState(false)
  const warningTimeoutRef = useRef(null)
  const stylusActiveRef = useRef(false)
  const blockedTouchIdsRef = useRef(new Set())

  const createDraw = useCallback(() => {
    if (!map || !vectorSource)
      return

    if (drawRef.current) {
      drawRef.current.setActive(false)
      map.removeInteraction(drawRef.current)
      drawRef.current = null
    }

    const draw = new Draw({
      source: vectorSource,
      type: 'Polygon',
      freehand: true,
    })

    // Default to inactive on first creation; the parent's activation effect
    // sets it true when a row+color are picked. A pinch-zoom rebuild does not
    // re-fire that effect, so seed from the ref and the new Draw keeps the
    // user's current intent.
    draw.setActive(!!shouldDrawRef?.current)

    let pointerMoveHandler = null

    draw.on('drawstart', (evt) => {
      const sketch = evt.feature
      setIsDrawing(true)
      setTooltipCoord(null)
      setTooltipText('')

      pointerMoveHandler = (evt) => {
        const geom = sketch.getGeometry()
        if (!geom)
          return
        setTooltipText(formatArea(geom))
        setTooltipCoord(evt.coordinate)
      }

      map.on('pointermove', pointerMoveHandler)
    })

    const clearTooltip = () => {
      if (pointerMoveHandler) {
        map.un('pointermove', pointerMoveHandler)
        pointerMoveHandler = null
      }
      setIsDrawing(false)
      setTooltipCoord(null)
      setTooltipText('')
    }

    draw.on('drawabort', clearTooltip)

    draw.on('drawend', (evt) => {
      clearTooltip()

      const feature = evt.feature
      const geom = feature.getGeometry()
      const ring = geom?.getCoordinates?.()?.[0] || []

      if (isSelfIntersecting(ring)) {
        window.setTimeout(() => {
          vectorSource.removeFeature(feature)
        }, 0)
        selectRef.current?.getFeatures().clear()
        setSelectedFeature(null)
        showSnackbar(
          'This drawing overlaps itself. Please redraw it without crossing over.',
          'error',
        )
        return
      }

      const existing = vectorSource
        .getFeatures()
        .filter(f => f.get('id') === idRef.current)

      const drawingNumber = existing.length + 1

      feature.set('id', idRef.current || 'UnnamedID')
      feature.set('name', nameRef.current || 'Unnamed')
      feature.set('color', colorRef.current || '#000')
      feature.set('timestamp', new Date().toISOString())
      feature.set('drawingNumber', drawingNumber)
      feature.set('areaLabel', geom
        ? formatArea(geom)
        : '')
      feature.set('euniscombd', eunisCombdRef?.current || null)
      feature.set('featureType', featureTypeRef?.current || null)

      feature.setStyle(createFeatureStyle(feature, { map }))

      setDrawnFeatures(prev => [...prev, feature])
      handleCheckboxChange(idRef.current, true)

      selectRef.current?.getFeatures().clear()
      selectRef.current?.getFeatures().push(feature)
      setSelectedFeature(feature)
    })

    map.addInteraction(draw)
    drawRef.current = draw

    return draw
  }, [
    map,
    vectorSource,
    colorRef,
    idRef,
    nameRef,
    setDrawnFeatures,
    handleCheckboxChange,
    selectRef,
    setSelectedFeature,
    createFeatureStyle,
    eunisCombdRef,
    featureTypeRef,
    showSnackbar,
    shouldDrawRef,
  ])

  useEffect(() => {
    if (!map || !vectorSource)
      return

    createDraw()

    const pointerDownHandler = (evt) => {
      if (evt.pointerType === 'stylus') {
        stylusActiveRef.current = true
        return
      }

      if (evt.pointerType === 'touch') {
        if (stylusActiveRef.current) {
          blockedTouchIdsRef.current.add(evt.pointerId)
          evt.stopPropagation()
          return
        }

        if (!evt.isPrimary && drawRef.current?.getActive()) {
          pinchActiveRef.current = true
          setShowPinchWarning(true)
          if (warningTimeoutRef.current)
            clearTimeout(warningTimeoutRef.current)
          warningTimeoutRef.current = setTimeout(setShowPinchWarning, 5000, false)
          drawRef.current.setActive(false)
          map.removeInteraction(drawRef.current)
          drawRef.current = null
        }
      }
    }

    const pointerMoveHandler = (evt) => {
      if (blockedTouchIdsRef.current.has(evt.pointerId)) {
        evt.stopPropagation()
      }
    }

    const pointerUpHandler = (evt) => {
      if (evt.pointerType === 'stylus') {
        stylusActiveRef.current = false
        return
      }

      if (blockedTouchIdsRef.current.has(evt.pointerId)) {
        blockedTouchIdsRef.current.delete(evt.pointerId)
        evt.stopPropagation()
        return
      }

      if (pinchActiveRef.current) {
        pinchActiveRef.current = false
        createDraw()
      }
    }

    const pointerCancelHandler = (evt) => {
      if (evt.pointerType === 'stylus')
        stylusActiveRef.current = false
      blockedTouchIdsRef.current.delete(evt.pointerId)
    }

    const viewport = map.getViewport()
    viewport.addEventListener('pointerdown', pointerDownHandler, {
      capture: true,
    })
    viewport.addEventListener('pointermove', pointerMoveHandler, {
      capture: true,
    })
    viewport.addEventListener('pointerup', pointerUpHandler, { capture: true })
    viewport.addEventListener('pointercancel', pointerCancelHandler, {
      capture: true,
    })

    return () => {
      viewport.removeEventListener('pointerdown', pointerDownHandler, {
        capture: true,
      })
      viewport.removeEventListener('pointermove', pointerMoveHandler, {
        capture: true,
      })
      viewport.removeEventListener('pointerup', pointerUpHandler, {
        capture: true,
      })
      viewport.removeEventListener('pointercancel', pointerCancelHandler, {
        capture: true,
      })

      if (warningTimeoutRef.current)
        clearTimeout(warningTimeoutRef.current)

      if (drawRef.current) {
        drawRef.current.setActive(false)
        map.removeInteraction(drawRef.current)
        drawRef.current = null
      }
    }
  }, [map, vectorSource, createDraw])

  return {
    drawRef,
    tooltipCoord,
    tooltipText,
    isDrawing,
    showPinchWarning,
    setShowPinchWarning,
  }
}

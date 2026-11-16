import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import {
  Box,
  Divider,
  IconButton,
  Popper,
  Typography,
} from '@mui/material'
import { useMapContext } from '../../Contexts/MapContext'
import { createFeatureStyle } from './FeatureStyle'

function DrawingDropdown({ anchorEl, open, onClose, row, drawings }) {
  const {
    map,
    selectRef,
    setSelectedFeature,
    vectorSource,
    setDrawnFeatures,
    handleCheckboxChange,
    showSnackbar,
  } = useMapContext()

  const handleGoToDrawing = (feature) => {
    if (!map)
      return
    const geometry = feature.getGeometry()
    if (!geometry)
      return

    const view = map.getView()
    view.fit(geometry.getExtent(), {
      padding: [40, 40, 40, 40],
      duration: 700,
      maxZoom: 6,
    })

    setSelectedFeature(feature)
    selectRef.current?.getFeatures().clear()
    selectRef.current?.getFeatures().push(feature)
    handleCheckboxChange(row.id, true)
  }

  const handleDeleteDrawing = (feature) => {
    vectorSource.removeFeature(feature)

    setDrawnFeatures((prev) => {
      const updated = prev.filter(f => f !== feature)
      const sameRowFeatures = updated
        .filter(f => f.get('id') === row.id)
        .sort((a, b) => new Date(a.get('timestamp')) - new Date(b.get('timestamp')))
      sameRowFeatures.forEach((f, index) => {
        f.set('drawingNumber', index + 1)
        f.setStyle(createFeatureStyle(f, { map, showLabels: true }))
      })
      return updated
    })

    if (feature === selectRef.current?.getFeatures().getArray()[0]) {
      selectRef.current?.getFeatures().clear()
      setSelectedFeature(null)
    }

    showSnackbar(`Successfully deleted Drawing ${feature.get('drawingNumber')} of ${row.name}!`)
  }

  if (!open)
    return null

  return (
    <>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 12],
            },
          },
        ]}
        style={{ zIndex: 1300 }}
      >
        <Box sx={{ position: 'relative', overflow: 'visible' }}>
          {/* Arrow */}
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '9px solid rgba(255,255,255,0.6)',
              zIndex: 2,
              filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.06))',
            }}
          />

          <Box
            sx={{
              width: 260,
              maxHeight: 340,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              background: 'rgba(235, 242, 255, 0.55)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.25,
                background: 'rgba(255,255,255,0.4)',
                borderBottom: '1px solid rgba(255,255,255,0.5)',
              }}
            >
              <Box sx={{ width: 28 }} />
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flex: 1,
                justifyContent: 'center',
              }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: row.color,
                    boxShadow: `0 0 6px ${row.color}`,
                  }}
                />
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1a1a2e' }}>
                  {row.name}
                </Typography>
              </Box>
              <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(0,0,0,0.4)', p: '3px' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Drawing list */}
            <Box
              sx={{
                'overflowY': 'auto',
                'p': 1,
                'display': 'flex',
                'flexDirection': 'column',
                'gap': 0.75,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': { borderRadius: 10, bgcolor: 'rgba(25,118,210,0.3)' },
                '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'rgba(25,118,210,0.5)' },
              }}
            >
              {drawings.length === 0
                ? (
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(0,0,0,0.45)', py: 2 }}>
                      No drawings yet
                    </Typography>
                  )
                : (
                    drawings.map((f, idx) => {
                      const isSelected = f === selectRef.current?.getFeatures().getArray()[0]
                      return (
                        <Box
                          key={f.ol_uid || idx}
                          onClick={() => handleGoToDrawing(f)}
                          sx={{
                            'display': 'flex',
                            'alignItems': 'center',
                            'justifyContent': 'space-between',
                            'px': 1.5,
                            'py': 1,
                            'borderRadius': 2,
                            'cursor': 'pointer',
                            'background': isSelected
                              ? 'rgba(25,118,210,0.18)'
                              : 'rgba(255,255,255,0.45)',
                            'border': isSelected
                              ? '1px solid rgba(25,118,210,0.35)'
                              : '1px solid rgba(255,255,255,0.6)',
                            'transition': 'all 0.15s ease',
                            '&:hover': { background: 'rgba(25,118,210,0.1)', border: '1px solid rgba(25,118,210,0.2)' },
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a2e', fontSize: '0.82rem' }}>
                              Drawing
                              {' '}
                              {f.get('drawingNumber') || idx + 1}
                            </Typography>

                            {f.get('description') && (
                              <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', display: 'block' }} noWrap>
                                {f.get('description')}
                              </Typography>
                            )}

                            {f.get('density') !== undefined && (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  mt: 0.25,
                                  px: 1,
                                  py: 0.2,
                                  borderRadius: 1,
                                  bgcolor: 'rgba(25,118,210,0.12)',
                                  color: '#1565c0',
                                  fontWeight: 600,
                                  fontSize: '0.62rem',
                                }}
                              >
                                Density:
                                {' '}
                                {f.get('density')}
                              </Box>
                            )}
                          </Box>

                          <Box sx={{
                            display: 'flex',
                            gap: 0.5,
                            flexShrink: 0,
                            ml: 1,
                          }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleGoToDrawing(f) }}
                              sx={{
                                'p': 0.5,
                                'borderRadius': 1.5,
                                'bgcolor': 'rgba(25,118,210,0.12)',
                                'color': '#1976d2',
                                '&:hover': { bgcolor: 'rgba(25,118,210,0.25)' },
                              }}
                            >
                              <MyLocationIcon sx={{ fontSize: 15 }} />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleDeleteDrawing(f) }}
                              sx={{
                                'p': 0.5,
                                'borderRadius': 1.5,
                                'bgcolor': 'rgba(244,67,54,0.1)',
                                'color': '#f44336',
                                '&:hover': { bgcolor: 'rgba(244,67,54,0.22)' },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      )
                    })
                  )}
            </Box>

            {/* Footer count */}
            {drawings.length > 0 && (
              <>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.5)' }} />
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: 'center',
                    py: 0.75,
                    color: 'rgba(0,0,0,0.4)',
                    fontWeight: 500,
                  }}
                >
                  {drawings.length}
                  {' '}
                  drawing
                  {drawings.length !== 1
                    ? 's'
                    : ''}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Popper>

    </>
  )
}

export default DrawingDropdown

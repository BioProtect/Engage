import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import UndoIcon from '@mui/icons-material/Undo'
import {
  Box,
  Button,
  Divider,
  IconButton,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

// Body of the map popup for a selected drawing (density, description,
// save/undo/delete), rendered into an OpenLayers overlay by usePopupOverlay.
function PopupContent({
  density,
  onChange,
  drawingName,
  drawingNumber,
  areaLabel,
  featureColor,
  onSave,
  onDelete,
  onCancel,
  onClose,
  description,
  onDescriptionChange,
  isDirty = false,
  direction = 'top',
}) {
  const maxLength = 50

  return (
    <Box
      sx={{
        position: 'relative',
        background: 'rgba(235, 242, 255, 0.55)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: '12px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
        width: 200,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.25,
          py: 0.6,
          background: 'rgba(255,255,255,0.2)',
          borderBottom: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <Box sx={{ width: 22, flexShrink: 0 }} />
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          flex: 1,
          minWidth: 0,
        }}
        >
          {featureColor && (
            <Box sx={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              bgcolor: featureColor,
              flexShrink: 0,
              boxShadow: `0 0 5px ${featureColor}`,
            }}
            />
          )}
          <Typography sx={{
            fontWeight: 700,
            fontSize: '0.82rem',
            color: '#1a1a2e',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          >
            {drawingName}
          </Typography>
        </Box>
        <Tooltip title="Close popup" placement="top" arrow>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              'color': 'rgba(0,0,0,0.55)',
              'p': '4px',
              'flexShrink': 0,
              'bgcolor': 'rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.18)', color: 'rgba(0,0,0,0.75)' },
            }}
          >
            <CloseIcon sx={{ fontSize: 15, strokeWidth: 1 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Drawing badge + area */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        px: 1.25,
        pt: 0.75,
        pb: 0,
      }}
      >
        <Box sx={{
          px: 1,
          py: 0.25,
          borderRadius: '6px',
          bgcolor: 'rgba(25,118,210,0.1)',
          border: '1px solid rgba(25,118,210,0.2)',
        }}
        >
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#1565c0' }}>
            Drawing
            {' '}
            {drawingNumber}
          </Typography>
        </Box>
        {areaLabel && (
          <Box sx={{
            px: 1,
            py: 0.25,
            borderRadius: '6px',
            bgcolor: 'rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
          >
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)' }}>
              {areaLabel}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Body */}
      <Box sx={{
        px: 1.25,
        pt: 0.75,
        pb: 0.75,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.85,
      }}
      >
        {/* Density */}
        <Box>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
          }}
          >
            <Typography sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'rgba(0,0,0,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
            >
              Density
            </Typography>
            <Box sx={{
              px: 0.85,
              py: 0.15,
              borderRadius: '6px',
              bgcolor: 'rgba(25,118,210,0.1)',
              border: '1px solid rgba(25,118,210,0.2)',
            }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#1565c0' }}>{density}</Typography>
            </Box>
          </Box>
          <Slider
            value={density}
            min={1}
            max={100}
            size="small"
            onChange={onChange}
            sx={{
              'py': 0.5,
              '& .MuiSlider-track': { border: 'none', background: 'linear-gradient(90deg, #1976d2, #42a5f5)' },
              '& .MuiSlider-rail': { opacity: 0.25, bgcolor: '#90a4ae' },
              '& .MuiSlider-thumb': {
                'width': 14,
                'height': 14,
                'bgcolor': '#fff',
                'border': '2px solid #1976d2',
                '&:hover': { boxShadow: '0 0 0 6px rgba(25,118,210,0.16)' },
                '&.Mui-active': { boxShadow: '0 0 0 10px rgba(25,118,210,0.16)' },
              },
            }}
          />
        </Box>

        {/* Description */}
        <Box>
          <Typography sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            mb: 0.5,
          }}
          >
            Description
          </Typography>
          <TextField
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            size="small"
            fullWidth
            placeholder="Add a description…"
            inputProps={{ maxLength }}
            sx={{
              '& .MuiOutlinedInput-root': {
                'borderRadius': '8px',
                'fontSize': '0.8rem',
                'background': 'rgba(255,255,255,0.35)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.55)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.8)' },
                '&.Mui-focused fieldset': { borderColor: 'rgba(25,118,210,0.5)' },
              },
            }}
          />
          <Typography sx={{
            fontSize: '0.63rem',
            color: 'rgba(0,0,0,0.35)',
            mt: 0.3,
            textAlign: 'right',
          }}
          >
            {description.length}
            /
            {maxLength}
          </Typography>
        </Box>

        {/* Unsaved indicator */}
        {isDirty && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            px: 1,
            py: 0.4,
            borderRadius: '8px',
            bgcolor: 'rgba(237,108,2,0.1)',
            border: '1px solid rgba(237,108,2,0.25)',
          }}
          >
            <EditIcon sx={{ fontSize: 11, color: '#e65100' }} />
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#e65100' }}>Unsaved changes</Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.5)' }} />

      {/* Actions */}
      <Box sx={{
        display: 'flex',
        gap: 0.75,
        px: 1.25,
        py: 0.75,
      }}
      >
        {isDirty
          ? (
              <>
                <Tooltip title="Save your changes" placement="top" arrow>
                  <Button
                    onClick={onSave}
                    size="small"
                    startIcon={<SaveIcon sx={{ fontSize: '14px !important' }} />}
                    fullWidth
                    sx={{
                      'textTransform': 'none',
                      'borderRadius': '8px',
                      'fontSize': '0.75rem',
                      'fontWeight': 700,
                      'py': 0.6,
                      'background': 'linear-gradient(135deg, #1976d2, #42a5f5)',
                      'color': '#fff',
                      'boxShadow': '0 3px 8px rgba(25,118,210,0.3)',
                      '&:hover': { background: 'linear-gradient(135deg, #1565c0, #1976d2)', boxShadow: '0 3px 12px rgba(25,118,210,0.45)' },
                    }}
                  >
                    Save
                  </Button>
                </Tooltip>
                <Tooltip title="Don't save your changes" placement="top" arrow>
                  <Button
                    onClick={onCancel}
                    size="small"
                    startIcon={<UndoIcon sx={{ fontSize: '14px !important' }} />}
                    fullWidth
                    sx={{
                      'textTransform': 'none',
                      'borderRadius': '8px',
                      'fontSize': '0.75rem',
                      'fontWeight': 700,
                      'py': 0.6,
                      'bgcolor': 'rgba(0,0,0,0.05)',
                      'color': 'rgba(0,0,0,0.55)',
                      'border': '1px solid rgba(0,0,0,0.12)',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.2)' },
                    }}
                  >
                    Cancel
                  </Button>
                </Tooltip>
              </>
            )
          : (
              <Tooltip title="Delete your drawing" placement="top" arrow>
                <Button
                  onClick={onDelete}
                  size="small"
                  startIcon={<DeleteIcon sx={{ fontSize: '14px !important' }} />}
                  fullWidth
                  sx={{
                    'textTransform': 'none',
                    'borderRadius': '8px',
                    'fontSize': '0.75rem',
                    'fontWeight': 700,
                    'py': 0.6,
                    'bgcolor': 'rgba(244,67,54,0.08)',
                    'color': '#d32f2f',
                    'border': '1px solid rgba(244,67,54,0.25)',
                    '&:hover': { bgcolor: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.4)' },
                  }}
                >
                  Delete
                </Button>
              </Tooltip>
            )}
      </Box>

      {/* Arrow pointer */}
      {direction === 'top' && (
        <Box sx={{
          position: 'absolute',
          top: -7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderBottom: '7px solid rgba(235,242,255,0.55)',
          filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.08))',
          pointerEvents: 'none',
          zIndex: 10,
        }}
        />
      )}
      {direction === 'bottom' && (
        <Box sx={{
          position: 'absolute',
          bottom: -7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid rgba(235,242,255,0.55)',
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.08))',
          pointerEvents: 'none',
          zIndex: 10,
        }}
        />
      )}
    </Box>
  )
}

export default PopupContent

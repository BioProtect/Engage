import ClearIcon from '@mui/icons-material/Clear'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import StopIcon from '@mui/icons-material/Stop'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { alpha } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import { memo, useState } from 'react'
import { useAuth } from '../../Contexts/AuthenticationContext'
import { useMapStable } from '../../Contexts/MapContext'
import { iconButtonSx } from '../../theme'

// Dark or white text, whichever reads better on a "#rrggbb" swatch.
function textOn(hex) {
  const channel = i => Number.parseInt(hex.slice(i, i + 2), 16)
  const luma = channel(1) * 0.299 + channel(3) * 0.587 + channel(5) * 0.114
  return luma > 150
    ? '#12222c'
    : '#fff'
}

const focusRing = {
  '&.Mui-focusVisible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 1,
  },
}

const menuItemSx = { display: 'flex', gap: 1, fontSize: '0.875rem' }

function DataRow({
  row,
  featureType,
  deleteRow,
  // This row's slice of the drawing state, worked out once in DataMenu.
  isActive,
  isVisible,
  drawingCount,
  // The info dialog, confirm dialog and drawings dropdown are single instances
  // owned by DataMenu; rows only ask for them.
  onShowInfo,
  onConfirm,
  onToggleDrawings,
  onCloseDrawings,
}) {
  const [settingsMenu, setSettingsMenu] = useState(null)

  const {
    vectorSource,
    drawnFeaturesRef,
    setDrawnFeatures,
    setSelectedFeature,
    setActiveDrawingRow,
    handleCheckboxChange,
    setActiveColor,
    setActiveName,
    setActiveEunisCode,
    setActiveFeatureType,
    showSnackbar,
  } = useMapStable()

  const { isAuthenticated } = useAuth()

  const hasDrawings = drawingCount > 0
  const isHidden = !isVisible && hasDrawings

  const clearRowDrawings = (rowId) => {
    drawnFeaturesRef.current.forEach((feature) => {
      if (feature.get('id') === rowId)
        vectorSource.removeFeature(feature)
    })
    if (!isActive)
      handleCheckboxChange(rowId, false)
    setSelectedFeature(null)
    setDrawnFeatures(prev =>
      prev.filter(feature => feature.get('id') !== rowId),
    )
    showSnackbar(`Drawings for "${row.name}" have been cleared!`)
  }

  const handleSettingsMenuClose = () => setSettingsMenu(null)

  // The item list is bundled with the app (data/drawingItems), so deleting a
  // row only removes it from this session; there is nothing to delete on the
  // server.
  const handleDeleteRow = () => {
    if (!isAuthenticated)
      return
    if (isActive)
      setActiveDrawingRow(null)
    clearRowDrawings(row.id)
    deleteRow(row.id)
    showSnackbar(`${row.name} was successfully deleted!`)
  }

  const handleSetActive = () => {
    if (isActive) {
      setActiveDrawingRow(null)
      setActiveEunisCode(null)
      setActiveFeatureType(null)
    }
    else {
      setActiveDrawingRow(row.id)
      setActiveColor(row.color)
      setActiveName(row.name)
      setActiveEunisCode(row.eunis2022code || null)
      setActiveFeatureType(featureType || null)
      // Here rather than only in Draw's effect, so it lands in the same render
      handleCheckboxChange(row.id, true)
    }
    onCloseDrawings()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxSizing: 'border-box',
        minHeight: 44,
        p: '5px 8px 5px 10px',
        borderBottom: '1px solid',
        borderColor: t => alpha(t.palette.primary.main, 0.14),
        bgcolor: isActive
          ? t => alpha(t.palette.primary.main, 0.1)
          : 'transparent',
      }}
    >
      {/* Swatch: map colour, drawing count, opens the drawings list */}
      <ButtonBase
        onClick={e => onToggleDrawings(row.id, e.currentTarget)}
        aria-label={`View drawings for ${row.name} (${drawingCount})`}
        title={hasDrawings ? 'View drawings' : 'No drawings yet'}
        sx={{
          width: 26,
          height: 26,
          flex: 'none',
          borderRadius: '8px',
          bgcolor: row.color,
          color: textOn(row.color),
          fontFamily: 'inherit',
          fontSize: 11,
          fontWeight: 700,
          boxShadow:
            'inset 0 0 0 1.5px rgba(255,255,255,0.55), 0 0 0 1px rgba(9,27,53,0.18)',
          ...focusRing,
        }}
      >
        {hasDrawings ? drawingCount : ''}
      </ButtonBase>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          ml: '6px',
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.3,
          overflowWrap: 'anywhere',
          color: isHidden ? 'text.secondary' : 'text.primary',
        }}
      >
        {row.name}
      </Box>

      <IconButton
        aria-label={`Show ${row.name} on map`}
        aria-pressed={isVisible}
        title={isVisible ? 'Hide on map' : 'Show on map'}
        disabled={isActive || !hasDrawings}
        onClick={() => handleCheckboxChange(row.id, !isVisible)}
        sx={iconButtonSx}
      >
        {isHidden
          ? (
              <VisibilityOffIcon sx={{ fontSize: 18 }} />
            )
          : (
              <VisibilityIcon sx={{ fontSize: 18 }} />
            )}
      </IconButton>

      <IconButton
        aria-label={`More actions for ${row.name}`}
        aria-controls={settingsMenu
          ? `menu-${row.id}`
          : undefined}
        aria-haspopup="menu"
        onClick={e => setSettingsMenu(e.currentTarget)}
        sx={iconButtonSx}
      >
        <MoreVertIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <Menu
        id={`menu-${row.id}`}
        anchorEl={settingsMenu}
        open={Boolean(settingsMenu)}
        onClose={handleSettingsMenuClose}
        PaperProps={{
          sx: {
            'minWidth': 180,
            'p': 0.5,
            '& .MuiMenuItem-root': { borderRadius: 1.5 },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleSettingsMenuClose()
            onShowInfo(row)
          }}
          sx={{ ...menuItemSx, color: 'primary.main' }}
        >
          <InfoOutlinedIcon fontSize="small" />
          Show info
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleSettingsMenuClose()
            onConfirm({
              title: 'Clear All Drawings',
              description: `Are you sure you want to clear all drawings for "${row.name}"?`,
              onConfirm: () => clearRowDrawings(row.id),
            })
          }}
          disabled={!hasDrawings}
          sx={{ ...menuItemSx, color: 'primary.main' }}
        >
          <ClearIcon fontSize="small" />
          Clear All Drawings
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <Tooltip title={isAuthenticated ? '' : 'Login required to delete'}>
          <span>
            <MenuItem
              onClick={() => {
                handleSettingsMenuClose()
                onConfirm({
                  title: 'Delete Item',
                  description: `Are you sure you want to delete "${row.name}"?`,
                  onConfirm: handleDeleteRow,
                })
              }}
              disabled={!isAuthenticated}
              sx={{ ...menuItemSx, color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" />
              {isAuthenticated ? 'Delete' : 'Login to Delete'}
            </MenuItem>
          </span>
        </Tooltip>
      </Menu>

      <ButtonBase
        onClick={handleSetActive}
        aria-label={
          isActive
            ? `Stop drawing ${row.name}`
            : `Start drawing ${row.name}`
        }
        title={isActive ? 'Stop Drawing' : 'Start Drawing'}
        sx={{
          width: 34,
          height: 34,
          flex: 'none',
          borderRadius: '9px',
          color: '#fff',
          bgcolor: isActive ? 'error.main' : 'primary.main',
          ...focusRing,
        }}
      >
        {isActive
          ? (
              <StopIcon sx={{ fontSize: 20 }} />
            )
          : (
              <EditIcon sx={{ fontSize: 18 }} />
            )}
      </ButtonBase>
    </Box>
  )
}

/**
 * Memoised: clicking a draw button re-renders the two rows whose state
 * changed, not the whole list.
 */
export default memo(DataRow)

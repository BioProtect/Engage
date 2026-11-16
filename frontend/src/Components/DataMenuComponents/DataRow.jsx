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

function VisibilityButton({ name, isVisible, isHidden, disabled, onClick }) {
  const Icon = isHidden ? VisibilityOffIcon : VisibilityIcon
  return (
    <IconButton
      aria-label={`Show ${name} on map`}
      aria-pressed={isVisible}
      title={isVisible ? 'Hide on map' : 'Show on map'}
      disabled={disabled}
      onClick={onClick}
      sx={iconButtonSx}
    >
      <Icon sx={{ fontSize: 18 }} />
    </IconButton>
  )
}

// Start/stop drawing this row.
function DrawButton({ name, isActive, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`${isActive ? 'Stop' : 'Start'} drawing ${name}`}
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
        ? <StopIcon sx={{ fontSize: 20 }} />
        : <EditIcon sx={{ fontSize: 18 }} />}
    </ButtonBase>
  )
}

// The row's "more actions" menu. Each item closes the menu, then acts.
function RowMenu({ id, anchorEl, onClose, canClear, canDelete, onInfo, onClear, onDelete }) {
  const act = fn => () => {
    onClose()
    fn()
  }
  return (
    <Menu
      id={id}
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: {
          'minWidth': 180,
          'p': 0.5,
          '& .MuiMenuItem-root': { borderRadius: 1.5 },
        },
      }}
    >
      <MenuItem onClick={act(onInfo)} sx={{ ...menuItemSx, color: 'primary.main' }}>
        <InfoOutlinedIcon fontSize="small" />
        Show info
      </MenuItem>

      <MenuItem
        onClick={act(onClear)}
        disabled={!canClear}
        sx={{ ...menuItemSx, color: 'primary.main' }}
      >
        <ClearIcon fontSize="small" />
        Clear All Drawings
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      <Tooltip title={canDelete ? '' : 'Login required to delete'}>
        <span>
          <MenuItem
            onClick={act(onDelete)}
            disabled={!canDelete}
            sx={{ ...menuItemSx, color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" />
            {canDelete ? 'Delete' : 'Login to Delete'}
          </MenuItem>
        </span>
      </Tooltip>
    </Menu>
  )
}

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

      <VisibilityButton
        name={row.name}
        isVisible={isVisible}
        isHidden={isHidden}
        disabled={isActive || !hasDrawings}
        onClick={() => handleCheckboxChange(row.id, !isVisible)}
      />

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

      <RowMenu
        id={`menu-${row.id}`}
        anchorEl={settingsMenu}
        onClose={handleSettingsMenuClose}
        canClear={hasDrawings}
        canDelete={isAuthenticated}
        onInfo={() => onShowInfo(row)}
        onClear={() =>
          onConfirm({
            title: 'Clear All Drawings',
            description: `Are you sure you want to clear all drawings for "${row.name}"?`,
            onConfirm: () => clearRowDrawings(row.id),
          })}
        onDelete={() =>
          onConfirm({
            title: 'Delete Item',
            description: `Are you sure you want to delete "${row.name}"?`,
            onConfirm: handleDeleteRow,
          })}
      />

      <DrawButton name={row.name} isActive={isActive} onClick={handleSetActive} />
    </Box>
  )
}

/**
 * Memoised: clicking a draw button re-renders the two rows whose state
 * changed, not the whole list.
 */
export default memo(DataRow)

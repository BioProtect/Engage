import AddIcon from '@mui/icons-material/Add'

import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LabelIcon from '@mui/icons-material/Label'
import LabelOffIcon from '@mui/icons-material/LabelOff'
import SearchIcon from '@mui/icons-material/Search'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import StopIcon from '@mui/icons-material/Stop'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import { alpha } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../Contexts/AuthenticationContext'
import { useMapContext } from '../../Contexts/MapContext'
import fallbackData from '../../data/drawingItems'
import { generateColor } from '../../generateColor'
import BioProtectLogo from '../../images/bioprotect_nobgrnd.png'
import { iconButtonSx, sheetSurface } from '../../theme'
import UserInfo from '../Authentication/UserInfo'
import DrawingDropdown from '../DrawingComponent/DrawingListDialog'
import ActivityPicker from './ActivityPicker'
import CategoryTabs from './CategoryTabs'
import ConfirmDialog from './ConfirmDialog'
import DataRow from './DataRow'
import DescriptionDialog from './DescriptionDialog'
import FinishSessionButton from './FinishButton'
import SearchField from './Search'
import SortSelect from './SortSelect'

const CATEGORIES = ['Features', 'Activities']

// The 26 habitats are fixed (their names key the sensitivity matrix);
// activities are picked from PAD during the session.
const FEATURES = fallbackData.Features.map(
  ({ id, name, description, eunis2022code }) => ({
    id,
    name,
    description,
    eunis2022code,
    color: generateColor(id),
  }),
)

// Sheet height per detent. Phones get a bottom sheet, tablets and up a
// floating panel in the top-left corner.
const SAFE_TOP = 'env(safe-area-inset-top, 0px)'
const SAFE_BOTTOM = 'env(safe-area-inset-bottom, 0px)'
const HEIGHTS = {
  peek: { xs: `calc(70px + ${SAFE_BOTTOM})`, sm: '56px' },
  half: { xs: '50dvh', sm: '400px' },
  full: {
    xs: 'calc(100dvh - 44px)',
    sm: `calc(100dvh - 24px - ${SAFE_TOP})`,
  },
}

// Primary (blue), just left of the green Finish button, same size and shape.
const addButtonSx = {
  'flex': 'none',
  'height': 34,
  'px': '12px',
  'borderRadius': '9px',
  'fontWeight': 700,
  'fontSize': 13,
  'textTransform': 'none',
  '& .MuiButton-startIcon': { mr: '4px' },
}

const hairline = t => alpha(t.palette.primary.main, 0.14)

const focusRing = {
  '&.Mui-focusVisible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: -2,
  },
}

function DataMenu() {
  const scrollContainerRef = useRef(null)
  const [data, setData] = useState({ Features: FEATURES, Activities: [] })
  // Row ids in the order they were last picked for drawing, newest first.
  const [recentIds, setRecentIds] = useState([])
  // { rowId, anchor } while a row's drawings dropdown is open.
  const [drawingsMenu, setDrawingsMenu] = useState(null)
  const [info, setInfo] = useState({ open: false, row: null })
  // "peek" (bar only), "half" or "full".
  // ponytail: tap-only detents; MUI SwipeableDrawer is the upgrade path if
  // people expect to drag the sheet.
  const [detent, setDetent] = useState('half')
  const lastOpenDetent = useRef('half')
  // Detent to go back to when drawing stops; null while not drawing.
  const detentBeforeDrawing = useRef(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Features')
  const [sortOption, setSortOption] = useState('Name')
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmProps, setConfirmProps] = useState({
    title: '',
    description: '',
    onConfirm: () => {},
  })
  const [allSelected, setAllSelected] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const {
    activeDrawingRow,
    drawnFeatures,
    vectorSource,
    setDrawnFeatures,
    setSelectedFeature,
    setActiveDrawingRow,
    setActiveEunisCode,
    setActiveFeatureType,
    setActiveColor,
    setActiveName,
    activeColor,
    activeName,
    visibilityMap,
    handleCheckboxChange,
    showSnackbar,
    showLabels,
    setShowLabels,
  } = useMapContext()

  useEffect(() => {
    if (!activeDrawingRow)
      return
    setRecentIds(prev => [
      activeDrawingRow,
      ...prev.filter(id => id !== activeDrawingRow),
    ])
  }, [activeDrawingRow])

  if (detent !== 'peek')
    lastOpenDetent.current = detent

  // Get out of the way while drawing: drop to the bar when a row is picked,
  // and come back to where the sheet was when drawing stops.
  useEffect(() => {
    if (activeDrawingRow) {
      if (detentBeforeDrawing.current === null) {
        detentBeforeDrawing.current = lastOpenDetent.current
      }
      setDetent('peek')
    }
    else if (detentBeforeDrawing.current !== null) {
      setDetent(detentBeforeDrawing.current)
      detentBeforeDrawing.current = null
    }
  }, [activeDrawingRow])

  // Everything handed to DataRow is stable (useCallback) so the memoised rows
  // only re-render when their own props change.
  const closeDrawings = useCallback(() => setDrawingsMenu(null), [])

  const toggleDrawings = useCallback(
    (rowId, anchor) =>
      setDrawingsMenu(prev =>
        prev?.rowId === rowId
          ? null
          : { rowId, anchor },
      ),
    [],
  )

  const askConfirm = useCallback((props) => {
    setConfirmProps(props)
    setConfirmOpen(true)
  }, [])

  const showInfo = useCallback(row => setInfo({ open: true, row }), [])

  // The dropdown is anchored to a row, so close it when the list scrolls.
  useEffect(() => {
    if (!drawingsMenu)
      return
    const container = scrollContainerRef.current
    if (!container)
      return

    container.addEventListener('scroll', closeDrawings, { passive: true })
    return () => container.removeEventListener('scroll', closeDrawings)
  }, [drawingsMenu, closeDrawings])

  const clearAllDrawings = () => {
    if (drawnFeatures.length === 0)
      return
    drawnFeatures.forEach((feature) => {
      vectorSource.removeFeature(feature)
      handleCheckboxChange(feature.get('id'), false)
    })
    setDrawnFeatures([])
    setActiveDrawingRow(null)
    setSelectedFeature(null)
    showSnackbar('All drawings cleared!')
  }

  const deleteRow = useCallback((rowId) => {
    setData(prev =>
      Object.fromEntries(
        Object.entries(prev).map(([category, rows]) => [
          category,
          rows.filter(row => row.id !== rowId),
        ]),
      ),
    )
    setDrawingsMenu(prev => (prev?.rowId === rowId
      ? null
      : prev))
  }, [])

  const drawingCounts = useMemo(() => {
    const counts = {}
    drawnFeatures.forEach((f) => {
      const id = f.get('id')
      counts[id] = (counts[id] || 0) + 1
    })
    return counts
  }, [drawnFeatures])

  const handleSelectAllToggle = () => {
    const items = Object.values(data)
      .flat()
      .filter(
        item =>
          drawnFeatures.some(f => f.get('id') === item.id)
          && item.id !== activeDrawingRow,
      )
    items.forEach(item => handleCheckboxChange(item.id, !allSelected))
    setAllSelected(prev => !prev)
  }

  // A PAD activity from the picker: add it (once) and start drawing it, the
  // same as tapping its row. Its category stands in for the description.
  const handlePickActivity = ({ id, activity, category }) => {
    const row = {
      id,
      name: activity,
      description: category,
      type: 'Activities',
      color: generateColor(id),
    }
    setData(prev =>
      prev.Activities.some(r => r.id === id)
        ? prev
        : {
            ...prev,
            Activities: [...prev.Activities, row],
          },
    )
    setSelectedCategory('Activities')
    setActiveDrawingRow(id)
    setActiveColor(row.color)
    setActiveName(row.name)
    setActiveEunisCode(null)
    setActiveFeatureType('Activities')
    handleCheckboxChange(id, true)
  }

  const handleFinishSession = () => {
    // The Activities list is per session: the next group starts empty.
    setData(prev => ({ ...prev, Activities: [] }))
    setRecentIds([])
    setActiveDrawingRow(null)
    drawnFeatures.forEach(feature =>
      handleCheckboxChange(feature.get('id'), false),
    )
  }

  const filteredData = useMemo(() => {
    // Rows never drawn with keep their place after the ones that were.
    const recency = (id) => {
      const index = recentIds.indexOf(id)
      return index === -1
        ? recentIds.length
        : index
    }

    return data[selectedCategory]
      .filter(row =>
        row.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        switch (sortOption) {
          case 'Name':
            return a.name.localeCompare(b.name)
          case 'Drawings':
            return (drawingCounts[b.id] || 0) - (drawingCounts[a.id] || 0)
          case 'Recent':
            return recency(a.id) - recency(b.id)
          default:
            return 0
        }
      })
  }, [
    data,
    selectedCategory,
    searchQuery,
    drawingCounts,
    recentIds,
    sortOption,
  ])

  const isPeek = detent === 'peek'
  const showSearch = searchOpen || searchQuery !== ''
  const hasDrawings = drawnFeatures.length > 0

  const togglePeek = () => {
    closeDrawings()
    setDetent(isPeek ? lastOpenDetent.current : 'peek')
  }

  const stopDrawing = () => {
    setActiveDrawingRow(null)
    setActiveEunisCode(null)
    setActiveFeatureType(null)
    closeDrawings()
  }

  const counts = {
    Features: data.Features.length,
    Activities: data.Activities.length,
  }

  const drawingsRow
    = drawingsMenu
      && Object.values(data)
        .flat()
        .find(row => row.id === drawingsMenu.rowId)

  return (
    <Box
      data-detent={detent}
      sx={{
        ...sheetSurface,
        'position': 'absolute',
        'zIndex': 1000,
        'display': 'flex',
        'flexDirection': 'column',
        'overflow': 'hidden',
        'boxSizing': 'border-box',
        'left': { xs: 0, sm: 12 },
        'right': { xs: 0, sm: 'auto' },
        'bottom': { xs: 0, sm: 'auto' },
        'top': { xs: 'auto', sm: `calc(12px + ${SAFE_TOP})` },
        'width': { xs: 'auto', sm: 320 },
        'height': HEIGHTS[detent],
        'pb': { xs: SAFE_BOTTOM, sm: 0 },
        'borderRadius': { xs: '18px 18px 0 0', sm: '14px' },
        'color': 'text.primary',
        // No CssBaseline in this app, so the theme font has to be set here.
        'fontFamily': t => t.typography.fontFamily,
        'fontSize': 13,
        'transition': 'height 0.25s ease',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {/* Grab handle: above the bar on phones, below the footer otherwise */}
      <Box
        onClick={togglePeek}
        aria-hidden
        sx={{
          'flex': 'none',
          'height': 14,
          'display': 'grid',
          'placeItems': 'center',
          'cursor': 'pointer',
          'order': { xs: -1, sm: 4 },
          '&::after': {
            content: '""',
            width: 36,
            height: 4,
            borderRadius: '2px',
            bgcolor: t => alpha(t.palette.primary.main, 0.3),
          },
        }}
      />

      {/* Bar: always visible. Tapping it (not Stop) toggles peek. */}
      <Box
        sx={{
          flex: 'none',
          boxSizing: 'border-box',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pr: '10px',
          borderBottom: '1px solid',
          borderColor: isPeek ? 'transparent' : hairline,
        }}
      >
        <ButtonBase
          onClick={togglePeek}
          aria-expanded={!isPeek}
          aria-label={isPeek ? 'Open menu' : 'Collapse menu'}
          sx={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            pl: '12px',
            gap: '10px',
            justifyContent: 'flex-start',
            textAlign: 'left',
            fontFamily: 'inherit',
            ...focusRing,
          }}
        >
          {activeDrawingRow
            ? (
                <>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      flex: 'none',
                      borderRadius: '8px',
                      bgcolor: activeColor,
                      boxShadow:
                    'inset 0 0 0 1.5px rgba(255,255,255,0.55), 0 0 0 1px rgba(9,27,53,0.18)',
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                      }}
                    >
                      Drawing
                    </Box>
                    <Box
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        lineHeight: 1.25,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {activeName}
                    </Box>
                  </Box>
                </>
              )
            : (
                <>
                  <img
                    width="28"
                    height="28"
                    src={BioProtectLogo}
                    alt=""
                    style={{ objectFit: 'contain', flex: 'none' }}
                  />
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      fontFamily: t => t.typography.headingFont,
                      fontSize: 19,
                      color: 'primary.main',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    BioProtect Engage
                  </Box>
                </>
              )}
          {/* Points the way the sheet will move: it opens upward on phones */}
          <ExpandMoreIcon
            sx={{
              'flex': 'none',
              'color': 'text.secondary',
              'transition': 'transform 0.25s ease',
              'transform': {
                xs: isPeek ? 'rotate(180deg)' : 'none',
                sm: isPeek ? 'none' : 'rotate(180deg)',
              },
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          />
        </ButtonBase>

        {activeDrawingRow && (
          <ButtonBase
            onClick={stopDrawing}
            aria-label={`Stop drawing ${activeName}`}
            sx={{
              'flex': 'none',
              'height': 34,
              'pl': '9px',
              'pr': '12px',
              'gap': '5px',
              'borderRadius': '9px',
              'bgcolor': 'error.main',
              'color': '#fff',
              'fontFamily': 'inherit',
              'fontSize': 13,
              'fontWeight': 700,
              ...focusRing,
              '&.Mui-focusVisible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            <StopIcon sx={{ fontSize: 18 }} />
            Stop
          </ButtonBase>
        )}
      </Box>

      {/* Everything below the bar. Kept mounted at peek (so the rows are not
          rebuilt on every stop) but hidden from sight, focus and readers. */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          visibility: isPeek ? 'hidden' : 'visible',
          transition: isPeek ? 'visibility 0s linear 0.25s' : 'none',
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            flex: 'none',
            height: 44,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            px: '8px',
            borderBottom: '1px solid',
            borderColor: hairline,
          }}
        >
          {showSearch
            ? (
                <SearchField
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onClose={() => setSearchOpen(false)}
                />
              )
            : (
                <>
                  <CategoryTabs
                    categories={CATEGORIES}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                    counts={counts}
                  />
                  <Tooltip title="Search">
                    <IconButton
                      aria-label="Search items"
                      onClick={() => setSearchOpen(true)}
                      sx={iconButtonSx}
                    >
                      <SearchIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
          <SortSelect sortOption={sortOption} onChange={setSortOption} />
          <Tooltip title={detent === 'full'
            ? 'Shorter list'
            : 'Taller list'}
          >
            <IconButton
              aria-label={detent === 'full'
                ? 'Shorter list'
                : 'Taller list'}
              onClick={() => setDetent(detent === 'full'
                ? 'half'
                : 'full')}
              sx={iconButtonSx}
            >
              {detent === 'full'
                ? (
                    <UnfoldLessIcon sx={{ fontSize: 20 }} />
                  )
                : (
                    <UnfoldMoreIcon sx={{ fontSize: 20 }} />
                  )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* List */}
        <Box
          ref={scrollContainerRef}
          sx={{
            'flex': 1,
            'minHeight': 0,
            'overflowY': 'auto',
            'overflowX': 'hidden',
            '&::-webkit-scrollbar': { width: 5 },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 10,
              bgcolor: t => alpha(t.palette.primary.main, 0.3),
            },
          }}
        >
          {filteredData.length > 0
            ? (
                filteredData.map(row => (
                  <DataRow
                    key={row.id}
                    row={row}
                    featureType={selectedCategory}
                    deleteRow={deleteRow}
                    isActive={row.id === activeDrawingRow}
                    isVisible={Boolean(visibilityMap[row.id])}
                    drawingCount={drawingCounts[row.id] || 0}
                    onShowInfo={showInfo}
                    onConfirm={askConfirm}
                    onToggleDrawings={toggleDrawings}
                    onCloseDrawings={closeDrawings}
                  />
                ))
              )
            : selectedCategory === 'Activities'
              && data.Activities.length === 0
              ? (
                  <Box
                    sx={{
                      py: 3,
                      px: 2,
                      textAlign: 'center',
                      color: 'text.secondary',
                      fontWeight: 600,
                      userSelect: 'none',
                    }}
                  >
                    <Box sx={{ mb: 1.5 }}>No activities yet</Box>
                    <Button
                      variant="contained"
                      disableElevation
                      startIcon={<AddIcon />}
                      disabled={!isAuthenticated}
                      onClick={() => setPickerOpen(true)}
                      sx={addButtonSx}
                    >
                      Add activity
                    </Button>
                  </Box>
                )
              : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      py: 3,
                      color: 'primary.main',
                      fontWeight: 600,
                      userSelect: 'none',
                    }}
                  >
                    <SearchOffIcon sx={{ fontSize: 24 }} />
                    No results found
                  </Box>
                )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            p: '6px 8px',
            borderTop: '1px solid',
            borderColor: hairline,
          }}
        >
          <Tooltip
            title={
              allSelected ? 'Deselect all drawings' : 'Select all drawings'
            }
          >
            <IconButton
              aria-label="Select all drawings"
              aria-pressed={allSelected}
              onClick={handleSelectAllToggle}
              sx={{
                ...iconButtonSx,
                color: allSelected ? 'primary.main' : 'text.secondary',
              }}
            >
              {allSelected
                ? (
                    <CheckBoxIcon sx={{ fontSize: 20 }} />
                  )
                : (
                    <CheckBoxOutlineBlankIcon sx={{ fontSize: 20 }} />
                  )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Clear all drawings">
            <span>
              <IconButton
                aria-label="Clear all drawings"
                disabled={!hasDrawings}
                onClick={() =>
                  askConfirm({
                    title: 'Clear All Drawings',
                    description: 'Are you sure you want to clear all drawings?',
                    onConfirm: clearAllDrawings,
                  })}
                sx={{ ...iconButtonSx, color: 'error.main' }}
              >
                <DeleteSweepIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={showLabels ? 'Hide labels' : 'Show labels'}>
            <IconButton
              aria-label="Show labels"
              aria-pressed={showLabels}
              onClick={() => setShowLabels(!showLabels)}
              sx={{
                ...iconButtonSx,
                color: showLabels ? 'primary.main' : 'text.secondary',
              }}
            >
              {showLabels
                ? (
                    <LabelIcon sx={{ fontSize: 20 }} />
                  )
                : (
                    <LabelOffIcon sx={{ fontSize: 20 }} />
                  )}
            </IconButton>
          </Tooltip>

          <Tooltip
            title={isAuthenticated ? 'Add activity' : 'Sign in to add activities'}
          >
            <span style={{ marginLeft: 'auto', display: 'flex' }}>
              <Button
                variant="contained"
                disableElevation
                aria-label="Add activity"
                startIcon={<AddIcon />}
                disabled={!isAuthenticated}
                onClick={() => setPickerOpen(true)}
                sx={addButtonSx}
              >
                Add
              </Button>
            </span>
          </Tooltip>

          <FinishSessionButton onFinish={handleFinishSession} />
        </Box>

        {/* Signed-in user + Sign out, its own row under the buttons */}
        <UserInfo />
      </Box>

      <ActivityPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handlePickActivity}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmProps.title}
        description={confirmProps.description}
        onConfirm={confirmProps.onConfirm}
      />

      <DescriptionDialog
        open={info.open}
        onClose={() => setInfo(prev => ({ ...prev, open: false }))}
        title={info.row?.name}
        description={info.row?.description}
      />

      {drawingsRow && (
        <DrawingDropdown
          anchorEl={drawingsMenu.anchor}
          open
          onClose={closeDrawings}
          row={drawingsRow}
          drawings={drawnFeatures.filter(f => f.get('id') === drawingsRow.id)}
        />
      )}
    </Box>
  )
}

export default DataMenu

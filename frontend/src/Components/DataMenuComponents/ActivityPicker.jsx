import CloseIcon from '@mui/icons-material/Close'

import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListSubheader from '@mui/material/ListSubheader'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useMemo, useState } from 'react'
import { get_pad_activities } from '../../Api/DataMenuApi'

// Opened by the Add button on the Activities tab: pick a PAD activity (the names
// cumulative impact knows) instead of typing one. Fetched live, no bundled
// fallback, so the names can't drift from PAD.
function ActivityPicker({ open, onClose, onPick }) {
  const fullScreen = useMediaQuery(t => t.breakpoints.down('sm'))
  const [activities, setActivities] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setActivities(await get_pad_activities())
    }
    catch {
      setError('Couldn\'t load activities')
    }
    finally {
      setLoading(false)
    }
  }

  const close = () => {
    onClose()
    setQuery('')
  }

  // [[category, activities[]], ...] in PAD order, filtered by the search.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const byCategory = new Map();
    (activities || [])
      .filter(
        a =>
          !q
          || a.activity.toLowerCase().includes(q)
          || (a.category || '').toLowerCase().includes(q),
      )
      .forEach((a) => {
        const key = a.category || 'Other'
        if (!byCategory.has(key))
          byCategory.set(key, [])
        byCategory.get(key).push(a)
      })
    return [...byCategory]
  }, [activities, query])

  return (
    <>
      <Dialog
        open={open}
        onClose={close}
        fullScreen={fullScreen}
        // Fetch on first open, and again on reopen after a failure.
        TransitionProps={{
          onEnter: () => !activities && !loading && load(),
        }}
        PaperProps={{
          sx: {
            width: { sm: 440 },
            height: { sm: '70vh' },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: '12px 12px 8px 16px' }}>
          <Box sx={{ flex: 1, fontWeight: 700, fontSize: 16 }}>
            Choose an activity
          </Box>
          <IconButton aria-label="Close" onClick={close} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Search activities"
            value={query}
            onChange={e => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {loading
            ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={22} />
                </Box>
              )
            : error
              ? (
                  <Alert
                    severity="error"
                    sx={{ m: 2 }}
                    action={(
                      <Button color="inherit" size="small" onClick={load}>
                        Retry
                      </Button>
                    )}
                  >
                    {error}
                  </Alert>
                )
              : groups.length === 0
                ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      No activities match
                    </Box>
                  )
                : (
                    <List dense disablePadding>
                      {groups.map(([category, items]) => (
                        <li key={category}>
                          <ul style={{ padding: 0 }}>
                            <ListSubheader
                              sx={{ bgcolor: 'rgba(235,242,255,0.95)', lineHeight: '32px' }}
                            >
                              {category}
                            </ListSubheader>
                            {items.map(a => (
                              <ListItemButton
                                key={a.id}
                                onClick={() => {
                                  onPick(a)
                                  close()
                                }}
                                sx={{ fontSize: 13 }}
                              >
                                {a.activity}
                              </ListItemButton>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </List>
                  )}
        </Box>
      </Dialog>
    </>
  )
}

export default ActivityPicker

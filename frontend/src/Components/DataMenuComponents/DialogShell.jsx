import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// rgb triples for the icon badge tint
const TONES = { error: '244,67,54', info: '25,118,210' }

// Shared frame for the data menu's small dialogs: close button, tinted icon
// badge, title, body, then a centred actions row.
function DialogShell({ open, onClose, icon, tone, title, children, actions }) {
  const rgb = TONES[tone]
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: { xs: '80vw', sm: 360 },
          maxWidth: 400,
        },
      }}
    >
      <IconButton
        onClick={onClose}
        size="small"
        aria-label="Close"
        sx={{
          'position': 'absolute',
          'top': 12,
          'right': 12,
          'zIndex': 1,
          'color': 'rgba(0,0,0,0.4)',
          'bgcolor': 'rgba(0,0,0,0.05)',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          pt: 3.5,
          px: 3.5,
          pb: 2,
        }}
      >
        <Box
          sx={{
            'mb': 2,
            'width': 64,
            'height': 64,
            'display': 'grid',
            'placeItems': 'center',
            'borderRadius': '50%',
            'background': `linear-gradient(135deg, rgba(${rgb},0.15), rgba(${rgb},0.25))`,
            'border': `1.5px solid rgba(${rgb},0.25)`,
            'boxShadow': `0 4px 12px rgba(${rgb},0.15)`,
            'color': `rgb(${rgb})`,
            '& svg': { fontSize: 32 },
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a2e', mb: 1.5 }}>
          {title}
        </Typography>
        {children}
      </DialogContent>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.5)', mx: 2 }} />

      <DialogActions sx={{
        justifyContent: 'center',
        px: 3,
        py: 2,
        gap: 1.5,
      }}
      >
        {actions}
      </DialogActions>
    </Dialog>
  )
}

export default DialogShell

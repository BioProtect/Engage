import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogShell from './DialogShell'

function ConfirmDialog({ open, onClose, title, description, onConfirm }) {
  return (
    <DialogShell
      open={open}
      onClose={onClose}
      icon={<WarningAmberIcon />}
      tone="error"
      title={title}
      actions={(
        <>
          <Button
            onClick={onClose}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{
              'textTransform': 'none',
              'borderRadius': 2,
              'borderColor': 'rgba(0,0,0,0.2)',
              'color': 'text.secondary',
              'bgcolor': 'rgba(255,255,255,0.4)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(0,0,0,0.3)',
              },
              'px': 2.5,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            variant="contained"
            startIcon={<CheckIcon />}
            sx={{
              'textTransform': 'none',
              'borderRadius': 2,
              'background': 'linear-gradient(135deg, #f44336, #ff7043)',
              'boxShadow': '0 4px 12px rgba(244,67,54,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f, #f44336)',
                boxShadow: '0 4px 16px rgba(244,67,54,0.5)',
              },
              'px': 2.5,
            }}
          >
            Confirm
          </Button>
        </>
      )}
    >
      <Typography
        variant="body2"
        sx={{ color: 'rgba(0,0,0,0.6)', mb: 2, lineHeight: 1.6 }}
      >
        {description}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 0.6,
          borderRadius: 2,
          bgcolor: 'rgba(244,67,54,0.08)',
          border: '1px solid rgba(244,67,54,0.2)',
        }}
      >
        <WarningAmberIcon sx={{ fontSize: 14, color: 'error.main' }} />
        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
          This action cannot be undone
        </Typography>
      </Box>
    </DialogShell>
  )
}

export default ConfirmDialog

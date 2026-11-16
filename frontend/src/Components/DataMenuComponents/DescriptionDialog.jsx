import InfoIcon from '@mui/icons-material/Info'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogShell from './DialogShell'

function InfoDialog({ open, onClose, title, description }) {
  return (
    <DialogShell
      open={open}
      onClose={onClose}
      icon={<InfoIcon />}
      tone="info"
      title={title}
      actions={(
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            'textTransform': 'none',
            'borderRadius': 2,
            'fontWeight': 700,
            'px': 4,
            'background': 'linear-gradient(135deg, #1976d2, #42a5f5)',
            'boxShadow': '0 4px 12px rgba(25,118,210,0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0, #1976d2)',
              boxShadow: '0 4px 16px rgba(25,118,210,0.5)',
            },
          }}
        >
          Close
        </Button>
      )}
    >
      <Box
        sx={{
          alignSelf: 'stretch',
          px: 1.5,
          py: 1.25,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.55)',
          minHeight: 48,
        }}
      >
        <Typography
          sx={{
            whiteSpace: 'pre-line',
            fontSize: '0.9rem',
            color: description ? '#1a1a2e' : 'rgba(0,0,0,0.35)',
            lineHeight: 1.6,
          }}
        >
          {description || 'No description provided.'}
        </Typography>
      </Box>
    </DialogShell>
  )
}

export default InfoDialog

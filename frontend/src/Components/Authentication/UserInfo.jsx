import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import { useAuth } from '../../Contexts/AuthenticationContext'
import { useMapStable } from '../../Contexts/MapContext'

// Signed-in user and Sign out, as its own row under the data menu footer;
// renders nothing when signed out.
function UserInfo() {
  const { user, logout } = useAuth()
  const { showSnackbar } = useMapStable()

  if (!user)
    return null

  const handleLogout = () => {
    logout()
    showSnackbar(`${user.username} has logged out!`)
  }

  return (
    <Box
      sx={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        p: '4px 8px 6px 12px',
        borderTop: '1px solid',
        borderColor: t => alpha(t.palette.primary.main, 0.14),
      }}
    >
      <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          fontWeight: 700,
          color: 'primary.main',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {user.username}
      </Box>
      <Button
        size="small"
        startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
        onClick={handleLogout}
        sx={{
          'flex': 'none',
          'height': 30,
          'px': '10px',
          'borderRadius': '8px',
          'fontSize': 12,
          'fontWeight': 700,
          'textTransform': 'none',
          '& .MuiButton-startIcon': { mr: '4px' },
        }}
      >
        Sign out
      </Button>
    </Box>
  )
}

export default UserInfo

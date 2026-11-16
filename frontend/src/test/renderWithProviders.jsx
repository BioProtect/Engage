import { ThemeProvider } from '@mui/material/styles'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../Contexts/AuthenticationContext'
import { MapProvider } from '../Contexts/MapContext'
import theme from '../theme'

/**
 * Render inside the app's real providers. `signedIn` seeds the stored login
 * that AuthProvider reads on mount.
 */
export function renderWithProviders(ui, { signedIn = true } = {}) {
  if (signedIn) {
    localStorage.setItem('token', JSON.stringify('test-token'))
    localStorage.setItem('user', JSON.stringify({ username: 'tester' }))
    localStorage.setItem('loginTimestamp', JSON.stringify(Date.now()))
  }
  return {
    user: userEvent.setup(),
    ...render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <MapProvider>{ui}</MapProvider>
        </AuthProvider>
      </ThemeProvider>,
    ),
  }
}

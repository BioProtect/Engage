import { ThemeProvider } from '@mui/material/styles'
import DataMenu from './Components/DataMenuComponents/DataMenu'
import Draw from './Components/DrawingComponent/Draw'
import Map from './Components/MapComponent/Map'
import { AuthProvider } from './Contexts/AuthenticationContext'
import { MapProvider } from './Contexts/MapContext'
import theme from './theme'
import './App.css'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <MapProvider>
          <div
            style={{
              width: '100vw',
              height: '100dvh',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Map />
            <DataMenu />
            <Draw />
          </div>
        </MapProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

import Map from "./Components/MapComponent/Map";
import DataMenu from "./Components/DataMenuComponents/DataMenu";
import { MapProvider } from "./Contexts/MapContext";
import { AuthProvider } from "./Contexts/AuthenticationContext";
import { ThemeProvider } from "@mui/material/styles";
import Draw from "./Components/DrawingComponent/Draw";
import theme from "./theme";
import "./App.css";

const App = () => (
  <ThemeProvider theme={theme}>
    <AuthProvider>
      <MapProvider>
        <div
          style={{
            width: "100vw",
            height: "100dvh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Map />
          <DataMenu />
          <Draw />
        </div>
      </MapProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;

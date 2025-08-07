import Map from "./Components/MapComponent/Map";
import DataMenu from "./Components/DataMenuComponents/DataMenu";
import { MapProvider } from "./Contexts/MapContext";
import { AuthProvider } from "./Contexts/AuthenticationContext";
import Draw from "./Components/DrawingComponent/Draw";
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <MapProvider>
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
          <Map />
          <DataMenu />
          <Draw />
        </div>
      </MapProvider>
    </AuthProvider>
  );
};

export default App;

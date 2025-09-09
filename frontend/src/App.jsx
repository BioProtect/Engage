import { useEffect } from "react";
import Map from "./Components/MapComponent/Map";
import DataMenu from "./Components/DataMenuComponents/DataMenu";
import { MapProvider } from "./Contexts/MapContext";
import { AuthProvider } from "./Contexts/AuthenticationContext";
import Draw from "./Components/DrawingComponent/Draw";
import "./App.css";

const App = () => {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <AuthProvider>
      <MapProvider>
        <div
          style={{
            width: "100vw",
            height: "calc(var(--vh, 1vh) * 100)",
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
  );
};

export default App;

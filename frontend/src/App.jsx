// src/App.js
import React from 'react';
import Map from './Components/MapComponent/Map';
import DataMenu from './Components/DataMenuComponents/DataMenu';
import { MapProvider } from './Contexts/MapContext'; // Import context
import './App.css';

const App = () => {
  return (
    <MapProvider>
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <Map />
        <DataMenu />
      </div>
    </MapProvider>
  );
};

export default App;

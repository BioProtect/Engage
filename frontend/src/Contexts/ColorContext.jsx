import React, { createContext, useContext } from "react";

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const generateColor = (id) => {
    const goldenRatio = 0.618033988749895;
    const normalized = (id * goldenRatio) % 1;
    const colorInt = Math.floor(normalized * 0xffffff);
    return `#${colorInt.toString(16).padStart(6, "0").toUpperCase()}`;
  };

  return (
    <ColorContext.Provider value={{ generateColor }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColorContext = () => useContext(ColorContext);

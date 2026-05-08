import React, { createContext, useContext } from "react";

const ColorContext = createContext();

const generateColor = (id) => {
  const goldenRatio = 0.618033988749895;
  const normalized = (id * goldenRatio) % 1;
  const colorInt = Math.floor(normalized * 0xffffff);
  return `#${colorInt.toString(16).padStart(6, "0").toUpperCase()}`;
};

const contextValue = { generateColor };

export const ColorProvider = ({ children }) => (
  <ColorContext.Provider value={contextValue}>{children}</ColorContext.Provider>
);

export const useColorContext = () => useContext(ColorContext);

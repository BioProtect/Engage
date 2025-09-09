import React from "react";

const ZoomControls = ({ map, size = 48 }) => {
  if (!map) return null;

  const zoomIn = () => map.getView().setZoom(map.getView().getZoom() + 1);
  const zoomOut = () => map.getView().setZoom(map.getView().getZoom() - 1);

  const buttonStyle = {
    width: size,
    height: size,
    fontSize: size * 0.5,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    color: "#333",
    border: "1px solid #ccc",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  };

  const hoverStyle = {
    backgroundColor: "#f0f0f0",
    boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        width: "100%",
      }}
    >
      <button
        onClick={zoomIn}
        style={buttonStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
      >
        +
      </button>
      <button
        onClick={zoomOut}
        style={buttonStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
      >
        -
      </button>
    </div>
  );
};

export default ZoomControls;

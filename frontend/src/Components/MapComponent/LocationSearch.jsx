import React, { useState, useEffect, useRef } from "react";

const LocationSearch = ({ mapInstance }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const containerRef = useRef(null);

  const isCoordinate = (input) => {
    const parts = input.split(",").map((s) => s.trim());
    if (parts.length !== 2) return false;
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    return !isNaN(lat) && !isNaN(lon);
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    if (isCoordinate(query)) {
      setSuggestions([
        {
          display_name: query,
          lat: query.split(",")[0],
          lon: query.split(",")[1],
          isCoord: true,
        },
      ]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSuggestions(data || []);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length >= 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (lat, lon, display_name) => {
    if (!mapInstance) return;

    const center = [parseFloat(lon), parseFloat(lat)];
    const zoomLevel = isCoordinate(display_name) ? 14 : 12;

    mapInstance.getView().animate({
      center,
      zoom: zoomLevel,
      duration: 1000,
    });

    setSearchQuery(display_name);
    setSuggestions([]);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFlagUrl = (code) =>
    code ? `https://flagcdn.com/20x15/${code.toLowerCase()}.png` : null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "150px",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type="text"
          placeholder="Search Location..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            suggestions[0] &&
            handleSelectSuggestion(
              suggestions[0].lat,
              suggestions[0].lon,
              suggestions[0].display_name
            )
          }
          style={{
            width: "73%",
            padding: "5px 28px 5px 10px",
            borderRadius: "20px",
            border: "2px solid #1976d2",
            outline: "none",
            fontSize: "0.85rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            transition: "all 0.2s ease",
            backgroundColor: "#fff",
          }}
          onFocus={(e) => e.target.select()}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            style={{
              position: "absolute",
              right: "4px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#1976d2",
              color: "#fff",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Suggestions */}
      {searchQuery && suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            bottom: "44px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            listStyle: "none",
            margin: 0,
            padding: "6px 0",
            borderRadius: "12px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            maxHeight: "250px",
            overflowY: "auto",
            zIndex: 10000,
            width: "180px",
          }}
        >
          {suggestions.map((s, i) => {
            const flagUrl = s.isCoord
              ? null
              : getFlagUrl(s.address?.country_code);
            return (
              <li
                key={i}
                onClick={() =>
                  handleSelectSuggestion(s.lat, s.lon, s.display_name)
                }
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  lineHeight: 1.4,
                  borderBottom:
                    i < suggestions.length - 1 ? "1px solid #eee" : "none",
                  transition: "background 0.2s",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e3f2fd")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
                title={s.display_name}
              >
                {flagUrl && (
                  <img
                    src={flagUrl}
                    alt={s.address.country_code}
                    style={{
                      width: "20px",
                      height: "15px",
                      marginRight: "6px",
                      borderRadius: "2px",
                      marginTop: "2px",
                    }}
                  />
                )}
                <span>{s.display_name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;

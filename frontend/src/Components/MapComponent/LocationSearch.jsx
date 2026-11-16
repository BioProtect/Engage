import { useEffect, useRef, useState } from 'react'

function LocationSearch({ mapInstance }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [focused, setFocused] = useState(false)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  const isCoordinate = (input) => {
    const parts = input.split(',').map(s => s.trim())
    if (parts.length !== 2)
      return false
    const lat = Number.parseFloat(parts[0])
    const lon = Number.parseFloat(parts[1])
    return !Number.isNaN(lat) && !Number.isNaN(lon)
  }

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([])
      return
    }
    if (isCoordinate(query)) {
      setSuggestions([
        {
          display_name: query,
          lat: query.split(',')[0],
          lon: query.split(',')[1],
          isCoord: true,
        },
      ])
      return
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
      )
      const data = await response.json()
      setSuggestions(data || [])
    }
    catch {
      setSuggestions([])
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    clearTimeout(debounceRef.current)
    if (value.length >= 2) {
      debounceRef.current = setTimeout(fetchSuggestions, 300, value)
    }
    else {
      setSuggestions([])
    }
  }

  const handleSelectSuggestion = (lat, lon, display_name) => {
    if (!mapInstance)
      return
    mapInstance.getView().animate({
      center: [
        Number.parseFloat(lon),
        Number.parseFloat(lat),
      ],
      zoom: isCoordinate(display_name)
        ? 14
        : 12,
      duration: 1000,
    })
    setSearchQuery(display_name)
    setSuggestions([])
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSuggestions([])
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setSuggestions([])
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getFlagUrl = code =>
    code
      ? `https://flagcdn.com/20x15/${code.toLowerCase()}.png`
      : null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '160px',
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
      }}
    >
      {/* Input */}
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Search icon */}
        <svg
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 15,
            height: 15,
            fill: 'none',
            stroke: focused ? '#1976d2' : 'rgba(0,0,0,0.35)',
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            pointerEvents: 'none',
            transition: 'stroke 0.2s',
          }}
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="22" y2="22" />
        </svg>

        <input
          type="text"
          placeholder="Search location"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={(e) => {
            setFocused(true)
            e.target.select()
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={e =>
            e.key === 'Enter'
            && suggestions[0]
            && handleSelectSuggestion(
              suggestions[0].lat,
              suggestions[0].lon,
              suggestions[0].display_name,
            )}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '7px 30px 7px 32px',
            borderRadius: '12px',
            border: focused
              ? '1px solid rgba(25,118,210,0.5)'
              : '1px solid rgba(255,255,255,0.45)',
            outline: 'none',
            fontSize: '0.8rem',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)',
            color: '#1a1a2e',
            transition: 'border 0.2s, box-shadow 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(25,118,210,0.1)' : 'none',
          }}
        />

        {searchQuery && (
          <button
            onClick={clearSearch}
            style={{
              position: 'absolute',
              right: 7,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.18)',
              color: '#fff',
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {searchQuery && suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(235,242,255,0.55)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.6)',
            listStyle: 'none',
            margin: 0,
            padding: '5px',
            borderRadius: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            maxHeight: '240px',
            overflowY: 'auto',
            zIndex: 10000,
            width: '220px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(25,118,210,0.3) transparent',
          }}
        >
          {suggestions.map((s) => {
            const flagUrl = s.isCoord
              ? null
              : getFlagUrl(s.address?.country_code)
            return (
              <li
                key={s.place_id ?? `${s.lat},${s.lon}`}
                onClick={() =>
                  handleSelectSuggestion(s.lat, s.lon, s.display_name)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 7,
                  padding: '7px 10px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  lineHeight: 1.4,
                  borderRadius: '9px',
                  color: '#1a1a2e',
                  transition: 'background 0.15s',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.background = 'rgba(25,118,210,0.12)')}
                onMouseLeave={e =>
                  (e.currentTarget.style.background = 'transparent')}
                title={s.display_name}
              >
                {flagUrl
                  ? (
                      <img
                        src={flagUrl}
                        alt={s.address?.country_code}
                        style={{
                          width: 18,
                          height: 13,
                          borderRadius: 2,
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      />
                    )
                  : (
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          width: 13,
                          height: 13,
                          fill: 'none',
                          stroke: '#1976d2',
                          strokeWidth: 2,
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    )}
                <span>{s.display_name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default LocationSearch

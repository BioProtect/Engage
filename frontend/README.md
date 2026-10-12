# BioProtect Engage (frontend)

Map app for stakeholders to draw marine features and activities. It talks to
the main BioProtect server (Tornado) and loads vector tiles from Martin.

## Setup

Copy `.sample_env` to `.env` and fill it in. The dev server only reads `.env`
at startup, so restart it after a change.

| Variable | Value |
| --- | --- |
| `REACT_APP_MAPBOX_TOKEN` | Mapbox public (`pk.`) token for the basemap |
| `REACT_APP_API_BASE_URL` | BioProtect server, including `/server` (dev: `http://localhost:8080/server`) |
| `REACT_APP_MARTIN_BASE_URL` | Martin tile server (dev: `http://localhost:3000`) |

## Commands

- `npm start`: dev server
- `npm run build`: production build into `build/`

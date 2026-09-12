# bikeplanner

Plan a scenic city cycling route between landmarks and get distance, estimated
time and elevation (climb/descent) figures. It ships as a small full-stack demo:

- **`server/`** — an Express + TypeScript API that stores a self-contained
  network of San Francisco landmarks and computes shortest routes (Dijkstra),
  distances (haversine), and effort-based time estimates. No external map,
  tile, or geocoding service is required.
- **`web/`** — a Vite + React + TypeScript single-page app with an interactive
  SVG map, waypoint/effort controls, ride statistics, and turn-by-turn output.

## Requirements

- Node.js >= 20 (developed on Node 22)
- npm 10+

## Getting started

```bash
npm ci        # install all workspace dependencies
npm run dev   # start the API (:3001) and the web app (:5173) together
```

Then open http://localhost:5173. The Vite dev server proxies `/api/*` to the
API on port `3001`.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Run API and web dev servers concurrently |
| `npm run dev:server` | Run only the API (port `3001`) |
| `npm run dev:web` | Run only the web app (port `5173`) |
| `npm run build` | Type-check + build both workspaces |
| `npm run typecheck` | Type-check both workspaces |
| `npm test` | Run the API route-planning unit tests |

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness plus network size |
| `GET` | `/api/locations` | All landmarks and edges |
| `POST` | `/api/plan` | Plan a route from `{ waypointIds: string[], effort? }` |

Example:

```bash
curl -s localhost:3001/api/plan \
  -H 'content-type: application/json' \
  -d '{"waypointIds":["ferry-building","twin-peaks","golden-gate-bridge"],"effort":"moderate"}'
```

## Cloud Agent environment

`.cursor/environment.json` installs dependencies with `npm ci` and launches the
`api` and `web` dev servers as persistent terminals, so a fresh agent boots
straight into a running app.

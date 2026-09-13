# bikeplanner

The new cycle-tour site: one hub, country galleries, and a paper planner.

[tigges/routeplanner](https://github.com/tigges/routeplanner) is the **input** — graphs, trip catalogues, days computed from effort. The published pages at [tigges.github.io/routeplanner](https://tigges.github.io/routeplanner/) are that old product (dark sidebar, GIS canvas). We do not link there, and we do not reuse that layout. Every former routeplanner page is rebuilt here.

- [DESIGN.md](DESIGN.md) — **full design proposal**. One site, three rooms, one paper design.
- [MAP.md](MAP.md) — schematic paper atlas; network → ride → day.
- [GRAPHS.md](GRAPHS.md) — difficulty, effort and elevation on the tour sheet, beside a map figure.
- [preview/hub.html](preview/hub.html) — four country cards. Britain, Japan, Switzerland and Spain each open a gallery in this site.
- [preview/britain.html](preview/britain.html) — 18 trips (Land's End to Edinburgh, London and Ealing rides).
- [preview/switzerland.html](preview/switzerland.html) — 29 trips.
- [preview/japan.html](preview/japan.html) — 29 trips (Shimanami, Biwaichi, Fuji-ichi, Tokapuchi 400, Amaichi, Okhotsk, Awaji, Yamanami, Pacific Cycling Road, cape to cape).
- [preview/spain.html](preview/spain.html) — 8 trips (Camino Francés, Norte, Fisterra, the crossing).

Every trip opens a paper tour sheet from a **ride snapshot** (computed days, elevation, forks, GPX). That is not the full graph — forks rewrite with `alts[node:option]`, last non-default wins. Refresh snapshots with `node tools/extract_ride_snapshots.mjs`. Trip hero photos: `python3 tools/fetch_trip_photos.py`.

Serve with `python3 -m http.server 8766 --directory preview`.

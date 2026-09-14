# bikeplanner

The cycle-tour site: one hub, country galleries, and a paper planner.

Live: [tigges.github.io/bikeplanner](https://tigges.github.io/bikeplanner/).

[tigges/routeplanner](https://github.com/tigges/routeplanner) was the **input**. Country graphs now live in [`graphs/`](graphs/) in this repo. The published pages at [tigges.github.io/routeplanner](https://tigges.github.io/routeplanner/) are the old product (dark sidebar, GIS canvas). We do not link there, and we do not reuse that layout. Every former routeplanner page is rebuilt here.

- [DESIGN.md](DESIGN.md) — **full design proposal**. One site, three rooms, one paper design.
- [MAP.md](MAP.md) — schematic paper atlas; network → ride → day.
- [GRAPHS.md](GRAPHS.md) — difficulty, effort and elevation on the tour sheet, beside a map figure.
- [index.html](index.html) — four country cards. Britain, Japan, Switzerland and Spain each open a gallery on this site.
- [britain.html](britain.html) — 23 trips (Land's End to Edinburgh, London and Ealing rides).
- [switzerland.html](switzerland.html) — 30 trips.
- [japan.html](japan.html) — 29 trips (Shimanami, Biwaichi, Fuji-ichi, Tokapuchi 400, Amaichi, Okhotsk, Awaji, Yamanami, Pacific Cycling Road, cape to cape).
- [spain.html](spain.html) — 8 trips (Camino Francés, Norte, Fisterra, the crossing).

Every trip opens a paper tour sheet from a **ride snapshot** (computed days, elevation, forks, GPX). That is not the full graph — forks rewrite with `alts[node:option]`, last non-default wins. Refresh snapshots from `graphs/` with `node tools/extract_ride_snapshots.mjs` (does not hit github.io). Re-import graphs from a local routeplanner checkout with `python3 tools/import_graphs.py`. Trip hero photos: `python3 tools/fetch_trip_photos.py`.

Old `/preview/…` URLs redirect to the same page at the site root.

Serve with `python3 -m http.server 8766`.

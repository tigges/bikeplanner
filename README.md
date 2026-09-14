# bikeplanner

The cycle-tour site: one hub, country galleries, and a paper planner.

Live: [tigges.github.io/bikeplanner](https://tigges.github.io/bikeplanner/).

This repo is independent. Country graphs live in [`graphs/`](graphs/). Tour sheets are ride snapshots under `data/rides/`. [tigges/routeplanner](https://github.com/tigges/routeplanner) is archived provenance (`graphs/manifest.json`), not a live dependency. Do not link the hub, galleries, or tour sheets there.

- [DESIGN.md](DESIGN.md) — **full design proposal**. One site, three rooms, one paper design.
- [MAP.md](MAP.md) — schematic paper atlas; network → ride → day.
- [GRAPHS.md](GRAPHS.md) — difficulty, effort and elevation on the tour sheet, beside a map figure.
- [index.html](index.html) — four country cards. Britain, Japan, Switzerland and Spain each open a gallery on this site.
- [britain.html](britain.html) — 23 trips (Land's End to Edinburgh, London and Ealing rides).
- [switzerland.html](switzerland.html) — 30 trips.
- [japan.html](japan.html) — 29 trips (Shimanami, Biwaichi, Fuji-ichi, Tokapuchi 400, Amaichi, Okhotsk, Awaji, Yamanami, Pacific Cycling Road, cape to cape).
- [spain.html](spain.html) — 8 trips (Camino Francés, Norte, Fisterra, the crossing).

Every trip opens a paper tour sheet from a **ride snapshot** (computed days, elevation, forks, GPX). Forks rewrite with `alts[node:option]`, last non-default wins. Refresh snapshots from `graphs/` with `node tools/extract_ride_snapshots.mjs`. Trip hero photos: `python3 tools/fetch_trip_photos.py`. Optional: copy a frozen graph checkout with `python3 tools/import_graphs.py`.

Old `/preview/…` URLs redirect to the same page at the site root.

Serve with `python3 -m http.server 8766`. Independence check: `bash tools/check_independence.sh`.

# Paste this as the first message of a new chat

Work on **tigges/bikeplanner** from **`main` only**. Do not continue older Cursor agent threads. Those threads already shipped through merged PRs; their branches and summaries are stale.

Live: https://tigges.github.io/bikeplanner/

---

## What this product is

Paper atlas: **hub → country gallery → tour sheet → day**. One atmosphere. Serve from the repo root:

```
python3 -m http.server 8766
```

Pages: `index.html`, `japan.html`, `switzerland.html`, `britain.html`, `spain.html`. Shared UI is `paper.js` + `paper.css` (cache-bust `?v=47` on the country pages).

This repo is independent. Country graphs live in `graphs/`. Ride snapshots live under `data/rides/{country}/{id}.json`. Rebuild snapshots with `node tools/extract_ride_snapshots.mjs` (assembles local HTML from `graphs/planner-template.html`; does not fetch github.io). `graphs/planner-template.html` is **build input only** — do not restyle it. Do not link hub, gallery, or tour sheet into `tigges/routeplanner` or `tigges.github.io/routeplanner`. That repo is archived provenance (`graphs/manifest.json`).

Days are **computed, not stored**. Snapshots do not store OSM way refs or turn-by-turn. Do not invent “turn left at the church” or road surface.

Independence check: `bash tools/check_independence.sh`.

---

## Paper tokens

Chrome: paper `#f6f1ea`, ink `#1c1916`, mute `#6f675e`, cream `#fffdf8`, hairline `#ddd4c8`, coral `#f0713f`, gold `#c9a227`.

Friendliness strip (not the map line): signed `#97C459` / mixed `#EF9F27` / busy `#E24B4A`.

On the tiled ride/day map the strokes are brighter so they read on Esri/CyclOSM: ride `#ff3b1a`, selected day `#ffbf00`. Cue discs still use gold `#c9a227`. Do not restyle those without a reason.

---

## Live UI contract (do not undo)

**Tour sheet (whole ride)**

- Ghost catalogue network is **off**. Remaining ride only.
- Start / end / forks / effort clip the remaining ride and refit the map.
- Header uses the selected town names.
- Unique town names (dedupe by `stopNameKey`).
- Pan is **on by default**. Zoom floor `viewBox` min width `3`.
- Export: GPX, **KML** (My Maps import; no Google account write), Print, Copy link.

**Hakodate / Cape to cape** (`japan.html#trip=ns`, snapshot `data/rides/japan/ns.json`)

- Hakodate is only a hop **end** (Tsugaru ferry is not a riding segment).
- `activeSegs()` starts at the next `frm` after `to === startId`.
- First riding day after Hakodate is **Aomori**. Ferry is not a numbered day.
- Optional dashed gap Hakodate → Aomori when start is Hakodate.
- Unused Hokkaido is gone from that clipped ride.

**Day view**

- **Day card ≠ cue strip.** Do not merge them again.
- Card = numbers and character: km, effort, beds, profile, one character line (`signed/quiet/busy` + longest shop gap + fork), colour strip, ≤2 photos, Sleep, GPX/KML/Print. No On-the-way chips. No hop line leaking the whole-graph hop (`Aomori → Fukaura` was that bug).
- Cue strip = **that day’s towns + sleep**, with a signed-route kicker. **Not peaks**.
- Cue chips open the place card.
- Cue towns are gold discs + labels on the map; they are tappable (`tapMap` on pointerup when `!panMoved`).

**Place card**

- Two links only: **OpenStreetMap pin** and **Google Search**. No toggle. No Google pin. No OSM search.

**Day map layers**

- Shop, beds, food, camp, bath, rail, water, toilet. Hidden when the ride has none.
- S-pedelec (`45 km/h`) follows `mopedAlt` when the snapshot has one.

**Mobile**

- Day filmstrip collapses to Tour + `Day N of 62 ▴`.
- Day card: Details / Hide; scroll fade.
- Cue strip sits above the day picker and hugs the chips.

**Hub**

- Title: Your Bike Route Planners by CT.
- About footer. Credit line does **not** link to routeplanner.
- Top / crossing pills: coral frame when unselected, not a fill.

---

## Discussed, not in scope unless asked

- Ferry hop as its own tile in the day strip
- OSM surface
- Turn-by-turn
- A Settings page
- Full-graph any start/end and packed `#r=` share links
- Vendoring the OSM rebuild pipeline from the archived routeplanner checkout

---

## How to work

- Small, one-topic changes. Commit, push, and report as soon as it works.
- Default proof: stills or the live site. Do not record a walkthrough unless asked, or the change is motion a screenshot cannot show.
- If a recording is needed, start it only after push.
- Bump `paper.css?v=` and `paper.js?v=` together when those files change.
- Snapshots: `node tools/extract_ride_snapshots.mjs`. Photos: `python3 tools/fetch_trip_photos.py`.
- `DESIGN.md` / `MAP.md` lag the live sheet in places. Trust `paper.js` + this note over those docs unless you are asked to update them.

## Canonical check ride

Japan → Cape to cape (`#trip=ns`). Start Hakodate, end Miyazaki (or keep Sata). First riding day should be Aomori, not a ferry. Day card slim; cue = towns; place card = OSM pin + Google Search.

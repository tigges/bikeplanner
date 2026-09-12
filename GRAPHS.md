# Difficulty, effort and elevation — on trips and on the ride

Plan only. The live planner already draws these. The visual pass restyles them
and puts a lighter version on trip cards. A mock is in `preview/map.html` and
`preview/switzerland.html`.

---

## What the screenshot already is

The Spain sidebar is three instruments, not one graph:

| Instrument | What it measures | When it exists |
|---|---|---|
| **Difficulty pill** | Climb per km of the *whole trip* | Always (from `geo` or the live chain) |
| **Effort** | `km + climb/10` (e-bike: climb counts a third) | On every segment; days are split to a daily target |
| **Elevation** | Height along the road (`SD[id].prof`) | On every segment; a day inherits its slice |

They answer different questions. Keep all three. Do not merge them into a
single “hardness chart”.

- **Difficulty** is *grade*: Cape to cape is “easy” (7.4 m/km) even though it
  is 3,500 km. Furka is “very hard” in 38 km. Never tag it; it is computed
  (`<8` easy, `<14` moderate, `<20` hard, else very hard).
- **Effort** is *how much a day costs*. The slider is the daily budget.
  Days are computed, not stored. The per-day bar is that day’s effort
  relative to the hardest day, plus the number (`94 eff`).
- **Elevation** is *the shape of the road*. The whole-ride profile is
  coloured by the current day split. Each day also has a 26 px spark.

There is **no** “effort over distance” line chart today. Do not invent one.
The elevation line already shows where the work is; the effort number is
the budget.

---

## Same numbers, three densities

Put them on the three selection levels, denser as you commit. Never draw
the profile on the map — the map stays the line.

```
NETWORK / trip card     grade + shape
   click a trip
RIDE                    whole profile, coloured by computed days
   click a day
DAY                     that day’s spark, shops, gold on the map
```

### 1. Trip card (network / gallery)

The card is a place. The graph is a *caption*, not a dashboard.

Keep, in this order:

1. Photo, badge, name, `why`
2. **Difficulty pill** (the live `.dl` — easy / moderate / hard / very hard)
3. A **whole-trip spark** — one coral line, no day bands
4. `km · climb · ~N days` at the country’s default effort

Do **not** put on the card:

- The friendliness strip (29 of them become noise)
- Per-day sparks or effort bars (days are not committed)
- The effort slider
- Shops / beds / gaps

Days on the card are approximate (`geo.eff / default effort`, already
`tripStats` when the chain is on another page). Label them as `~5 days`
when `approx` is true. Exact days appear the moment the ride loads.

Hovering a card can grow the spark a little. Click still loads the ride.

### 2. Ride (sidebar — this is the screenshot, on paper)

This is where the Spain panel lives. Restyle, do not rearrange:

- Stats: days, km, m climbed, % signed
- **Whole-ride elevation** (56 px): coral line, paper day-bands instead of
  navy `#0f2130` / `#132836`. Day numbers in the band. **Click a band =
  zoom that day** (today only the day row zooms; the profile should too).
- Caption: peak ▲, “coloured by day”, trough ▼
- **Friendliness strip** under the profile (signed / mixed / busy) and the
  existing “colour the map line” toggle. Default the map line to coral.
- Folded Plan / Route (effort slider stays here)
- **Days**: number, names, `km · N eff`, relative effort bar, day spark,
  shops · beds · baths · stations · longest gap

When a day is selected, that profile band goes **gold**, matching the map
halo. The rest of the ride stays coral. One selection, three surfaces:
map, profile, list.

### 3. Day

No new graph. The selected day’s spark is already in the list; optionally
make that spark 40 px while selected. Photo chips belong on the map, not
inside the spark.

---

## Paper, not night workshop

`DESIGN.md` first said discovery is paper and the planner stays dark.
The map pass already moved the atlas to paper. The graphs must follow:

- Profile fill: coral at ~18% on paper, not on `#0a141b`
- Day bands: `#efe8dd` / `#e7dfd2`, selected `#f3d7a4`
- Effort bar track: `#ddd4c8`, fill coral
- Difficulty pills stay traffic-light (green / amber / coral / red) — they
  are the only extra hues besides coral and gold
- Friendliness colours stay the live ones (`#97C459` / `#EF9F27` /
  `#E24B4A`) — they already mean signed / mixed / busy

The numbers, the splitter, and the hash do not change.

---

## Data: what we have, what to add later

On the **planner page**, a trip card spark can be built live:
`tripChain(t)` → concatenate `SD[id].prof` the same way `daySupply` does.
No new file. Japan / Switzerland pickers can grow a spark tomorrow.

A **static gallery** (hub, or a card on another country’s page) only has
`geo: {km, asc, eff, line}`. No heights. To show a spark there, later
extend `tools/trips_geo.py` with a downsampled `geo.prof: [[km, elev], …]`
(~80–120 points). Until then: gallery mocks can use a stylised spark;
the live picker uses the real `SD.prof`.

Do not inline thousands of profile points into the 11 MB HTML twice.
The segments already have them.

---

## New content on `tigges/routeplanner` (since the last pass)

Fetched 2026-09-12 19:02 UTC, `65545da`. Spain still has **no** trips file.

**Japan — Biwaichi is now Top 2.** Still 19 trips, but the famous-route
list shifted. New loop: Makino → Ōtsu (east shore: Nagahama, Hikone) →
Makino (west shore). 186 km, 275 m, **easy**, `legs` for the circuit,
`why`: “the classic weekend loop from Kyoto”. Towns Makino, Nagahama,
Hikone are on the graph. Hub copy that only names Shimanami / Noto / Kibi
should mention Biwa.

Japan `why` + `top`: 9 of 19 (was described as eight). Default picker chip
is `top`. Title “Japan by bike”.

**Switzerland** still 29 trips, 15 ranked. Difficulty pills and easy/hard
chips are already in the live picker (`248e639`). Heart Route, lake
circuits, difficulty from climb/km — already shipping. No `geo.prof` yet.

**Planner chrome** since the first design note: map clicks, clickable
popup, byline, lakes/rivers, country fill, trip heading, “all trips” back.

None of that changes the graph model. Biwaichi is a new *card* (flat
spark, easy pill, ~2 days). The instruments stay the same.

---

## What not to do

- Do not put elevation on the map as a second line or a 3D ribbon.
- Do not colour trip-card sparks by day (no days yet).
- Do not store days so the gallery can show a “coloured by day” profile.
- Do not retag difficulty by hand because Cape to cape reads “easy”.
  Show km and ~days next to the pill so grade is not mistaken for length.
- Do not build a separate effort-over-distance chart.
- Do not dump the friendliness strip onto 19–29 cards.

---

## When implementation starts

The live `drawProfile`, `spark`, `diffPill`, `drawStrip` stay. Restyle
colours. Make profile bands clickable. Add a spark under each picker card
from `tripChain` + `SD.prof`. Gallery JSON `geo.prof` is a later
`trips_geo.py` step, not a blocker for the planner page.

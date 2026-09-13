# Map look and the ride / section / map model

Plan only. The live planner already has this loop (feature reference). The visual pass makes
it obvious **in this repo**. `map.html` still opens the Swiss gallery. Click stays on our page.

---

## Three nested things, one map

Do not invent a second map. One schematic atlas. Three **selection levels**:

```
NETWORK     all trips on the country
   click a trip
RIDE        one journey; days are computed
   click a day
DAY         that stretch marked on the same atlas; photos on the sheet
```

Hover never commits. Click goes one level in. **All trips** or Escape goes
one level out. Clicking a selected day again (list, disc, or profile band)
returns to the whole ride. The URL keeps the place: `#trip=r1`, then
`#trip=r1&day=3`. The figure auto-fits the ride, then the selected day
or strip segment, with padding — not a free GIS canvas.

Words (so “section” is not used two ways):

| Word | What it is in the data | On the map |
|---|---|---|
| **Trip** | A catalogue card (`kind`: crossing / route / pass / section) | A line + badge on the network |
| **Ride** | The loaded start→end + fork picks; days computed from effort | The coral line you are on |
| **Day** | One computed overnight stretch | Numbered disc; gold on that stretch |
| **Section** (catalogue) | A *kind* of trip: a loop, lake circuit, pass day — not a national route | Drawn quieter than numbered routes |

A catalogue **section** (Three passes loop, Léman circuit) is still a trip.
Once you click it, it becomes the **ride**, and its days are the **days**.

---

## How the map looks

Stay **schematic on the country gallery**. A whole country has to read as a diagram: land, lakes, ghost alternatives, one bright line. Opening a ride or a day switches the same figure to Web Mercator and lays Esri grey (then CyclOSM from about zoom 10) **under** the coral/gold line. Coast and lakes stay as the offline fallback. No tile switcher, no satellite, no second atmosphere. Print still uses the dedicated sheet, not the tiled canvas.

Visual pass — **paper throughout**, same tokens as the hub and gallery.
The planner is not a second, darker product.

- Land / coast: `#e7dfd2` fill, hairline `#cbbfaf`
- Water: lakes restyled to `#c5d5de`
- Ghost network: `#c4b8a8`, dashed
- **Crossings** (E–W, N–S): dashed, a bit thicker
- **National routes** (1–9, 99): solid, numbered pill
- **Pass days / sections**: thinner, muted, until hover
- **The ride**: coral `#f0713f`
- **The selected day**: gold `#c9a227` on that stretch
- Day ends: coral discs with white numbers; gold when selected
- Labels: town names on the ride sheet (Andermatt, Brig, Sion, Genève…)

The map lives in a rounded paper card, same width rhythm as the hub.
It is a reference figure, not a second full-screen product. Opening a ride
fits that journey in the figure; a selected day or strip segment fits that
stretch with padding. Whole trip returns to the ride fit. Modest auto-fit
only — not a free GIS canvas.

Photos do **not** become the map:

- Network / gallery: photos on the cards
- Ride: no photos on the map
- Day: 1–3 photos on the **sheet**, under “On this day”, next to that day’s spark

Friendliness colour stays on the **strip** on the sheet, and optionally
on the ride line as a toggle — same as today.

---

## Interaction, beat by beat

### 1. Network (country opens here if it has ≥ 2 trips)

Left: trip cards (photo, badge, `why`, km). Filters already exist (days,
easy/hard, top, tags).

Map: every visible trip as a line. Numbered routes sit above sections.
Crossings dashed. Hover a card **or** a line: that line goes coral, the rest
dim, a popup with name / km / “click to ride it”. Click loads the ride.

Layer chips on the map (not in a hamburger): **crossings · routes · sections**.
They are the `kind` field. Turning “sections” off is how 29 Swiss trips stop
looking like spaghetti. Default: crossings + routes on, sections/passes muted
or off until you pick the “top” or “pass” chip.

This is the live picker, with photos on cards and quieter line hierarchy,
on the same paper as the magazine gallery.

### 2. Ride (you have committed to a trip)

The page stays a magazine sheet: back link, kicker (“Your tour, planned”),
serif title, stats, elevation, friendliness, **days as a numbered list**.

Map: ghost the rest of the network. The ride is the coral line. Numbered
discs 1…n. Click a day in the list **or** on the map: gold on that stretch.
The atlas does not reframe.

Clicking a ghost line pops “Rhine · click to switch ride” — you can jump
without going back, but it is a new ride (days recompute).

Forks stay in a folded “Route” panel. They change the ride line; they are
not a fourth map mode.

### 3. Day (one overnight)

Same sheet, same atlas. Gold on the day’s polyline. The selected row in the
list turns gold. Under “On this day”: that day’s spark and 1–3 photos
(peak, castle, viewpoint, cape… — never memorial/artwork). The live popup
(name, local name, pin in Google Maps) can still attach a picture.

Click the same day again, or Escape: back to the whole ride. The atlas
never leaves the country view.

Country pages do this loop (`#network`, `#trip=r1`, `#trip=r1&day=3`). `map.html` redirects to the Swiss gallery.

---

## What does not get a new mode

- Vehicle, signed-route switch, train hops, start/end: they rewrite the
  **ride** line. The map stays at ride or day, whichever you were on.
- Facilities (shop/bed/bath/water/rail): still layer buttons. They are dots,
  not photos. They appear from the ride onward, same as now.
- Spain with no trips: skip network, open as a ride (the full crossing). Days
  are still the stretches you mark on the atlas.

---

## Phone

Map figure on top (~42vh). Network: swipe the card list, the map highlights.
Ride: the day list is the scroller; tap a day for gold on the atlas and
photos on the sheet.

---

## Keep from the live page

The live interaction is already this model. Do not replace it with a
story-slideshow or a tiled map. Keep the same magazine page as the hub:
diagrams on the sheet, map as a figure. Name the three levels clearly.
The graph, the day splitter, and the hash stay.

Difficulty, effort and elevation sit on the tour sheet:
[GRAPHS.md](GRAPHS.md).

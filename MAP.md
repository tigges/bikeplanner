# Map look and the ride / section / map model

Plan only. The live planner already has this loop; the visual pass makes
it obvious. A clickable mock is at `preview/map.html`.

---

## Three nested things, one map

Do not invent a second map. One schematic atlas. Three **selection levels**:

```
NETWORK     all trips on the country
   click a trip
RIDE        one journey; days are computed
   click a day
SECTION     one day’s stretch, zoomed; photos appear
```

Hover never commits. Click goes one level in. **All trips**, empty-map click,
or Escape goes one level out. The URL keeps the place: `#trip=r1`, then
`#trip=r1&day=3`.

Words (so “section” is not used two ways):

| Word | What it is in the data | On the map |
|---|---|---|
| **Trip** | A catalogue card (`kind`: crossing / route / pass / section) | A line + badge on the network |
| **Ride** | The loaded start→end + fork picks; days computed from effort | The coral line you are on |
| **Day** | One computed overnight stretch | Numbered dot; click = the section |
| **Section** (catalogue) | A *kind* of trip: a loop, lake circuit, pass day — not a national route | Drawn quieter than numbered routes |

A catalogue **section** (Three passes loop, Léman circuit) is still a trip.
Once you click it, it becomes the **ride**, and its days are the **days**.

---

## How the map looks

Stay **schematic**. Not Mapbox, not satellite, not a busy OSM tile. A whole
country has to read as a diagram. The live page already has the right bones:
country fill, lakes, rivers, ghost alternatives, one bright line.

Visual pass — a **paper atlas**, not the current night workshop:

- Land: warm paper `#e7dfd2`, edge `#b7aa98`
- Water: `#c5d5de` (the lakes already in `P.water`)
- Ghost network: hairline `#c9c0b6`, dashed
- **Crossings** (E–W, N–S): dashed, a bit thicker, long-haul
- **National routes** (1–9, 99): solid, numbered pill at the start
- **Pass days / sections**: thinner, muted, until hover
- **The ride**: coral `#f0713f`, the only saturated line
- **The selected day**: gold halo on that stretch, other days of the ride stay coral but quieter
- Day ends: small numbered discs, ink on paper
- Labels: towns only when zoomed (already the live rule: names under ~300 km, sights under ~60 km)

Photos do **not** become the map. They clip onto it:

- Network: no photos on the map (photos live on the cards)
- Ride: still no photos on the map — the line has to stay readable
- Day: **photo chips** at 3–5 sights/towns on the zoomed stretch (the existing `sight_list`, filtered)

Friendliness colour (signed / mixed / busy) stays on the **strip** in the
sidebar, and optionally on the ride line as a toggle — same as today. Default
the ride to coral so the atlas stays calm; the strip already tells the road
story.

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

This is the live picker, with photos on cards and quieter line hierarchy.

### 2. Ride (you have committed to a trip)

Sidebar swaps: back link, trip title, stats, effort slider (unchanged),
**days as the section list**.

Map: ghost the rest of the network (so you still see where you are in the
country). The ride is the coral line. Day dots 1…n. Click a day in the list
**or** on the map: that day becomes the section, map zooms to it.

Clicking a ghost line pops “Rhine · click to switch ride” — you can jump
without going back, but it is a new ride (days recompute).

Forks stay in a folded “Route” panel. They change the ride line; they are
not a fourth map mode.

### 3. Day / section (one overnight)

The map zooms to that stretch (~1.5× padding, same as today’s `zoomDay`).
Gold on the day’s polyline. Photo chips at the best sights (peak, castle,
viewpoint, cape… — never memorial/artwork). Tap a chip: the existing popup
(name, local name, pin in Google Maps) **plus** the picture.

Click the same day again, **Whole trip**, empty-map click, or Escape: zoom
back to the ride. The day stays selected in the list until you click it again
or leave.

The clickable mock at `preview/map.html` does this loop (`#network`,
`#ride=r1`, `#ride=r1&day=3`) including the day zoom.

---

## What does not get a new mode

- Vehicle, signed-route switch, train hops, start/end: they rewrite the
  **ride** line. The map stays at ride or day, whichever you were on.
- Facilities (shop/bed/bath/water/rail): still layer buttons. They are dots,
  not photos. They appear from ride zoom onward, same as now.
- Spain with no trips: skip network, open as a ride (the full crossing). Days
  are still the sections.

---

## Phone

Map on top (~44vh, already the live split). Network: swipe the card list,
the map highlights. Ride: the day list is the scroller; tap a day to zoom.
Photo chips only on day zoom, max three, so the line stays tappable.

---

## Keep from the live page

The live interaction is already this model. Do not replace it with a
story-slideshow or a tiled map. Change how it **looks** (paper, photo cards,
line hierarchy, chips on day zoom) and how clearly the three levels are
named. The graph, the day splitter, and the hash stay.

Difficulty pills, effort bars and elevation profiles: [GRAPHS.md](GRAPHS.md).

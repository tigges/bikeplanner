# Design proposal — visual front for the cycle-tour planners

Plan only. Do not rebuild the live planners in this pass.

Live site: [tigges.github.io/routeplanner](https://tigges.github.io/routeplanner/).  
Source of truth: [tigges/routeplanner](https://github.com/tigges/routeplanner).  
This repo (`bikeplanner`) is mocks and this proposal.

Mocks: [preview/hub.html](preview/hub.html), [preview/switzerland.html](preview/switzerland.html), [preview/map.html](preview/map.html). Detail notes: [MAP.md](MAP.md), [GRAPHS.md](GRAPHS.md).

---

## 1. Verdict

**One site, three rooms, two atmospheres.**

```
HUB (paper)          Where to ride — three country photographs
   click a country
GALLERY (paper)      Pick a trip — photograph + why + km
   click a trip
PLANNER (dark)       The tool you already have
   click a day
DAY                  Zoom that overnight; photos in popup and day rail
```

Do **not** split Japan / Switzerland / Spain into separate sites. The data is already split (one 2–11 MB HTML page per graph). The product should not be.

Do **not** turn the planner into a paper atlas or a tiled map. Discovery is light and photographic. The planner stays the night workshop.

---

## 2. What the live site is

Three self-contained cycle-tour planners behind a dark text list.

| Page | What it is | Size | Opens on |
|---|---|---|---|
| Hub `/` | Title, blurb, three links | 1 KB | Country list |
| [Japan](https://tigges.github.io/routeplanner/japan/) | Cape Sōya → Cape Sata | 11 MB | Trip picker (19 trips) |
| [Switzerland](https://tigges.github.io/routeplanner/switzerland/) | National routes, passes, loops; second graph at `/switzerland-north-south/` | 3.2 + 0.8 MB | Trip picker (29 trips, default `top`) |
| [Spain](https://tigges.github.io/routeplanner/spain/) | Cap de Creus → Cabo Fisterra | 2.3 MB | Planner (no trips yet) |

The planner is the product: pick start and end, choose at each fork, set daily effort, get **days computed not stored**. Elevation on every segment; shops, beds, baths, taps, stations within 2 km. Bicycle / e-bike / 45 km/h pedelec. Train hops. GPX / CSV / hash `#r=` / `#trip=`. Schematic SVG map, not OSM tiles.

The problem is the **door**. Nothing on the hub says Shimanami, Furka, Camino, Biwaichi. Nothing shows a place.

---

## 3. What the repository already has (the hub hides this)

As of 2026-09-12 (`tigges/routeplanner` `65545da`):

1. **Trip catalogues**
   - Japan: 19 trips. Cape-to-cape plus Shimanami, **Biwaichi (Top 2)**, Noto, Toyama Bay, Pacific Cycling Road, Kibi, Nichinan, named sections. Nine have `top` + `why`.
   - Switzerland: 29 trips. E–W and N–S crossings, national routes 1–9 and 99, pass days, loops. Fifteen ranked Top 5/10/15.
   - Spain: **no trips file**. One crossing with forks. Next data job, not a new website.

2. **Guide copy** — `name`, `sub`, `note`, `why`, `tags`. Difficulty is computed (climb/km), never tagged. `geo` line so another page can draw the trip.

3. **Sights on every segment** — `sight_list`. Japan ~6,148 points. The page already drops memorial / artwork / monument. Remaining kinds are the visual ones: peak, viewpoint, cape, castle, waterfall, beach, attraction.

4. **Water and land** — lakes, named rivers, country fill (Spain, Switzerland). Japan stays a coastline. Friendliness strip: signed / mixed / busy.

5. **Multi-page country, already solved** — Switzerland is two graphs; the picker jumps with `#trip=`. Architecture is one hub, several heavy pages.

6. **Not to merge** — `JAPMAP` / `JAPANRIDE` are separate experiments.

The tool does not need new features. It needs a front that shows what is already there.

---

## 4. Two atmospheres, one accent

**Discovery (hub + gallery)** — paper `#f6f1ea`, ink `#1c1916`, mute `#6f675e`. Serif titles, one photograph per country and per trip, short sentences. Coral `#f0713f` is the route colour everywhere.

**Planner** — night `#0a141b`. Schematic map, coral ride, ghost network `#2a4150`, blue day dots. Elevation profile, effort bars, friendliness strip stay exactly as they are (the Spain sidebar). Photos attach *beside* the map (title, popup, day rail). They do not replace the line and they do not go on the gallery cards as charts.

Tone, already in the data: everyday English, numbers not adjectives, local name next to English.

Type: one serif for place names, system UI sans for controls. No icon font. Motion: a slow image fade; the planner already pans.

---

## 5. The three rooms

Internal URLs stay:

```
/                         visual hub
/japan/                   gallery, then planner
/switzerland/             gallery (all 29, including N–S)
/switzerland-north-south/  planner graph only (off the hub)
/spain/                   planner today; gallery once trips exist
```

Deep links stay: `#trip=shimanami`, `#r=…`, `#trip=r1&day=3`.

### Room 1 — Hub: “Where to ride”

Three country cards, not a list.

- **Japan** — Shimanami bridge or cape light. Overline: 19 trips · Biwaichi, Shimanami, cape to cape.
- **Switzerland** — pass road or lake. Overline: 29 trips · national routes 1–9.
- **Spain** — Fisterra. Overline: Cap de Creus to Fisterra.

One line in the lede: days are computed, not stored. Footer stays the GitHub credit.

### Room 2 — Gallery: “Pick a trip”

This **replaces** the current picker list as the first impression of a country.

Same trips, same filters (days, easy / moderate / hard, top, tags). Each card:

- Photograph of the thing the `why` names
- Badge, name, small difficulty pill (already on the live picker)
- The `why`
- `km · climb · ~days` at the country’s default effort

No elevation spark. No friendliness strip. No effort bar. The card is a place.

The schematic map still sits beside or behind the cards so you can see how trips share a network. Hover a card or a line: that line goes coral. Click loads the ride.

Layer chips on the map: **crossings · routes · sections**. They are the `kind` field. Default: crossings + routes on; sections/passes muted so 29 Swiss trips do not become spaghetti.

Spain, until it has trips: skip this room, open the planner, with a short photo strip of trunk towns (Creus, Girona, Burgos, León, Santiago, Fisterra).

### Room 3 — Planner: the tool, with a picture rail

Do not redesign forks, effort slider, day splitter, vehicles, signed-route switch, GPX, hash.

Add only:

- A **trip hero** in the title strip, collapsed on scroll
- **Town and sight photos** in the existing popup (next to “Pin in Google Maps”)
- A **day rail**: 1–3 images for the day’s best sight/town, from `sight_list` after the same kind filter the map already uses

The sidebar you already have, left as-is:

- Stats (days, km, climb, % signed)
- Whole-ride elevation, coloured by computed day
- Friendliness strip + “colour the map line”
- Folded Plan / Route
- Days: `km · N eff`, relative bar, 26 px spark, shops · beds · baths · stations · longest gap

Small improvement: click a profile day-band to zoom that day (the row already does this).

---

## 6. Map: one schematic, three selection levels

Do not invent a second map. One dark atlas.

```
NETWORK     all trips on the country
   click a trip
RIDE        one journey; days computed from effort
   click a day
DAY         one overnight, zoomed
```

Hover never commits. Click goes one level in. **All trips**, empty-map click, or Escape goes one level out.

**Words** (so “section” is not used two ways):

| Word | In the data | On the map |
|---|---|---|
| **Trip** | Catalogue card (`kind`: crossing / route / pass / section) | A line + badge on the network |
| **Ride** | Loaded start→end + fork picks | The coral line |
| **Day** | One computed overnight | Numbered dot; click zooms |
| **Section** (catalogue) | A *kind* of trip — loop, lake circuit, pass day | Drawn quieter than numbered routes |

A catalogue section (Three passes loop) is still a trip. Once you click it, it is the **ride**; its days are the **days**.

**Look** — night workshop, not paper, not tiles:

- Land `#13242f`, water from `P.water`, ghost `#2a4150` dashed
- Crossings dashed; national routes solid with a numbered pill; sections thinner until hover
- The ride: coral `#f0713f`
- Day ends: existing blue discs
- Towns named under ~300 km, sights under ~60 km (live rule)

Photos are not on the map at network or ride. At day zoom they live in the popup and the day rail so the diagram stays tappable. Facilities stay as dots, from ride zoom onward.

Ghost line click: “Rhine · click to switch ride” — new ride, days recompute. Forks stay in folded Route; they rewrite the coral line, they are not a fourth mode.

Vehicle, signed-route, train hops, start/end: they rewrite the ride. The map stays at ride or day.

**Phone:** map on top (~44vh, already the live split). Gallery: swipe cards, map highlights. Ride: the day list is the scroller.

---

## 7. Difficulty, effort, elevation

They are three instruments, not one chart. They live in the dark planner.

| Instrument | What it is |
|---|---|
| **Difficulty** | Climb per km. `<8` easy, `<14` moderate, `<20` hard, else very hard. Computed, never tagged. |
| **Effort** | `km + climb/10` (e-bike: climb counts a third). Slider = daily budget. Days computed, not stored. |
| **Elevation** | `SD[id].prof` on every segment. Whole-ride profile coloured by the split; each day inherits a spark. |

There is no effort-over-distance line. Do not invent one. Do not put elevation on the map. Do not put sparks on gallery cards. Do not restyle the sidebar onto paper.

Cape to cape is **easy** (7.4 m/km) and 3,500 km. Furka is **very hard** in 38 km. Show km and ~days next to the pill so grade is not mistaken for length.

On the planner page, `tripStats`, `drawProfile`, `spark`, `diffPill`, `drawStrip` already exist. Gallery does not need `geo.prof`.

---

## 8. Images of places

The graph already knows *what* to photograph. It does not store pictures. Do not inline JPEGs into the 11 MB HTML.

| Layer | Source | How many | Rule |
|---|---|---|---|
| Country hero | editorial | 1 per country | Famous, uncluttered, rights-clean |
| Trip hero | `trips[].id` | 1 per trip | The thing the `why` names |
| Towns | `P.nodes` (terminus, gateway first) | ~15–40 per country | Wikidata `P18` |
| Sights | `sight_list` | 1–3 per day, 1 per popup | Skip memorial / artwork / monument |

Japan’s 6,148 sight rows are a ranking problem, not a gallery dump.

**How:** Wikimedia Commons / Wikidata `P18`. Thumbs 320 / 1280. Hand-pick the ~50 heroes. No Mapillary as the face of the product. No Unsplash cycling stock. No generated landscapes. Credit on the image (CC BY / CC BY-SA / PD).

**Where:** `images/{slug}.json` of URLs, fetched by the published page (~100–300 KB). If the fetch fails, the planner still works. `tools/fetch_images.py` can be a later pipeline step.

```
images/{slug}.json
  countries: { hero, credit }
  trips: { shimanami: { src, credit, alt } }
  places: { onomichi: { src, credit, wikidata } }
  sights: { "Kibitsu shrine": { src, credit } }
```

---

## 9. What not to change

- Day splitter, fork comparison, train hops, vehicles, signed-route switch, GPX / CSV, hash
- Schematic map (clearer than tiles for a whole country)
- Self-contained HTML publish path (`template.html` → `docs/<slug>/`)
- “Days are computed, not stored”
- The dark planner chrome and the Spain-style graph stack

---

## 10. Build order

**Phase A — Hub.** Replace `docs/index.html` with the three country photo cards. No planner changes. Highest feeling-of-new, least risk.

**Phase B — Gallery photos.** `images/*.json` and a real photograph on each trip card. Switzerland and Japan become magazines. Spain unchanged. Keep filters, map hover, `#trip=`.

**Phase C — Planner pictures.** Hero in the title, photo in the popup, 1–3 images on the day rail. Clickable profile bands. Planner grid unchanged.

**Phase D — Spain trips.** Same format as `switzerland-trips.json`: the crossing, a Pyrenees week, a Camino-only week, Fisterra extra. Then Spain gets a gallery too.

---

## 11. Success

Someone who has never seen the tool opens the hub, knows the country from the picture, picks Biwaichi or the Rhône from a card that looks like a place, and only then hits the effort slider. The numbers stay honest. The pictures make the numbers mean a road.

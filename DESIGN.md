# Design proposal — visual front for the cycle-tour planners

Plan only. Do not rebuild the live planners in this pass.

Live site: [tigges.github.io/routeplanner](https://tigges.github.io/routeplanner/).  
Source of truth: [tigges/routeplanner](https://github.com/tigges/routeplanner).  
This repo (`bikeplanner`) is mocks and this proposal.

Mocks: [preview/hub.html](preview/hub.html), [preview/switzerland.html](preview/switzerland.html), [preview/map.html](preview/map.html). Detail notes: [MAP.md](MAP.md), [GRAPHS.md](GRAPHS.md).

---

## 1. Verdict

**One site, three rooms, one paper design.**

```
HUB (paper)          Where to ride — three country photographs
   click a country
GALLERY (paper)      Pick a trip — photograph + why + km
   click a trip
PLANNER (paper)      Tour sheet: elevation, days, map as a figure
   click a day
DAY                  Gold on that stretch; photos on the sheet
```

Do **not** split Japan / Switzerland / Spain into separate sites. The data is already split (one 2–11 MB HTML page per graph). The product should not be.

Do **not** switch atmospheres. Hub, gallery, and planner share the same paper, ink, mute, and coral. Discovery is photographic; the planner is still a schematic atlas, not tiles — but it sits on the same cream page.

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

The problem is the **door**. Nothing on the hub says Shimanami, Furka, Camino, Biwaichi. Nothing shows a place. The planner chrome is a second, darker product.

---

## 3. What the repository already has (the hub hides this)

As of 2026-09-12 (`tigges/routeplanner` `3b29fae`, live hub still a dark 1 KB list):

1. **Trip catalogues**
   - Japan: 19 trips. Cape-to-cape plus Shimanami (Top 1), **Biwaichi (Top 2)**, Noto, **Ring-Ring Road (Top 4)** — Tsukuba → Tsuchiura, 110 km, 91 m climb, nearest to Tokyo. Ten have `top` + `why`.
   - Switzerland: 29 trips. E–W and N–S crossings, national routes 1–9 and 99, pass days, loops. Fifteen ranked Top 5/10/15.
   - Spain: **no trips file**. One crossing with forks. Next data job, not a new website.

2. **Guide copy** — `name`, `sub`, `note`, `why`, `tags`. Difficulty is computed (climb/km), never tagged. `geo` line so another page can draw the trip.

3. **Sights on every segment** — `sight_list`. Japan ~6,148 points. The page already drops memorial / artwork / monument. Remaining kinds are the visual ones: peak, viewpoint, cape, castle, waterfall, beach, attraction.

4. **Water and land**
   - Spain / Switzerland: country fill + lakes + rivers.
   - Japan: **coastline only** (`land_fill: false`) plus `japan_water.geojson` (lakes ≥ 20 km², named rivers). Biwa and Kasumigaura are on the graph. Without those lakes, Biwaichi and Ring-Ring are a scribble on empty sea.
   - Friendliness strip: signed / mixed / busy.

5. **Japan map, newly live**
   - Towns Tsuchiura and Itako; forks at Tsukuba (Pacific vs Ring-Ring) and Tsuchiura (Kasumigaura south vs north shore).
   - `entryTowns`: extra start/end towns (Nichinan, Wajima, Suzu, …) without being trunks.
   - Loop trips **keep their own fork picks** (Biwa east/west, Kasumigaura north/south). Needed for loops that close against the default shore.

6. **Multi-page country, already solved** — Switzerland is two graphs; the picker jumps with `#trip=`. Architecture is one hub, several heavy pages.

7. **Not to merge** — `JAPMAP` / `JAPANRIDE` are separate experiments.

The tool does not need new features. It needs a front that shows what is already there, and one visual system from the first photograph through the effort slider.

---

## 4. One atmosphere, one accent

**Everywhere** — paper `#f6f1ea`, ink `#1c1916`, mute `#6f675e`, cream cards `#fffdf8`, hairline `#ddd4c8`. Serif titles, system UI sans for controls. Coral `#f0713f` is the route colour on cards, on the map, and on the elevation line.

**Planner, same page** — schematic atlas on paper, not a night workshop and not OSM tiles.

- Land `#e7dfd2`, water `#c5d5de`, ghost network `#c4b8a8` dashed
- The ride: coral `#f0713f`
- Selected day: gold `#c9a227` on that stretch
- Tour sheet: cream cards, paper profile, the same difficulty pills as the gallery. Map is a figure beside the diagrams.

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

The schematic map still sits beside or behind the cards so you can see how trips share a network. Hover a card or a line: that line goes coral. Click a **card** to open the tour sheet. Click a **line** (or the map popup) to open the published planner — a real URL such as `https://tigges.github.io/routeplanner/switzerland/#trip=r1`, not an in-page hash. North–South uses `/switzerland-north-south/#trip=ns`. Hover must not rebuild the SVG (that kills the click).

Layer chips on the map: **crossings · routes · sections**. They are the `kind` field. Default: crossings + routes on; sections/passes muted so 29 Swiss trips do not become spaghetti.

Spain, until it has trips: skip this room, open the planner, with a short photo strip of trunk towns (Creus, Girona, Burgos, León, Santiago, Fisterra).

### Room 3 — Planner: a tour sheet, not a second app

Same page frame as the hub and gallery: max-width, kicker, serif title, cream. Do not switch to a 340 px tool sidebar and a full-bleed GIS canvas.

Left: the Spain instruments, as diagrams on the sheet.

- Stats (days, km, climb)
- Whole-ride elevation, coloured by computed day (click a band to select that day)
- Friendliness strip
- Days as a numbered list (`km · climb`), coral discs — not stacked spark cards
- On a selected day: that day’s spark and 1–3 photos sit **on the sheet**, not as chips on the map

Right: the schematic map as a **figure** in a rounded paper card. Labeled towns, coral ride, gold on the selected day. The atlas does not zoom into a sausage; gold on the stretch is the reference.

Do not redesign forks, effort slider, day splitter, vehicles, signed-route switch, GPX, hash. Those stay in folded Plan / Route, same as today.

---

## 6. Map: one schematic, three selection levels

Do not invent a second map. One paper atlas.

```
NETWORK     all trips on the country
   click a trip
RIDE        one journey; days computed from effort
   click a day
DAY         one overnight, marked on the same atlas
```

Hover never commits. Click goes one level in. **All trips** or Escape goes one level out. Clicking a selected day again returns to the whole ride.

**Words** (so “section” is not used two ways):

| Word | In the data | On the map |
|---|---|---|
| **Trip** | Catalogue card (`kind`: crossing / route / pass / section) | A line + badge on the network |
| **Ride** | Loaded start→end + fork picks | The coral line |
| **Day** | One computed overnight | Numbered disc; gold on that stretch |
| **Section** (catalogue) | A *kind* of trip — loop, lake circuit, pass day | Drawn quieter than numbered routes |

A catalogue section (Three passes loop) is still a trip. Once you click it, it is the **ride**; its days are the **days**.

**Look** — paper atlas, not night, not tiles:

- Land `#e7dfd2`, water from `P.water` restyled to `#c5d5de`, ghost `#c4b8a8` dashed
- Crossings dashed; national routes solid with a numbered pill; sections thinner until hover
- The ride: coral `#f0713f`
- Day ends: coral discs with white numbers; selected day gold on the stretch
- Towns named on the ride sheet (Andermatt, Brig, Sion, Genève…)

Photos are not on the map. They sit on the sheet under “On this day”. Facilities stay as dots from the ride onward.

Ghost line click: “Rhine · click to switch ride” — new ride, days recompute. Forks stay in folded Route; they rewrite the coral line, they are not a fourth mode.

Vehicle, signed-route, train hops, start/end: they rewrite the ride. The map stays at ride or day.

**Phone:** map figure on top (~42vh). Gallery: swipe cards. Ride: the day list is the scroller; gold on the atlas marks the day.

---

## 7. Difficulty, effort, elevation

They are three instruments, not one chart. They live on the **tour sheet**, beside the map figure. They do not go on gallery cards.

| Instrument | What it is |
|---|---|
| **Difficulty** | Climb per km. `<8` easy, `<14` moderate, `<20` hard, else very hard. Computed, never tagged. |
| **Effort** | `km + climb/10` (e-bike: climb counts a third). Slider = daily budget. Days computed, not stored. |
| **Elevation** | `SD[id].prof` on every segment. Whole-ride profile coloured by the split; each day inherits a spark. |

There is no effort-over-distance line. Do not invent one. Do not put elevation on the map. Do not put sparks on gallery cards.

Cape to cape is **easy** (7.4 m/km) and 3,500 km. Furka is **very hard** in 38 km. Show km and ~days next to the pill so grade is not mistaken for length.

On the planner page, `tripStats`, `drawProfile`, `spark`, `diffPill`, `drawStrip` already exist. Restyle their chrome (fills, bands, labels) onto paper. Gallery does not need `geo.prof`.

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
- The Spain-style graph stack (profile, strip, day sparks) — keep the instruments, restyle them onto paper

---

## 10. Next steps

Clean, bright, simple. One paper design. **Switzerland first** — the catalogue is complete.

| # | What | Status |
|---|---|---|
| **CH** | Swiss gallery + paper atlas + tour sheet from the live 29-trip file | **this slice** |
| **1. Hub** | Three country photo cards on `/` | Next |
| **2. Japan gallery** | Same pattern as Switzerland | After CH |
| **3. Japan atlas** | Coastline + lakes (Biwa, Kasumigaura) | After CH |
| **4. Planner sheet** | Restyle `template.html` | After the door |
| **5. Spain trips** | Catalogue the crossing | Data |

Do not start with 4. The live planner still works; the list on `/` does not say Shimanami.

---

## 11. Success

Someone who has never seen the tool opens the hub, knows the country from the picture, picks Biwaichi or Ring-Ring or the Rhône from a card that looks like a place, and only then hits the effort slider — still on the same cream page. The numbers stay honest. The pictures make the numbers mean a road.

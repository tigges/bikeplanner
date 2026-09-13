# Design proposal — one paper product, rebuilt here

This repo (`bikeplanner`) is the new site. Hub, country galleries, and the planner all live here, on one navigation, one layout, one colour system.

[tigges/routeplanner](https://github.com/tigges/routeplanner) and the published pages at [tigges.github.io/routeplanner](https://tigges.github.io/routeplanner/) are the **input**: graphs, trip catalogues, computed days, forks, vehicles, GPX. They are **not** the result. Do not link a card, map line, or button into that dark planner. Do not reuse its 340 px sidebar, night canvas, or second atmosphere.

Previews: [preview/hub.html](preview/hub.html), [preview/switzerland.html](preview/switzerland.html), [preview/map.html](preview/map.html). Detail notes: [MAP.md](MAP.md), [GRAPHS.md](GRAPHS.md).

---

## 1. Verdict

**One site, three rooms, one paper design.**

```
HUB (paper)          Where to ride — four country photographs
   click a country
GALLERY (paper)      Pick a trip — photograph + why + km
   click a trip
PLANNER (paper)      Tour sheet: elevation, days, map as a figure
   click a day
DAY                  Gold on that stretch; photos on the sheet
```

Do **not** split Japan / Switzerland / Spain / Britain into separate sites. The data is already split (one HTML page per graph). The product should not be.

Do **not** switch atmospheres. Hub, gallery, and planner share the same paper, ink, mute, and coral. Discovery is photographic; the planner is still a schematic atlas, not tiles — but it sits on the same cream page.

---

## 2. What the live site is (input, not the UI we ship)

Three self-contained cycle-tour planners behind a dark text list. Screenshot of that planner (navy sidebar, coloured GIS line, effort slider) is the **feature checklist**. The new page is paper, cream, serif titles, map as a figure.

| Page | What it is | Size | Opens on |
|---|---|---|---|
| Hub `/` | Title, blurb, four links | 1 KB | Country list |
| Britain | Land's End → Edinburgh; London / Ealing rides | 0.4 + 0.3 MB | Trip picker (18 trips, two graphs) |
| Japan | Cape Sōya → Cape Sata | 12.2 MB | Trip picker (29 trips, Fuji-ichi Top 5, Tokapuchi 400 Top 7) |
| Switzerland | National routes, passes, loops; second graph off the hub | 3.3 + 0.8 MB | Trip picker (29 trips, default `top`) |
| Spain | Cap de Creus → Cabo Fisterra | 2.4 MB | Trip picker (8 trips: Francés, Norte, …) |

The planner is the product: pick start and end, choose at each fork, set daily effort, get **days computed not stored**. Elevation on every segment; shops, beds, baths, taps, stations within 2 km. Bicycle / e-bike / 45 km/h pedelec. Train hops. GPX / CSV / hash `#r=` / `#trip=`. Schematic SVG map, not OSM tiles.

The problem is the **product surface**. Nothing on the hub says Shimanami, Furka, Camino, Biwaichi. Nothing shows a place. The planner chrome is a second, darker product. We keep the tool; we rebuild every page in this repo so that chrome never appears.

---

## 3. What the repository already has (the hub hides this)

As of 2026-09-13 (`tigges/routeplanner` `43a0325`, live hub still a dark 1 KB list):

1. **Trip catalogues**
   - Britain: **18 trips** as of `43a0325`. Two graphs, one country — same pattern as Switzerland N–S. National crossing `uk` (Land's End → Edinburgh west, via London, Land's End → London, London → Edinburgh, London → Cambridge) plus London / Ealing rides (`richmond-park`, Hampton Court, Windsor, Chilterns, Grand Union, Box Hill, Thames path, Regent's Canal, Lee Valley, London–Brighton, Epping, Waterlink, Wandle).
   - Japan: **29 trips**. Cape-to-cape plus Shimanami (Top 1), **Biwaichi (Top 2)**, Noto, **Ring-Ring Road (Top 4)**, **Fuji-ichi (Top 5)**, Toyama Bay, **Tokapuchi 400 (Top 7)**, **Awaji (Awa-ichi)**, **Yamanami Highway**, **Pacific Cycling Road from Chōshi**, Keinawa, Bōsō / Tokyo Bay ferry, **Amaichi**, **Okhotsk Cycling Road**, Sapporo–Tokachi, Tokachi–Okhotsk. Towns Motosu, Kawaguchiko, Yamanakako, Gotemba, Akashi, Iwaya, Sumoto, Fukura, Nara, Gojo, Beppu, Yufuin, Aso, Takachiho, Chōshi, Obihiro, Abashiri, Misumi, Ushibuka.
   - Switzerland: 29 trips. E–W and N–S crossings, national routes 1–9 and 99, pass days, loops. Fifteen ranked Top 5/10/15.
   - Spain: **8 trips** as of `5e90a38`. East–west crossing plus **Camino Francés (Top 1)**, **Camino del Norte (Top 2)**, Invierno, Fisterra, Pyrenees / Ebro / Barcelona sections.

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

6. **Two Swiss graphs, one country** — Switzerland is two graphs; the old picker jumped to `/switzerland-north-south/`. Here that is still one country: one hub card, one gallery, the tour sheet loads the right graph later. Do not send N–S clicks to a second published page.

7. **Not to merge** — `JAPMAP` / `JAPANRIDE` are separate experiments.

The tool does not need new features. It needs every former routeplanner page rebuilt here, and one visual system from the first photograph through the effort slider.

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

Internal URLs in **this** product (not github.io):

```
/                         visual hub
/japan/                   gallery, then paper planner
/switzerland/             gallery (all 29, including N–S)
/spain/                   gallery (8 trips), then paper planner
```

Switzerland’s second graph stays data, not a second site. Deep links stay in-page: `#trip=shimanami`, `#r=…`, `#trip=r1&day=3`.

### Room 1 — Hub: “Where to ride”

Four country cards, not a list.

- **Britain** — Land's End. Overline: 18 trips · Land's End to Edinburgh, London and Ealing rides.
- **Japan** — Shimanami bridge or cape light. Overline: 29 trips · Shimanami, Biwaichi, Tokapuchi 400, cape to cape.
- **Switzerland** — pass road or lake. Overline: 29 trips · national routes 1–9.
- **Spain** — Fisterra. Overline: 8 trips · Camino Francés, Norte, Cap de Creus to Fisterra.

One line in the lede: days are computed, not stored. Footer stays the GitHub credit.

### Room 2 — Gallery: “Pick a trip”

This **replaces** the current picker list as the first impression of a country.

Same trips, same filters as the live picker — **top first**, then all, days (≤3 / 4–6 / 7+), easy / moderate / hard, then every catalogue tag. Each card:

- Photograph of the thing the `why` names
- Badge, name, small difficulty pill (already on the live picker)
- The `why`
- `km · climb · ~days` at the country’s default effort

No elevation spark. No friendliness strip. No effort bar. The card is a place.

The schematic map still sits beside or behind the cards so you can see how trips share a network. Hover a card or a line: that line goes coral. Click a **card, a line, or the popup** to open the **tour sheet on this page** (`#trip=r1`). Hover must not rebuild the SVG (that kills the click). Never navigate to `tigges.github.io/routeplanner`.

Layer chips on the map: **crossings · routes · sections**. They are the `kind` field. Default: crossings + routes on; sections/passes muted so 29 Swiss trips do not become spaghetti.

Spain now has trips: same gallery pattern as Switzerland (Francés, Norte, Fisterra, the crossing).

### Room 3 — Planner: a tour sheet, not a second app

Same page frame as the hub and gallery: max-width, kicker, serif title, cream. Do not switch to a 340 px tool sidebar and a full-bleed GIS canvas.

Left: a compact tour sheet that should fit the viewport without a page scrollbar.

- Thin identity (badge, name, one-line sub) — the page header is gone in planner mode
- Stats, whole-ride elevation, friendliness strip, **colour the map line**, segment card (start here / end here)
- Three collapsible sections, same contents as the live planner, mapped onto paper:
  - **Plan** — From / To, direction chips (climb · days), daily effort, **Days I have**, proposed **train hops**
  - **Route** — all network forks with friendliness dots; on-journey forks rewrite the coral line; others say **not on the current journey**
  - **Days** — every day has effort bar, elevation spark, shops / beds / baths / stations / longest gap; click zooms the figure to that stretch; selected day also shows photos
- **Export** docked at the bottom of the left column: GPX, CSV, Print / PDF, Copy link

Right: the schematic map as a **figure** in a rounded paper card. Overlay on the map plane (not in the left column): zoom −/+, vehicle, English / Lokale Namen, Whole trip, All trips, and the vertical facility layers (shops, beds, baths, stations, drinking water). Opening a ride **fits that journey** in the figure; clicking a day (or a strip segment) **fits that stretch** with padding. Whole trip returns to the ride fit. Modest auto-fit only — the atlas still does not become a GIS canvas. Coral ride; gold on the selected day. Facility dots use paper-mapped colours (shop gold, stay blue, bath purple, rail ink, water teal).

Vehicle, language, and zoom live on the map so Plan / Route / Days have room. Forks stay in folded Route. GPX / CSV / print stay in the export dock, not in Plan.

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
- Self-contained HTML publish path — rebuild the planner **in this repo**, on paper. Do not keep the dark `template.html` as a page people open.
- “Days are computed, not stored”
- The Spain-style graph stack (profile, strip, day sparks) — keep the instruments, restyle them onto paper

---

## 10. Next steps

Clean, bright, simple. One paper design. **All four countries** now have a gallery and a paper tour sheet from ride snapshots.

| # | What | Status |
|---|---|---|
| **Hub** | Four country photo cards on `/` / `hub.html` | **this slice** |
| **Britain** | Gallery + GB outline + snapshots for 18 trips (national crossing + London / Ealing), from `43a0325` | **this slice** |
| **CH** | Swiss gallery + paper atlas + ride snapshots for all 29 trips | **done** |
| **Japan** | Gallery + coastline/lakes atlas + snapshots for 29 trips (including Fuji-ichi, Tokapuchi 400, Amaichi, Okhotsk, Awaji, Yamanami, Pacific Cycling Road) | **done** |
| **Spain** | Gallery + paper atlas + snapshots for 8 trips (Francés, Norte, …) | **done** |
| **Print** | Day and tour sheets print a dedicated article (`#printsheet`), not the overlay chrome | **this slice** |
| **Planner sheet** | Wider left column, one scrollbar, slim export; Plan / Route / Days still mapped from the live planner | **done** |
| **Place card** | Town / facility tap on the tour sheet: paper card, OpenStreetMap outbound — not Google, not tiles | **done** |

Snapshots are not the full graph — forks rewrite with `alts[node:option]`, last non-default wins. The old planner stays the graph source. Do not link into it.

Direction chips recompute climb and days from the current chain. Reverse overnight points (`cand.eff`) are inverted; wild published descents are replaced from the elevation profile. The friendliness strip is a click target for start-here / end-here.

---

## 11. Success

Someone who has never seen the tool opens the hub, knows the country from the picture, picks Biwaichi or Ring-Ring or the Rhône from a card that looks like a place, and only then hits the effort slider — still on the same cream page. The numbers stay honest. The pictures make the numbers mean a road.

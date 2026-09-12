# Visual routeplanner — design plan

This is a plan, not a rebuild. The live planners stay as they are until a later pass
lifts this layout onto them. The product already has more story, trips and sights
than the pages show.

Live site: [tigges.github.io/routeplanner](https://tigges.github.io/routeplanner/).
Source of truth: [tigges/routeplanner](https://github.com/tigges/routeplanner).
This repo (`bikeplanner`) is the place to try a visual layer without touching the
11 MB self-contained planner pages.

---

## What the live site is today

Three self-contained cycle-tour planners behind a dark text list.

| Page | What it is | Size | Opens on |
|---|---|---|---|
| Hub `/` | Title, one-line blurb, three links + dates | 1 KB | Country list |
| [Japan](https://tigges.github.io/routeplanner/japan/) | Cape Sōya → Cape Sata, 113 towns, 126 segments | 11 MB | **Trip picker** (19 trips) |
| [Switzerland](https://tigges.github.io/routeplanner/switzerland/) | National routes, passes, loops; second graph at `/switzerland-north-south/` | 3.2 MB + 0.8 MB | **Trip picker** (29 trips, default filter `top`) |
| [Spain](https://tigges.github.io/routeplanner/spain/) | Cap de Creus → Cabo Fisterra, Camino-ish northern crossing | 2.3 MB | Planner (no trips yet) |

The planner itself is a serious tool: pick start and end, choose at each fork,
set daily effort, get days computed (not stored). Elevation on every segment;
shops, beds, baths, taps and stations within 2 km. Vehicle switch (bicycle /
e-bike / 45 km/h speed pedelec). Train hops when a day cap is set. Copy link,
CSV, GPX. Favourites in the browser. English / local names. Schematic SVG map
(country fill, lakes, rivers), not tiled OSM.

That tool is the product. The problem is the **door**: a grey list, then a dense
control panel. Nothing on the hub says “Shimanami”, “Furka”, “Camino”. Nothing
shows a place.

---

## What the repository already has (and the hub hides)

Published **today** (2026-09-12) and easy to miss from the hub:

1. **Trip catalogues, not just trunks**
   - Japan: 19 trips in `config/japan-trips.json` — cape-to-cape plus Shimanami,
     Noto, Toyama Bay, Pacific Cycling Road, Kibi Plain, Nichinan, and named
     sections. Eight carry a `top` rank and a one-line `why` from the guides.
   - Switzerland: 29 trips in `config/switzerland-trips.json` — E–W and N–S
     crossings, national routes 1–9 and 99, pass days, loops (Three passes,
     Bodensee, Léman, Three Lakes). Fifteen are ranked Top 5/10/15.
   - Spain: **no trips file yet**. One crossing with forks (coast vs Pyrenees,
     San Sebastián, …). The trip layer is the obvious next data job for Spain.

2. **Guide copy already written**
   Each ranked trip has `name`, `sub`, `note`, `why`, `tags`, difficulty from
   climb/km (easy / moderate / hard / very hard), and a stored `geo` line so
   another page can draw it. Switzerland opens the picker on `top`. Japan uses
   `routeWord: "famous routes"`.

3. **Sights, already on every segment**
   `seg_scores.json` → `sight_list`: `[km, name_en, kind, dist_km, name_local]`.
   Japan alone: **6,148** named points. The page already plots them when zoomed
   under ~60 km, and already **drops** `memorial` / `artwork` / `monument` on
   Japan (Switzerland drops memorial + artwork). The remaining kinds are the
   visual ones: attraction, museum, peak, viewpoint, cape, castle, ruins,
   waterfall, beach, hot spring.

4. **Water and land as map character**
   Lakes and named rivers (step 12). Closed borders fill as land (Spain,
   Switzerland). Japan stays a coastline. Bike-friendliness colours the route
   strip (signed/quiet / mixed / busy).

5. **Multi-page country, already solved**
   Switzerland is two graphs (`switzerland` + `switzerland-north-south`,
   `hub: false` on the second). The picker draws both networks and jumps with
   `#trip=`. Japan and Spain are one page each. The architecture is “one hub,
   several heavy pages”, not three websites.

6. **Related experiments, not to merge**
   `JAPMAP` / `JAPANRIDE` are separate Vite apps; the GitHub Pages URL is
   currently the unbuilt source. Keep routeplanner as the published product.

---

## Verdict: one site, three rooms — do not split countries

**Build one site with a visual front page.** Keep each country’s planner as its
own page (they are 2–11 MB of inlined graph data). Do **not** split into
`japan.github.io`, `swiss-rides.com`, etc.

| Split by country | One site, visual hub |
|---|---|
| Three brands, three navs, three deploys | One door: “where do you want to ride?” |
| Hub already exists; Switzerland already spans two pages | Same URL family, shared template, shared trips format |
| A Japan-only visitor still needs a country card | Hub → country gallery → planner is three clicks, not three products |
| Photos and type can still be country-coloured | Spain can join the trip format later without a new site |

The **data** is already split (one config, one HTML blob per graph). The **product**
should not be. A rider comparing “a week in the Alps” vs “Shimanami plus the
Inland Sea” should not leave the site.

Internal page split (already correct):

```
/                         visual hub (countries)
/japan/                   trip gallery, then planner
/switzerland/             trip gallery (all 29, including N–S)
/switzerland-north-south/  planner graph only (stay off the hub)
/spain/                   planner today; gallery once trips exist
```

Deep links stay: `#trip=shimanami`, `#r=…` for a saved route.

---

## Design idea (simple, fresh, modern)

Two atmospheres, one accent.

**Discovery is light and photographic.** Paper background, big place names,
one photograph per country and per trip. Short sentences. The existing coral
`#f0713f` stays the route colour — it already means “the line you ride”.

**The planner stays a dark workshop.** The schematic map needs contrast; do not
paste a postcard over it. The map is the identity of the tool. Photos attach
*beside* the map (cards, popups, day list), they do not replace the line.

Tone of voice, already in the data: everyday English, numbers not adjectives,
local name next to English. Keep that. The hub copy should be as short as the
trip `why` lines.

### Visual system

- **Type:** one serif for titles (source of place-feeling), system UI sans for
  controls. No icon font, no illustration library.
- **Colour:** paper `#f6f1ea`, ink `#1c1916`, mute `#6f675e`, route `#f0713f`,
  map night `#0a141b` (unchanged). Country tints only as photo grade, not as
  three palettes.
- **Layout:** full-bleed photo cards, 12-column-ish but really “one stack on
  the phone, three country cards on a desk”.
- **Motion:** none except a slow image fade. The planner already pans/zooms.
- **Photography:** real places, never generated “cycle touring” stock. Credit
  on the image.

### Three screens

**1. Hub — “Where to ride”**  
Three country cards, not a list.

- Japan — a Shimanami bridge or cape light. Overline “19 trips · 3,500 km crossing”.
- Switzerland — a pass road or lake. Overline “29 trips · national routes 1–9”.
- Spain — Fisterra or the Camino meseta. Overline “Cap de Creus to Fisterra”.

Footer stays the GitHub credit. Add one line: days are computed, not stored.

**2. Country gallery — “Pick a trip”**  
This **replaces** the current picker sidebar list as the first impression.
Same trips, same filters (days, easy/hard, top, tags), but each card is a
photograph + the existing badge, name, `why`, km / climb / days.

The schematic map stays — it is how you see how trips share a network — but
it sits as a stage behind or beside the cards, not as the only picture.

Spain, until it has trips: skip this screen, open the planner, with a short
photo strip of the trunk towns (Creus, Girona, Burgos, León, Santiago, Fisterra).

**3. Planner — same tool, with a picture rail**
Do not redesign the forks, effort slider, or day splitter. Add:

- A **trip hero** (the trip’s photo) in the title strip, collapsed on scroll.
- **Town and sight photos** in the existing popup (next to “Pin in Google Maps”).
- A **day strip**: 1–3 images for the day’s best sight/town, taken from the
  segment `sight_list` after the same kind filter the map already uses.
- Trip cards in the picker gain a thumb image (Wikimedia) instead of only the
  SVG outline.

---

## Images of key locations and route sights

The graph already knows *what* to photograph. It does not store pictures. Do
not inline JPEGs into the 11 MB HTML.

### What to show (curated, not every OSM pin)

| Layer | Source in data | How many to keep | Photo rule |
|---|---|---|---|
| Country hero | editorial pick | 1 per country | Famous, uncluttered, rights-clean |
| Trip hero | `trips[].id` | 1 per trip (19 + 29 + later Spain) | The thing the `why` names (bridge, pass, lake, cape) |
| Towns | `P.nodes` (terminus, gateway first) | ~15–40 per country | Wikidata `P18` for the settlement |
| Sights | `sight_list` | 3–8 per day, 1 per popup | Skip memorial / artwork / monument; prefer peak, viewpoint, castle, cape, waterfall, beach, castle, shrine/temple via `attraction` |

Japan’s 6,148 sight rows are a **ranking problem**, not a gallery dump. Use
the same declutter the map uses (nearest to the road, drop generic names), then
cap. A day card with three pictures beats sixty pins.

### How to get the pictures (no new imagery shoot)

1. **Wikidata + Wikimedia Commons** (default). Look up the English or local
   name, take `P18` (image) or the geosearch around the node lat/lon. Store
   `file`, `thumb`, `artist`, `license`, `commons_page`. Thumbs only
   (`320px` / `1280px`).
2. **Hand pick** the ~50 trip and country heroes. One afternoon with Commons
   search for “Shimanami Kaido”, “Furkapass”, “Cap de Creus”, “Catedral de
   Santiago”, “Senmaida”, “Rhine Falls”.
3. **Do not** use Mapillary/Street View as the face of the product (ugly,
   ToS, busy). Optional later: a “road view” link, like the existing Google Maps
   pin.
4. **Fallback** when Wikidata misses: the SVG trip thumb already in the picker,
   or a static map crop. Never a broken image.

### Where the image index lives

A small JSON, one per country, **not** baked into every segment:

```
images/{slug}.json
  countries: { hero, credit }
  trips: { shimanami: { src, credit, alt } }
  places: { onomichi: { src, credit, wikidata } }
  sights: { "Kibitsu shrine": { src, credit } }   # sparse; keyed by English name
```

The published planner fetches this file (GitHub Pages, cacheable, ~100–300 KB
of URLs). The graph page stays self-contained if the fetch fails — photos are
progressive enhancement. `tools/fetch_images.py` can be a pipeline step later;
until then, a hand-written index for heroes is enough.

Legal: Commons licenses (CC BY / CC BY-SA / PD) with the author on the card.
No Unsplash-as-default (generic cycling). No generated landscapes.

---

## What not to change in the first visual pass

- Day splitter, fork comparison, train hops, vehicles, signed-route switch,
  GPX/CSV, hash state.
- Schematic map (it is clearer than a tiled map for a whole country).
- Self-contained HTML publish path (`template.html` → `docs/<slug>/`).
- The rule “days are computed, not stored”.

---

## Build order (when implementation starts)

**Phase A — Hub only (this repo can host the mock).**  
Replace `docs/index.html` in routeplanner with the visual country cards. No
planner changes. Spain/Japan/Switzerland keep working. This is the highest
feeling-of-new for the least risk.

**Phase B — Trip photos on the picker.**  
Add `images/*.json` and a thumb on each `.tcard`. Switzerland and Japan
become magazines; Spain unchanged.

**Phase C — Popup + day-rail photos.**  
Wikidata lookup for gateways and filtered sights. Day list shows a 72 px
strip. Planner remains the same grid.

**Phase D — Spain trips.**  
Same format as `switzerland-trips.json`: the full crossing, a Pyrenees
alternative, a Camino-only week, Fisterra extra, maybe a Basque coast.
Then Spain gets a gallery too.

---

## Success

Someone who has never seen the tool can open the hub, know which country they
want from the picture, pick Shimanami or the Rhône route from a card that looks
like a place, and only then hit the effort slider. The numbers stay honest. The
pictures make the numbers mean a road.

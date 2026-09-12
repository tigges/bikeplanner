# Difficulty, effort and elevation

Plan only. These live on the **tour sheet**, beside a map figure.
Same paper as the hub and gallery. They are not a gallery feature.

---

## What the Spain screenshot is

Three instruments. Keep what they measure. Restyle them as diagrams on
the magazine page — not a cramped tool sidebar, and not stacked spark
cards. Do not put them on gallery cards.

| Instrument | What it measures |
|---|---|
| **Difficulty pill** | Climb per km of the whole trip (`<8` easy, `<14` moderate, `<20` hard, else very hard). Computed, never tagged. |
| **Effort** | `km + climb/10`. Slider = daily budget. Days are computed, not stored. |
| **Elevation** | `SD[id].prof` on every segment. Whole-ride profile coloured by the current split. |

There is no effort-over-distance chart. Do not invent one.

Small improvement: make the profile’s day bands clickable. Same selection
as the numbered day list and the discs on the map.

---

## Where they appear

```
GALLERY (paper)     a photograph of a place
   click a trip
PLANNER (paper)    tour sheet: stats, elevation, days · map as figure
   click a day
DAY                gold on that stretch; spark + photos on the sheet
```

**Gallery / trip card:** photo, badge, name, `why`, km · climb · ~days.
A small difficulty pill is already on the live picker — keep it if it fits
the title row. No spark, no strip, no effort bar. The card is a place.

Cape to cape will read “easy” (7.4 m/km) next to 3,500 km. That is correct:
grade is not length. The km and ~days sit beside the pill.

**Planner sheet:** kicker, serif title, three stats, one elevation diagram,
friendliness strip, numbered day list (`km · climb`). The map sits beside
this as a labeled paper atlas. Coral ride, gold selected day. Photos attach
under “On this day” — they do not replace the profile and they do not sit
on the line.

---

## Data

The planner page already has everything (`tripStats`, `drawProfile`,
`spark`, `diffPill`, `drawStrip`). Do not add `geo.prof` for the gallery.
The gallery does not draw height. Restyle the chrome to the magazine
sheet; do not rewrite the instruments.

---

## What not to do

- Do not put elevation sparks on magazine cards.
- Do not switch the planner to a night workshop or a GIS canvas.
- Do not put elevation on the map.
- Do not zoom the atlas into a single day.
- Do not store days so a card can fake “coloured by day”.
- Do not retag difficulty because a long trip is “easy”.

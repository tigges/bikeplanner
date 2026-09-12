# Difficulty, effort and elevation

Plan only. These already live in the **dark planner**. Leave them there.

The first design is two atmospheres: a photographic front, then the night
workshop you already have. The graphs are part of the workshop. They are not
a gallery feature.

---

## What the Spain screenshot is

Three instruments in the ride sidebar. Keep the layout, the colours, the
day-coloured profile, the friendliness strip, the per-day spark and effort
bar. Do not restyle them onto paper.

| Instrument | What it measures |
|---|---|
| **Difficulty pill** | Climb per km of the whole trip (`<8` easy, `<14` moderate, `<20` hard, else very hard). Computed, never tagged. |
| **Effort** | `km + climb/10`. Slider = daily budget. Days are computed, not stored. |
| **Elevation** | `SD[id].prof` on every segment. Whole-ride profile coloured by the current split; each day inherits a 26 px spark. |

There is no effort-over-distance chart. Do not invent one.

Small improvement only: make the profile’s day bands clickable (they already
colour by day; the day row already zooms). Same selection as the map.

---

## Where they appear

```
GALLERY (paper)     a photograph of a place
   click a trip
PLANNER (dark)      the Spain stack, unchanged
   click a day
DAY                 that day’s spark in the list; photos in the popup / day rail
```

**Gallery / trip card:** photo, badge, name, `why`, km · climb · ~days.
A small difficulty pill is already on the live picker — keep it if it fits
the title row. No spark, no strip, no effort bar. The card is a place.

Cape to cape will read “easy” (7.4 m/km) next to 3,500 km. That is correct:
grade is not length. The km and ~days sit beside the pill.

**Planner:** your screenshot. Night `#0a141b`, coral line, navy day bands.
Photos attach in the title strip, the popup, and a short day rail — they
do not replace the profile.

---

## Data

The planner page already has everything (`tripStats`, `drawProfile`,
`spark`, `diffPill`, `drawStrip`). Do not add `geo.prof` for the gallery.
The gallery does not draw height.

---

## What not to do

- Do not put elevation sparks on magazine cards.
- Do not turn the planner sidebar paper-coloured.
- Do not put elevation on the map.
- Do not store days so a card can fake “coloured by day”.
- Do not retag difficulty because a long trip is “easy”.

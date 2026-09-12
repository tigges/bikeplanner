# Difficulty, effort and elevation

Plan only. These already live in the **planner sidebar**. Keep them there,
restyled onto the same paper as the hub and gallery.

The first design is one atmosphere: a photographic front, then the same cream
page for the schematic atlas. The graphs are part of the planner. They are
not a gallery feature.

---

## What the Spain screenshot is

Three instruments in the ride sidebar. Keep the layout, the day-coloured
profile, the friendliness strip, the per-day spark and effort bar. Restyle
the chrome onto paper (`#f6f1ea` page, cream cards, coral line). Do not put
them on magazine cards.

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
PLANNER (paper)    the Spain stack, on cream
   click a day
DAY                that day’s spark in the list; photos in the popup / day rail
```

**Gallery / trip card:** photo, badge, name, `why`, km · climb · ~days.
A small difficulty pill is already on the live picker — keep it if it fits
the title row. No spark, no strip, no effort bar. The card is a place.

Cape to cape will read “easy” (7.4 m/km) next to 3,500 km. That is correct:
grade is not length. The km and ~days sit beside the pill.

**Planner:** the same instruments. Paper `#f6f1ea`, cream `#fffdf8`, coral
profile, alternating paper day-bands, gold on the selected day. Photos attach
in the title strip, the popup, and a short day rail — they do not replace
the profile.

---

## Data

The planner page already has everything (`tripStats`, `drawProfile`,
`spark`, `diffPill`, `drawStrip`). Do not add `geo.prof` for the gallery.
The gallery does not draw height. Restyle fills and labels; do not rewrite
the instruments.

---

## What not to do

- Do not put elevation sparks on magazine cards.
- Do not switch the planner to a night workshop.
- Do not put elevation on the map.
- Do not store days so a card can fake “coloured by day”.
- Do not retag difficulty because a long trip is “easy”.

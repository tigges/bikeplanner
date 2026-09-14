# Owned graphs

Country graphs live here so ride snapshots can be rebuilt without
`tigges.github.io/routeplanner`.

`planner-template.html` is **build input only**. Do not restyle it.
The paper product is the hub, galleries, and tour sheets at the repo root.

| slug | country gallery | source |
|---|---|---|
| `japan` | Japan | `examples/japan` |
| `uk` | Britain | `examples/uk` |
| `london` | Britain | `examples/london` |
| `switzerland` | Switzerland | `examples/switzerland` |
| `switzerland-north-south` | Switzerland | frozen from published HTML |
| `spain` | Spain | frozen from published HTML |

Caches (`route_cache`, `rev_cache`, `moped_cache`, OSM extracts) stay in
the routeplanner checkout. Spain and Switzerland N–S have no `examples/`
dir there, so `P` / `seg_data` / `seg_scores` are frozen from
`docs/<slug>/index.html` in that checkout.

Refresh from a local `tigges/routeplanner` clone:

```
ROUTEPLANNER=/path/to/routeplanner python3 tools/import_graphs.py
```

Rebuild snapshots (Chrome, local assembled HTML, no github.io):

```
node tools/extract_ride_snapshots.mjs --all
```

Snapshots keep eat / wc / camp as well as shops and beds, thin less than the old github.io scrape, and store signed and moped alternate lines when the graph has them.

# Owned graphs

This directory is the source of truth for country graphs. The paper
site does not fetch `tigges.github.io/routeplanner`. Serve, extract,
and ship from this repo alone.

`planner-template.html` is **build input only**. Do not restyle it.
The paper product is the hub, galleries, and tour sheets at the repo root.

| slug | country gallery | frozen from |
|---|---|---|
| `japan` | Japan | `examples/japan` |
| `uk` | Britain | `examples/uk` |
| `london` | Britain | `examples/london` |
| `switzerland` | Switzerland | `examples/switzerland` |
| `switzerland-north-south` | Switzerland | published HTML |
| `spain` | Spain | published HTML |

Provenance is `manifest.json` (`sourceRepo`, `sourceHead`).
`tigges/routeplanner` is archived input. You do not need that checkout
to run the site or to rebuild snapshots.

Rebuild snapshots (Chrome, local assembled HTML):

```
node tools/extract_ride_snapshots.mjs --all
```

Optional: copy a frozen local checkout into `graphs/` (caches and OSM
extracts stay behind; the OSM rebuild pipeline is not in this repo):

```
ROUTEPLANNER=/path/to/archived-routeplanner python3 tools/import_graphs.py
```

Snapshots keep eat / wc / camp as well as shops and beds, and store
signed and moped alternate lines when the graph has them.

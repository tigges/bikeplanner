# Agent notes

Paper product in this repo: hub → country gallery → tour sheet, served from the repo root. Serve with `python3 -m http.server 8766`. The navy GIS planner is input only; do not restyle `planner/template.html`.

Start a new thread from `main`. Paste [HANDOVER.md](HANDOVER.md) as the first message. Do not continue older agent chats; they already shipped.

**Live sheet (do not undo):** day card is km / effort / beds / character / sleep / export — not town chips. Cue strip is that day’s towns, not peaks. Place card is OpenStreetMap pin + Google Search only. Ghost catalogue is off on the tour sheet. Hakodate is a hop end, not a riding start; first day after it is Aomori. Pan is on by default. KML sits next to GPX.

## Testing during the paper-atlas design loop

- Commit, push, and report as soon as the change works. Do not wait on screen recordings.
- Default proof: stills (or the live site). Do not record a walkthrough unless the user asks, or the change is motion/interaction a screenshot cannot show.
- If a recording is needed, start it only after push, and write the summary without waiting for ffmpeg.
- Serve: `python3 -m http.server 8766`

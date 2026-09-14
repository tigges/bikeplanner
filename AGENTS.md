# Agent notes

Paper product in this repo: hub → country gallery → tour sheet, served from the repo root. Serve with `python3 -m http.server 8766`. The navy GIS planner template is build input only; do not restyle `graphs/planner-template.html`. Country graphs live in `graphs/`. Rebuild snapshots with `node tools/extract_ride_snapshots.mjs`. Do not fetch `tigges.github.io/routeplanner`.

Start a new thread from `main`. Paste [HANDOVER.md](HANDOVER.md) as the first message. Do not continue older agent chats; they already shipped.

**Live sheet (do not undo):** day card is km / effort / beds / character / sleep / export — not town chips. Cue strip is that day’s towns, not peaks. Place card is OpenStreetMap pin + Google Search only. Ghost catalogue is off on the tour sheet. Hakodate is a hop end, not a riding start; first day after it is Aomori. Pan is on by default. KML sits next to GPX.

## Testing during the paper-atlas design loop

- Commit, push, and report as soon as the change works.
- Do **not** take screenshots or screen recordings. Do not upload walkthrough stills or videos.
- Proof is the **live site** after the user pushes: https://tigges.github.io/bikeplanner/
- Serve locally with `python3 -m http.server 8766` only if you need to confirm a file exists. Do not capture the browser.
- Independence: `bash tools/check_independence.sh`

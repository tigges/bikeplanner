#!/usr/bin/env python3
"""Optional: copy country graphs into graphs/ from an archived local checkout.

The site does not need this. Serve and extract from graphs/ already in
the repo. Does not fetch github.io. Caches and OSM extracts are left behind.

  ROUTEPLANNER=/path/to/archived-routeplanner python3 tools/import_graphs.py
"""
from __future__ import annotations

import json
import os
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "graphs"
KEEP = [
    "P.json",
    "proj.json",
    "seg_data.json",
    "seg_scores.json",
    "signed_segments.json",
    "signed_sd.json",
    "signed_sc.json",
    "moped_segments.json",
    "moped_sc.json",
    "motorfree.json",
]
GRAPHS = [
    {"slug": "japan", "country": "japan", "src": "examples/japan", "config": "config/japan.json"},
    {"slug": "uk", "country": "britain", "src": "examples/uk", "config": "config/uk.json"},
    {"slug": "london", "country": "britain", "src": "examples/london", "config": "config/london.json"},
    {"slug": "switzerland", "country": "switzerland", "src": "examples/switzerland", "config": "config/switzerland.json"},
    {
        "slug": "switzerland-north-south",
        "country": "switzerland",
        "src": None,
        "html": "docs/switzerland-north-south/index.html",
        "config": "config/switzerland-north-south.json",
    },
    {"slug": "spain", "country": "spain", "src": None, "html": "docs/spain/index.html", "config": "config/spain.json"},
]


def load_trips(cfg: dict, cfgpath: Path):
    t = cfg.get("trips")
    nw = {}
    if isinstance(t, str):
        d = json.loads((cfgpath.parent / t).read_text(encoding="utf-8"))
        t = d["trips"]
        nw = d.get("networks") or {}
    return t or [], nw


def page_cfg(cfg: dict, cfgpath: Path, proj: dict | None) -> dict:
    trips, networks = load_trips(cfg, cfgpath)
    return {
        "title": cfg["title"],
        "slug": cfg["slug"],
        "by": cfg.get("by", ""),
        "pickerDefault": cfg.get("pickerDefault", "all"),
        "routeWord": cfg.get("routeWord", "national routes"),
        "landFill": bool((cfg.get("graph") or {}).get("land_fill")),
        "trips": trips,
        "networks": networks,
        "lang": cfg["lang"],
        "proj": proj or {},
        "forkLabels": cfg.get("forkLabels") or {},
        "optionNames": cfg.get("optionNames") or {},
        "defaultOptionNames": cfg.get("defaultOptionNames") or {},
        "skippable": cfg.get("skippable") or [],
        "neverSkip": cfg.get("neverSkip") or [],
        "skipRule": cfg.get("skipRule"),
        "vehicles": cfg["vehicles"],
        "signedRoutes": {"label": (cfg.get("signedRoutes") or {}).get("label", "Prefer signed cycle routes")},
        "basemap": cfg.get("basemap"),
        "presets": cfg.get("presets") or [],
    }


def extract_var(html: str, name: str):
    needle = f"var {name}="
    i = html.find(needle)
    if i < 0:
        return None
    i += len(needle)
    obj, _end = json.JSONDecoder().raw_decode(html[i:])
    return obj


def write_json(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def copy_examples(rp: Path, spec: dict) -> dict:
    src = rp / spec["src"]
    dest = DEST / spec["slug"]
    dest.mkdir(parents=True, exist_ok=True)
    copied = []
    for name in KEEP:
        p = src / name
        if not p.exists():
            continue
        shutil.copy2(p, dest / name)
        copied.append(name)
    cfgpath = rp / spec["config"]
    cfg = json.loads(cfgpath.read_text(encoding="utf-8"))
    proj = json.loads((dest / "proj.json").read_text(encoding="utf-8")) if (dest / "proj.json").exists() else None
    write_json(dest / "page.json", page_cfg(cfg, cfgpath, proj))
    return {"slug": spec["slug"], "country": spec["country"], "from": spec["src"], "files": copied}


def freeze_html(rp: Path, spec: dict) -> dict:
    html = (rp / spec["html"]).read_text(encoding="utf-8")
    dest = DEST / spec["slug"]
    dest.mkdir(parents=True, exist_ok=True)
    mapping = {
        "CFG": "page.json",
        "P": "P.json",
        "SD": "seg_data.json",
        "SC": "seg_scores.json",
        "MSEG": "moped_segments.json",
        "MSC": "moped_sc.json",
        "SSEG": "signed_segments.json",
        "SSD": "signed_sd.json",
        "SSC": "signed_sc.json",
        "MF": "motorfree.json",
    }
    copied = []
    for var, name in mapping.items():
        obj = extract_var(html, var)
        if obj is None or obj == {} or obj == []:
            continue
        write_json(dest / name, obj)
        copied.append(name)
    page = json.loads((dest / "page.json").read_text(encoding="utf-8")) if (dest / "page.json").exists() else {}
    if page.get("proj"):
        write_json(dest / "proj.json", page["proj"])
        if "proj.json" not in copied:
            copied.append("proj.json")
    cfgpath = rp / spec["config"]
    if cfgpath.exists() and not (dest / "page.json").exists():
        cfg = json.loads(cfgpath.read_text(encoding="utf-8"))
        write_json(dest / "page.json", page_cfg(cfg, cfgpath, page.get("proj")))
        copied.append("page.json")
    return {"slug": spec["slug"], "country": spec["country"], "from": spec["html"], "files": copied}


def main() -> int:
    rp = Path(os.environ.get("ROUTEPLANNER", "/tmp/routeplanner")).resolve()
    if not (rp / "config").is_dir():
        print("set ROUTEPLANNER to an archived routeplanner checkout", file=sys.stderr)
        return 1
    DEST.mkdir(parents=True, exist_ok=True)
    tpl = rp / "planner" / "template.html"
    if not tpl.is_file():
        print("missing planner/template.html in", rp, file=sys.stderr)
        return 1
    shutil.copy2(tpl, DEST / "planner-template.html")
    manifest = {"sourceRepo": "tigges/routeplanner", "sourceHead": None, "graphs": []}
    head = rp / ".git" / "HEAD"
    if head.exists():
        try:
            import subprocess

            manifest["sourceHead"] = subprocess.check_output(
                ["git", "-C", str(rp), "rev-parse", "HEAD"], text=True
            ).strip()
        except Exception:
            pass
    for spec in GRAPHS:
        info = copy_examples(rp, spec) if spec.get("src") else freeze_html(rp, spec)
        n = json.loads((DEST / spec["slug"] / "P.json").read_text(encoding="utf-8"))
        info["nodes"] = len(n.get("nodes") or [])
        info["segments"] = len(n.get("segments") or [])
        info["forks"] = len(n.get("forks") or [])
        manifest["graphs"].append(info)
        print(spec["slug"], info["nodes"], "nodes", info["segments"], "segs from", info["from"])
    write_json(DEST / "manifest.json", manifest)
    print("wrote", DEST / "manifest.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

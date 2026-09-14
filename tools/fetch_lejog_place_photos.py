#!/usr/bin/env python3
"""Download Wikimedia Commons thumbs for LEJOG graph towns."""
import json, os, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "img", "lejog")
UA = "bikeplanner/0.1 (https://github.com/tigges/bikeplanner; photos for a cycle-tour atlas)"

FILES = {
    "truro.jpg": "Truro Cathedral - Truro.jpg",
    "bodmin.jpg": "Church of St Petroc, Bodmin.jpg",
    "okehampton.jpg": "Okehampton Castle - geograph.org.uk - 7760989.jpg",
    "exeter.jpg": "Exeter Cathedral, west front - geograph.org.uk - 1664600.jpg",
    "taunton.jpg": "Castle Green and Castle Bow, Taunton - geograph.org.uk - 5286392.jpg",
    "bath.jpg": "2023-09-15 Bath Royal Crescent 05.jpg",
    "bristol.jpg": "Clifton Suspension Bridge-9350.jpg",
    "gloucester.jpg": "Gloucester Cathedral exterior 2019.JPG",
    "ludlow.jpg": "Ludlow Castle from Whitcliffe, 2011.jpg",
    "shrewsbury.jpg": "English Bridge Shrewsbury 2.jpg",
    "chester.jpg": "00 3453 Eastgate Clock - Chester, England.jpg",
    "preston.jpg": "The Harris Museum, Art Gallery & Library.jpg",
    "lancaster.jpg": "Lancaster Castle - 2023-03-25.jpg",
    "kendal.jpg": "Kendal Castle at sunset.jpg",
    "penrith.jpg": "Penrith Castle - geograph.org.uk - 1584255.jpg",
    "carlisle.jpg": "Carlisle Castle - geograph.org.uk - 60471.jpg",
    "moffat.jpg": "Town Hall, High Street, Moffat (geograph 4447301).jpg",
    "peebles.jpg": "Tweed Bridge, Peebles.jpg",
    "honiton.jpg": "Honiton High Street - geograph.org.uk - 2293350.jpg",
    "dorchester.jpg": "Dorchester, View of High West Street - geograph.org.uk - 1834521.jpg",
    "salisbury.jpg": "Salisbury Cathedral, west end - geograph.org.uk - 5629961.jpg",
    "winchester.jpg": "Winchester Cathedral - West front - geograph.org.uk - 5612451.jpg",
    "guildford.jpg": "Guildford castle 1.jpg",
    "hertford.jpg": "Hertford Castle.jpg",
    "peterborough.jpg": "Peterborough Cathedral, west front 02.jpg",
    "lincoln.jpg": "Lincoln Cathedral - West Front - geograph.org.uk - 8023224.jpg",
    "selby.jpg": "Selby Abbey west front - geograph.org.uk - 6381875.jpg",
    "northallerton.jpg": "Northallerton High Street.jpg",
    "newcastle.jpg": "Tyne Bridge, Newcastle upon Tyne (geograph 3394344).jpg",
    "alnwick.jpg": "Alnwick Castle 2011.JPG",
    "berwick.jpg": "Berwick-upon-Tweed MMB 17 Royal Tweed Bridge.jpg",
    "durham.jpg": "Durham Cathedral from the river - geograph.org.uk - 5351542.jpg",
    "york.jpg": "York Minster - geograph.org.uk - 2295889.jpg",
}

ALT = {
    "okehampton.jpg": [
        "Okehampton Castle, 2009 - geograph.org.uk - 1574358.jpg",
        "Okehampton Castle - geograph.org.uk - 31510.jpg",
    ],
    "taunton.jpg": ["Taunton Castle 04.jpg", "Castle Bow, Castle Green, Taunton - geograph.org.uk - 7062805.jpg"],
    "bath.jpg": [
        "Royal Crescent in Bath, England - July 2006.jpg",
        "Royal Crescent, Bath 2014 10.jpg",
    ],
    "chester.jpg": [
        "Chester Eastgate Clock.jpg",
        "Eastgate and Eastgate Clock, Chester - geograph.org.uk - 2157286.jpg",
    ],
    "moffat.jpg": [
        "Moffat, High Street, Town Hall.jpg",
        "Moffat, High Street, Moffat House.jpg",
    ],
    "salisbury.jpg": ["Salisbury Cathedral, west front - geograph.org.uk - 7674566.jpg"],
    "selby.jpg": ["Selby Abbey west front - geograph.org.uk - 2119161.jpg"],
    "york.jpg": [
        "Bootham Bar and York Minster - geograph.org.uk - 1688909.jpg",
        "York Minster, York, Yorkshire - geograph.org.uk - 5001421.jpg",
    ],
}


def api(params):
    q = urllib.parse.urlencode(params)
    req = urllib.request.Request(
        "https://commons.wikimedia.org/w/api.php?" + q,
        headers={"User-Agent": UA},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def thumb_url(title):
    if not title.startswith("File:"):
        title = "File:" + title
    data = api({
        "action": "query", "titles": title, "prop": "imageinfo",
        "iiprop": "url|extmetadata", "iiurlwidth": 640, "format": "json",
    })
    pages = data.get("query", {}).get("pages") or {}
    for p in pages.values():
        if p.get("missing") or p.get("invalid"):
            continue
        info = (p.get("imageinfo") or [None])[0]
        if not info:
            continue
        url = info.get("thumburl") or info.get("url")
        meta = info.get("extmetadata") or {}
        license_ = (meta.get("LicenseShortName") or {}).get("value") or ""
        return url, license_, title
    return None, "", title


def search_file(q):
    data = api({
        "action": "query", "list": "search", "srsearch": q,
        "srnamespace": 6, "srlimit": 5, "format": "json",
    })
    return [h["title"] for h in (data.get("query", {}).get("search") or [])]


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        open(dest, "wb").write(r.read())


os.makedirs(OUT, exist_ok=True)
credits = []
for dest, primary in FILES.items():
    path = os.path.join(OUT, dest)
    names = [primary] + ALT.get(dest, [])
    url = used = license_ = None
    for name in names:
        url, license_, used = thumb_url(name)
        if url:
            break
    if not url:
        for h in search_file(primary.replace(".jpg", "").replace(".JPG", "")):
            if h.lower().endswith((".svg", ".png", ".tif", ".pdf")):
                continue
            url, license_, used = thumb_url(h)
            if url:
                break
    if not url:
        print("MISS", dest)
        continue
    download(url, path)
    print("OK", dest, os.path.getsize(path), used, license_)
    credits.append((dest, used, license_ or "Commons"))

print("done", len(credits), "of", len(FILES))
open("/tmp/lejog_credits.json", "w").write(json.dumps(credits, indent=2))

#!/usr/bin/env python3
"""Download Wikimedia Commons thumbs for Ealing / London day-ride towns."""
import json, os, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "img", "ealing")
UA = "bikeplanner/0.1 (https://github.com/tigges/bikeplanner; photos for a cycle-tour atlas)"

FILES = {
    "ealing.jpg": "Town hall ealing 804.JPG",
    "hanwell.jpg": "Grand Union Canal at Hanwell Flight of Locks - geograph.org.uk - 7141306.jpg",
    "kingston.jpg": "The River Thames in Kingston-upon-Thames - geograph.org.uk - 4639083.jpg",
    "marlow.jpg": "Marlow Bridge 04.jpg",
    "littlevenice.jpg": "Little Venice at Westbourne Terrace Road 2020.jpg",
    "limehouse.jpg": "Limehouse Basin panorama - 2022-04-03.jpg",
    "stratford.jpg": "Olympic Stadium, Stratford, London - geograph.org.uk - 4711491.jpg",
    "epping.jpg": "Epping Forest High Beach Essex England - spring pond 08.jpg",
    "crystalpalace.jpg": "Crystal Palace Park.jpg",
    "carshalton.jpg": "Carshalton Ponds (geograph 2991352).jpg",
    "putney.jpg": "Putney Bridge.jpg",
    "staines.jpg": "Thames Path at Staines-upon-Thames - geograph.org.uk - 6486970.jpg",
    "rickmansworth.jpg": "Grand Union Canal in Rickmansworth - geograph.org.uk - 603417.jpg",
    "leatherhead.jpg": "Bridge Street, Leatherhead (geograph 2099800).jpg",
    "beaconsfield.jpg": "Beaconsfield Old Town - geograph.org.uk - 1126588.jpg",
    "ware.jpg": "Ware Gazebos from south bank of River Lea - geograph.org.uk - 302424.jpg",
    "ditchling.jpg": "View from Ditchling Beacon - geograph.org.uk - 2002188.jpg",
    "redhill.jpg": "Station Road, Redhill - geograph.org.uk - 877505.jpg",
    "hamptoncourt.jpg": "Hampton Court Palace (3).jpg",
    "greenwich.jpg": "Cutty Sark Frontage, Greenwich.jpg",
    "westminster.jpg": "Palace of Westminster, London - Feb 2007.jpg",
    "uxbridge.jpg": "Grand Union Canal, Uxbridge - geograph.org.uk - 3500694.jpg",
    "syon.jpg": "Syon House West Aspect.JPG",
    "horsenden.jpg": "Horsenden Hill - geograph.org.uk - 312820.jpg",
}

ALT = {
    "ealing.jpg": ["Ealing Town Hall, New Broadway - geograph.org.uk - 18244.jpg", "EalingBroadway1.jpg"],
    "hanwell.jpg": ["Looking down Hanwell Locks - geograph.org.uk - 396142.jpg"],
    "kingston.jpg": ["By the river, Kingston upon Thames - geograph.org.uk - 3104904.jpg"],
    "marlow.jpg": ["Uk-marlow-bridge.jpg", "Marlow Bridge 06.jpg"],
    "littlevenice.jpg": ["Little Venice in March.jpg", "Little Venice , London , UK , May 2015 - panoramio.jpg"],
    "limehouse.jpg": ["Limehouse Basin.Reza 01.jpg"],
    "stratford.jpg": ["Olympic Stadium (London), 16 April 2012.jpg"],
    "epping.jpg": ["Epping Forest High Beach Waltham Abbey Essex England - oak tree trunks 1.jpg"],
    "crystalpalace.jpg": ["Crystal Palace Park - geograph.org.uk - 3205871.jpg"],
    "carshalton.jpg": ["Carshalton Ponds - geograph.org.uk - 5280075.jpg"],
    "putney.jpg": ["Putney Bridge, London 08.jpg", "Putney Bridge North View.jpg"],
    "staines.jpg": ["Staines from the air.jpg"],
    "rickmansworth.jpg": ["Grand Union Canal Rickmansworth - geograph.org.uk - 27935.jpg"],
    "leatherhead.jpg": ["Leatherhead.jpg"],
    "beaconsfield.jpg": ["Old Town Centre, Beaconsfield - geograph.org.uk - 1126616.jpg"],
    "ware.jpg": ["Bridge view at Ware, Hertfordshire - geograph.org.uk - 5124250.jpg"],
    "ditchling.jpg": ["Ditchling Beacon Panorama 1.jpg", "Ditchling Beacon - geograph.org.uk - 775026.jpg"],
    "redhill.jpg": ["Aerial photograph of Redhill, Surrey - August 2025.jpg"],
    "hamptoncourt.jpg": ["At Hampton Court Palace 2024 068.jpg"],
    "greenwich.jpg": ["London MMB »0A5 River Thames and Cutty Sark.jpg"],
    "westminster.jpg": ["Westminster palace.jpg"],
    "uxbridge.jpg": ["Grand Union Canal, Uxbridge - geograph.org.uk - 3565232.jpg", "Uxbridge, canal moorings - geograph.org.uk - 4122857.jpg"],
    "syon.jpg": ["Syon House 2018-06.jpg"],
    "horsenden.jpg": ["Horsenden Hill.jpg"],
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
    hits = data.get("query", {}).get("search") or []
    return [h["title"] for h in hits]

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
open("/tmp/ealing_credits.json", "w").write(json.dumps(credits, indent=2))

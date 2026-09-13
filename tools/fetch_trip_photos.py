#!/usr/bin/env python3
"""Download a small set of Wikimedia Commons thumbs for trip heroes."""
import json, os, urllib.parse, urllib.request

OUT = "/workspace/preview/img"
UA = "bikeplanner/0.1 (https://github.com/tigges/bikeplanner; photos for a cycle-tour atlas)"
FILES = {
  "biwa.jpg": "Lake Biwa from Mount Shizugatake.jpg",
  "fuji.jpg": "Mount Fuji from Lake Kawaguchi.jpg",
  "noto.jpg": "Noto Peninsula Chirihama.jpg",
  "kasumigaura.jpg": "Kasumigaura from Mount Tsukuba.jpg",
  "aso.jpg": "Aso caldera from Daikanbo.jpg",
  "choshi.jpg": "Inubosaki Lighthouse.jpg",
  "naruto.jpg": "Naruto whirlpools.jpg",
  "nara.jpg": "Todaiji Nara Japan.jpg",
  "nichinan.jpg": "Horikiri Pass Nichinan.jpg",
  "kibi.jpg": "Kibitsu Shrine Okayama.jpg",
  "tottori.jpg": "Tottori Sand Dunes.jpg",
  "toyama.jpg": "Toyama Bay Tateyama.jpg",
  "matsushima.jpg": "Matsushima Bay.jpg",
  "hamana.jpg": "Lake Hamana.jpg",
  "wakkanai.jpg": "Cape Soya monument.jpg",
  "creus.jpg": "Cap de Creus.jpg",
  "santiago.jpg": "Catedral de Santiago de Compostela.jpg",
  "sansebastian.jpg": "San Sebastian Donostia.jpg",
  "ponferrada.jpg": "Castillo de Ponferrada.jpg",
  "pyrenees.jpg": "Pyrenees from Col du Tourmalet.jpg",
  "girona.jpg": "Girona cathedral river.jpg",
  "barcelona.jpg": "Sagrada Familia Barcelona.jpg",
  "landsend.jpg": "Land's End Cornwall.jpg",
  "edinburgh.jpg": "Edinburgh Castle from Princes Street Gardens.jpg",
  "london.jpg": "Tower Bridge London.jpg",
  "richmond.jpg": "Richmond Park deer.jpg",
  "boxhill.jpg": "Box Hill Surrey.jpg",
  "windsor.jpg": "Windsor Castle.jpg",
  "brighton.jpg": "Brighton Palace Pier.jpg",
  "cambridge.jpg": "King's College Cambridge.jpg",
}

# Fallbacks if the primary filename 404s
ALT = {
  "biwa.jpg": ["Biwako from Shizugatake.jpg", "Lake Biwa.jpg"],
  "fuji.jpg": ["Mt.Fuji from Lake Kawaguchiko.jpg", "Mount Fuji.jpg"],
  "noto.jpg": ["Chirihama Nagisa Driveway.jpg", "Wajima Noto.jpg"],
  "kasumigaura.jpg": ["Kasumigaura.jpg", "Lake Kasumigaura.jpg"],
  "aso.jpg": ["Mount Aso.jpg", "Aso Volcano.jpg"],
  "choshi.jpg": ["Inubōsaki Lighthouse.jpg", "Choshi Inubosaki.jpg"],
  "naruto.jpg": ["Naruto whirlpool.jpg", "Naruto Strait.jpg"],
  "nara.jpg": ["Tōdai-ji.jpg", "Todai-ji Nara.jpg"],
  "nichinan.jpg": ["Nichinan Coast.jpg", "Horikiri Pass.jpg"],
  "kibi.jpg": ["Kibitsu Jinja.jpg", "Kibitsu Shrine.jpg"],
  "tottori.jpg": ["Tottori sakyu.jpg", "Tottori Sand Dunes 2012.jpg"],
  "toyama.jpg": ["Toyama Bay.jpg", "Tateyama from Toyama.jpg"],
  "matsushima.jpg": ["Matsushima.jpg", "Godai-do Matsushima.jpg"],
  "hamana.jpg": ["Hamanako.jpg", "Lake Hamana Kanzanji.jpg"],
  "wakkanai.jpg": ["Soya Misaki.jpg", "Wakkanai Cape Soya.jpg"],
  "creus.jpg": ["Cap de Creus Cadaques.jpg", "Cadaqués Cap de Creus.jpg"],
  "santiago.jpg": ["Cathedral of Santiago de Compostela.jpg", "Santiago de Compostela cathedral.jpg"],
  "sansebastian.jpg": ["Donostia-San Sebastián.jpg", "La Concha San Sebastian.jpg"],
  "ponferrada.jpg": ["Ponferrada castle.jpg", "Templar Castle Ponferrada.jpg"],
  "pyrenees.jpg": ["Pyrenees.jpg", "Anso Valley Pyrenees.jpg"],
  "girona.jpg": ["Girona.jpg", "Onyar Girona.jpg"],
  "barcelona.jpg": ["Sagrada Família.jpg", "Barcelona Sagrada Familia.jpg"],
  "landsend.jpg": ["Land's End.jpg", "Land's End signpost.jpg", "Land's End Cornwall 2018.jpg"],
  "edinburgh.jpg": ["Edinburgh Castle.jpg", "Edinburgh Old Town.jpg", "Calton Hill Edinburgh.jpg"],
  "london.jpg": ["Tower Bridge.jpg", "Houses of Parliament London.jpg", "St Paul's Cathedral London.jpg"],
  "richmond.jpg": ["Richmond Park.jpg", "Richmond Park London.jpg", "Isabella Plantation Richmond Park.jpg"],
  "boxhill.jpg": ["Box Hill.jpg", "Box Hill viewpoint.jpg", "Zig Zag Road Box Hill.jpg"],
  "windsor.jpg": ["Windsor Castle from the Thames.jpg", "Windsor Castle Berkshire.jpg"],
  "brighton.jpg": ["Brighton Pier.jpg", "Palace Pier Brighton.jpg", "Brighton seafront.jpg"],
  "cambridge.jpg": ["Kings College Chapel Cambridge.jpg", "Cambridge River Cam.jpg"],
}

def api(params):
    q = urllib.parse.urlencode(params)
    req = urllib.request.Request(
        "https://commons.wikimedia.org/w/api.php?" + q,
        headers={"User-Agent": UA},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def search_file(q):
    data = api({
        "action": "query", "list": "search", "srsearch": q,
        "srnamespace": 6, "srlimit": 5, "format": "json",
    })
    hits = data.get("query", {}).get("search") or []
    return [h["title"] for h in hits]

def thumb_url(title):
    if not title.startswith("File:"):
        title = "File:" + title
    data = api({
        "action": "query", "titles": title, "prop": "imageinfo",
        "iiprop": "url", "iiurlwidth": 640, "format": "json",
    })
    pages = data.get("query", {}).get("pages") or {}
    for p in pages.values():
        info = (p.get("imageinfo") or [None])[0]
        if not info:
            continue
        return info.get("thumburl") or info.get("url")
    return None

def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        open(dest, "wb").write(r.read())

credits = []
os.makedirs(OUT, exist_ok=True)
for dest, primary in FILES.items():
    path = os.path.join(OUT, dest)
    if os.path.exists(path) and os.path.getsize(path) > 2000:
        print("HAVE", dest)
        continue
    names = [primary] + ALT.get(dest, [])
    url = None
    used = None
    for name in names:
        url = thumb_url(name)
        if url:
            used = name
            break
    if not url:
        hits = search_file(primary.replace(".jpg", "").replace(".JPG", ""))
        for h in hits:
            url = thumb_url(h)
            if url:
                used = h
                break
    if not url:
        print("MISS", dest)
        continue
    download(url, path)
    print("OK", dest, os.path.getsize(path), used)
    credits.append((dest, used, url))

if credits:
    open(os.path.join(OUT, "CREDITS.md"), "a").write(
        "\n## Added 2026-09-13 (Britain trip heroes)\n\n"
        + "".join(f"| {a} | {b} | trip / day photo |\n" for a, b, _ in credits)
    )
print("done", len(credits))

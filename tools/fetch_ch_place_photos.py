#!/usr/bin/env python3
"""Download Wikimedia Commons thumbs for Swiss graph towns."""
import json, os, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "img", "ch")
UA = "bikeplanner/0.1 (https://github.com/tigges/bikeplanner; photos for a cycle-tour atlas)"

FILES = {
    "zurich.jpg": "Zürich view Quaibrücke 20200702.jpg",
    "zug.jpg": "Evening sunshine in the old town of Zug.jpg",
    "olten.jpg": "Olten Alte Brücke 02.jpg",
    "stgallen.jpg": "Stiftskirche St. Gallen (April 2017).jpg",
    "neuchatel.jpg": "Château de Neuchatel et de la collégiale.jpg",
    "rapperswil.jpg": "Rapperswil SG Panorama Februar 2011.jpg",
    "meiringen.jpg": "Aareschlucht 159 7 8.jpg",
    "yverdon.jpg": "Yverdon - Place Pestalozzi mit Denkmal, Schloss & Rathaus (2026).jpg",
    "sargans.jpg": "Sargans asv2022-10 img1 Schloss.jpg",
    "zernez.jpg": "Zernez, Unterengadin, Graubünden. 20-09-2023. (actm.) 01.jpg",
    "evian.jpg": "Anciens thermes Evian 2.jpg",
    "thonon.jpg": "Thonon-les-Bains Ripaille.jpg",
    "bregenz.jpg": "Bregenz-view from Pfaender to Bregen harbour, central station-caserne-lake constance-01ASD.jpg",
    "lindau.jpg": "Lindau Harbor Lake Constance 01.jpg",
    "friedrichshafen.jpg": "Uferpromenade Friedrichshafen.JPG",
    "geneva.jpg": "Jet d'eau de Genève (swiss).jpg",
    "bern.jpg": "Bern - Kramgasse mit Zytglogge (2014).jpg",
    "interlaken.jpg": "2011-07-21-Interlaken (Foto Dietrich Michael Weidmann) 033.JPG",
    "thun.jpg": "Thun Castle.jpg",
    "spiez.jpg": "Blick auf Schloss Spiez und Thunersee.jpg",
    "chur.jpg": "Chur in Graubünden (Zwitserland) 41.jpg",
    "bellinzona.jpg": "Piazza del Sole and Castelgrande, Bellinzona, Ticino.jpg",
    "winterthur.jpg": "Winterthur Stadtkirche nordost.jpg",
    "altstaetten.jpg": "Altstätten Marktgasse 2024a.jpg",
    "appenzell.jpg": "Hauptgasse in Appenzell (2017).jpg",
    "beckenried.jpg": "Schweiz - Vierwaldstättersee - Beckenried 0236.jpg",
    "bulle.jpg": "Bulle-Chateau.jpg",
    "burgdorf.jpg": "Schloss Burgdorf.jpg",
    "gersau.jpg": "Gersau-Vierwaldstaettersee-01ASD.jpg",
    "herisau.jpg": "Herisau Platz Reformierte Kirche Suedfassade 02.jpg",
    "langnau.jpg": "Langnau im Emmental, Haldenstrasse mit reformierter Kirche.jpg",
    "laufenburg.jpg": "Altstadt mit Rheinbrücke Laufenburg AG 20230601 0018.jpg",
    "nyon.jpg": "Château de Nyon 2015.jpg",
    "radolfzell.jpg": "Obertorstraße und Münster Radolfzell.jpg",
    "romont.jpg": "Romontchateau.jpg",
    "saintcroix.jpg": "View of Sainte-Croix (Vaud) 02.jpg",
    "sanbernardino.jpg": "San Bernardino Villagio.jpg",
    "sarnen.jpg": "Rathaus Sarnen OW, Nordwestansicht (2018).jpg",
    "stmargrethen.jpg": "2022-St-Margrethen-Kath-Kirche.jpg",
    "stans.jpg": "Ortsmitte Stans.JPG",
    "sustenpass.jpg": "Am Sustenpass.jpg",
    "soerenberg.jpg": "Sörenberg01.JPG",
    "thusis.jpg": "Kirche Thusis 2022.jpg",
    "tiefencastel.jpg": "Tiefencastel Dorf.jpg",
    "vallorbe.jpg": "Vallorbe-Village.jpg",
    "wattwil.jpg": "Wattwil-Kirche-R.jpg",
    "wil.jpg": "Altstadt (Marktgasse) in Wil SG.jpg",
    "willisau.jpg": "Untertor in Willisau, Kanton Luzern.jpg",
    "zweisimmen.jpg": "Zweisimmen Eglise canton Berne Suisse.jpg",
    "ueberlingen.jpg": "Überlingen, Promenade IMG 4755.JPG",
    "sion.jpg": "Panorama of Sion, Switzerland from the north-west, with Tourbillon Castle and Valère Basilica (2022).jpg",
    "martigny.jpg": "Château de La Bâtiaz depuis Chemin-Dessous.jpg",
    "aarau.jpg": "Aarau Altstadt.jpg",
    "fribourg.jpg": "Altstadt Fribourg mit Kathedalenturm und Saane (2019).jpg",
    "davos.jpg": "Davos2.jpg",
}

ALT = {
    "zurich.jpg": ["Limmat and Old town.jpg", "Zürich (CH), Grossmünster -- 2011 -- 1404.jpg"],
    "zug.jpg": ["Zug.jpg", "Zugersee.jpg"],
    "olten.jpg": ["Gedeckte Holzbrücke über die Aare, Olten SO 20210903-jag9889.jpg", "Olten Alte Brücke 02.jpg"],
    "stgallen.jpg": ["St. Gallen cathedral.jpg", "Stiftsbibliothek St. Gallen.jpg"],
    "neuchatel.jpg": ["Château de Neuchatel et de la collégiale.jpg", "Neuchâtel lake and castle from La Roche de l'Ermitage - panoramio.jpg"],
    "rapperswil.jpg": ["Rapperswil - Hafen IMG 0963.JPG", "View of Schloss Rapperswil and St. Johann, Rapperswil, 20250330 0854 7849.jpg"],
    "meiringen.jpg": ["Aareschlucht 166 7.jpg"],
    "yverdon.jpg": ["Yverdon - Place Pestalozzi mit Denkmal, Schloss & Rathaus (2026).jpg"],
    "sargans.jpg": ["Sargans asv2022-10 img6 Kirche und Schloss.jpg"],
    "zernez.jpg": ["Zernez, Unterengadin, Graubünden. 20-09-2023. (actm.) 67.jpg"],
    "evian.jpg": ["View on Évian-les-Bains at nighttime from Lavaux with Lake Geneva.jpg"],
    "thonon.jpg": ["Port de Rives in Thonon-les-Bains 12.jpg", "Thonon-les-Bains - village des pecheurs 1.JPG"],
    "bregenz.jpg": ["Bregenz-view from Pfaender to Bregen harbour, central station-caserne-lake constance-01ASD.jpg"],
    "lindau.jpg": ["Lindau Harbor Lake Constance MS Schwaben 01.jpg", "Lindau Lake Constance 002.jpg"],
    "friedrichshafen.jpg": ["Lake Constance, Friedrichshafen (1X7A9982).jpg"],
    "geneva.jpg": ["Jet d'eau de Genève (swiss).jpg", "Jet d'eau de Genève, 2011-3.jpg"],
    "bern.jpg": ["The Zytglogge clock tower.jpg", "CH Bern Kramgasse.jpg"],
    "interlaken.jpg": ["Höheweg Interlaken 2022-10-02 01.jpg", "Interlaken, Switzerland - panoramio (47).jpg"],
    "thun.jpg": ["Thun Schloss Thun 2.JPG", "Rathausplatz, Zunfthaus zu Metzgern und Schloss Thun (2014).jpg"],
    "spiez.jpg": ["Schloss Spiez und Hafen Spiez.jpg", "Spiez castle from above 140622.jpg"],
    "chur.jpg": ["Chur in Graubünden (Zwitserland) 019.jpg", "Chur - Italian Bridge - 50567231006.jpg"],
    "bellinzona.jpg": ["Castelgrande Bellinzona.JPG"],
    "winterthur.jpg": ["Winterthur.jpg"],
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
open("/tmp/ch_credits.json", "w").write(json.dumps(credits, indent=2))

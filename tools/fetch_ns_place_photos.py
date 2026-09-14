#!/usr/bin/env python3
"""Download Wikimedia Commons thumbs for Japan cape-to-cape places."""
import json, os, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "img", "ns")
UA = "bikeplanner/0.1 (https://github.com/tigges/bikeplanner; photos for a cycle-tour atlas)"

# Local file -> Commons title (File: optional). Landscape of the place, or nearest famous sight.
FILES = {
    "cape-soya.jpg": "The northernmost point of Japan monument in Soya cape.jpg",
    "wakkanai.jpg": "Wakkanai harbor.JPG",
    "rumoi.jpg": "Rumoi, Hokkaidō 01.jpg",
    "ougon.jpg": "Sunset from ougon misaki.jpg",
    "ororon.jpg": "Ororon Line - panoramio.jpg",
    "ishikari.jpg": "Ishikari Bay 20190102.jpg",
    "otaru.jpg": "Otaru Canal, Hokkaido; August 2005.jpg",
    "kutchan.jpg": "Niseko Annupuri (East side).jpg",
    "yakumo.jpg": "Yakumo PA Yakumo-cho view 2014.JPG",
    "oshamambe.jpg": "Limited express Hokuto at Oshamambe Station.jpg",
    "hakodate.jpg": "Mount-Hakodate Night-view.jpg",
    "aomori.jpg": "Aomori Bay Bridge 20170329.jpg",
    "fukaura.jpg": "Toriisaki Lighthouse, Fukaura, Aomori, April 2023 02.jpg",
    "akita.jpg": "Akita Kanto.jpg",
    "sakata.jpg": "OldSakataLightHouse.JPG",
    "tsuruoka.jpg": "Hagurosan Gojunto 2006-A.jpg",
    "murakami.jpg": "Torii gate of Benten-iwa Murakami-shi Niigata-ken Japan 20240614- YAS1816.jpg",
    "niigata.jpg": "Bandai Bridge, Niigata, Japan 001.JPG",
    "kashiwazaki.jpg": "Ishiji Beach, Kashiwazaki, Niigata, Japan, July 2024.jpg",
    "itoigawa.jpg": "Oyashirazu Community Road (Itoigawa City, Niigata Prefecture).jpg",
    "joetsu.jpg": "Takada Castle.jpg",
    "uozu.jpg": "Uozu Buried Forest Museum ac (1).jpg",
    "himi.jpg": "Himi Fishing Port(1).jpg",
    "chirihama.jpg": "Chirihama Nagisa Driveway 2020.jpg",
    "wajima.jpg": "Wajima Asaichi ac (10).jpg",
    "suzu.jpg": "Rokkosaki Lighthouse 4.jpg",
    "nanao.jpg": "石川県七尾美術館 Nanao Art Museum.jpg",
    "kanazawa.jpg": "Kenrokuen linterna fall.JPG",
    "tojinbo.jpg": "Tojinbo cliffs, Fukui Prefecture; September 2019 (01).jpg",
    "fukui.jpg": "Fukui Castle 20210505 01.jpg",
    "tsuruga.jpg": "Port of Tsuruga.jpg",
    "makino.jpg": "Kaizu Osaki 20200920.jpg",
    "otsu.jpg": "Otsu Omi-jingu View to Lake Biwa 4.jpg",
    "kyoto.jpg": "Kiyomizu-dera, Kyoto, November 2016 -07.jpg",
    "osaka.jpg": "Osaka Castle, Keep tower, South view 20190415 1.jpg",
    "kobe.jpg": "Kobe Port Tower and Maritime Museum, November 2016.jpg",
    "akashi.jpg": "Akashi Bridge.JPG",
    "himeji.jpg": "Himeji Castle The Keep Towers.jpg",
    "okayama.jpg": "Okayama Korakuen Garden01.jpg",
    "kurashiki.jpg": "Kurashiki Bikan historical quarter 2.jpg",
    "fukuyama.jpg": "Fukuyama Castle seen from Fukuyama station - May 20, 2019.jpg",
    "onomichi.jpg": "Onomichi from Senko-ji.jpg",
    "imabari.jpg": "Kurushima-Kaikyo Bridge, Seto Inland Sea, Japan.jpg",
    "okamura.jpg": "Okamura Island, Ehime, Japan 26-May-2018.jpg",
    "kure.jpg": "Kure Port from Yamato Wharf.jpg",
    "hiroshima.jpg": "A-Bomb Dome.jpg",
    "iwakuni.jpg": "Iwakuni, ponte kintai-kyo, 05.jpg",
    "yanai.jpg": "Yanai White Wall.JPG",
    "hofu.jpg": "Hofu-tenmangu, haiden-1.jpg",
    "shimonoseki.jpg": "Crossing the Kanmon Bridge towards Kyushu.jpg",
    "moji.jpg": "Mojiko Station 20190831.jpg",
    "nakatsu.jpg": "Nakatsu Castle 20221023-5.jpg",
    "usa.jpg": "Usa Jingu-235.jpg",
    "beppu.jpg": "Umi Jigoku (Sea Hell) in Beppu.jpg",
    "usuki.jpg": "Usuki Stone Buddhas.jpg",
    "nobeoka.jpg": "Central Nobeoka from MtAtago 200807.jpg",
    "miyazaki.jpg": "Aoshima Miyazaki Japan.jpg",
    "nichinan.jpg": "Horikiri Pass Miyazaki 2016.JPG",
    "kushima.jpg": "Cape toi , 都井岬 - panoramio.jpg",
    "kanoya.jpg": "Kanoya Rose Garden 001.JPG",
    "nejime.jpg": "On Yamagawa-Nejime Ferry - Southern view.jpg",
    "cape-sata.jpg": "Cape Sata 03.jpg",
    "noshiro.jpg": "Noshiro montage.jpg",
}

ALT = {
    "joetsu.jpg": ["Takada Castle Joetsu.jpg", "Joetsu city.jpg", "Kasugayama Castle.jpg"],
    "nanao.jpg": ["Nanao Castle.jpg", "Wakura Onsen.jpg"],
    "kutchan.jpg": ["Mount Yotei.jpg", "Niseko.jpg"],
    "usuki.jpg": ["Usuki Stone Buddhas .jpg", "The superb Magaibutsu, or stone Buddhas of Usuki 2009-09-13.jpg"],
    "wajima.jpg": ["Wajima morning market 2024-02-17(1) as.jpg"],
    "akita.jpg": ["Kubota Castle, Omonogashira-gobansho.jpg", "Sakura Matsuri in Senshu Park 20190421a.jpg"],
    "kanazawa.jpg": ["Kenrokuenkumagai.jpg"],
    "hiroshima.jpg": ["Genbaku Dome04-r.JPG", "20181111 Atomic Bomb Dome-5.jpg"],
    "cape-sata.jpg": ["Cape Sata 01.jpg", "Satamisaki Park View Kagoshima001.JPG"],
    "hakodate.jpg": ["Aerial view of Hakodate at night.jpg"],
    "rumoi.jpg": ["Sunset from ougon misaki.jpg"],
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
        info = (p.get("imageinfo") or [None])[0]
        if not info:
            continue
        url = info.get("thumburl") or info.get("url")
        meta = info.get("extmetadata") or {}
        artist = (meta.get("Artist") or {}).get("value") or ""
        license_ = (meta.get("LicenseShortName") or {}).get("value") or ""
        return url, artist, license_, title
    return None, "", "", title

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
    url = used = artist = license_ = None
    for name in names:
        url, artist, license_, used = thumb_url(name)
        if url:
            break
    if not url:
        for h in search_file(primary.replace(".jpg", "").replace(".JPG", "")):
            if h.lower().endswith((".svg", ".png", ".tif", ".pdf")):
                continue
            url, artist, license_, used = thumb_url(h)
            if url:
                break
    if not url:
        print("MISS", dest)
        continue
    download(url, path)
    size = os.path.getsize(path)
    print("OK", dest, size, used, license_)
    credits.append((dest, used, license_ or "Commons"))

cred_path = os.path.join(ROOT, "img", "CREDITS.md")
with open(cred_path, "a", encoding="utf-8") as f:
    f.write("\n## Added 2026-09-14 (Japan cape-to-cape place photos)\n\n")
    f.write("| File | Commons file | License | Use |\n|---|---|---|---|\n")
    for dest, used, license_ in credits:
        f.write(f"| img/ns/{dest} | {used} | {license_} | cape-to-cape place |\n")
print("done", len(credits), "of", len(FILES))

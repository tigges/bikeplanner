#!/usr/bin/env node
/**
 * Pull per-trip planner snapshots from the published country pages (input).
 * Each ride JSON is a thinned chain: segs, fork alts, facilities, computed days.
 * It is not the full graph. Re-run after a new publish:
 *   node tools/extract_ride_snapshots.mjs
 *   node tools/extract_ride_snapshots.mjs --all
 *   node tools/extract_ride_snapshots.mjs --country japan
 */
import { spawn } from "child_process";
import { writeFileSync, mkdirSync, existsSync, renameSync } from "fs";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = "/tmp/rp";
const DATA = "/workspace/preview/data";
const PORT = 8767;
const CDP = 9224;
const ALL = process.argv.includes("--all");
const ONLY = (() => {
  const i = process.argv.indexOf("--country");
  return i >= 0 ? process.argv[i + 1] : null;
})();

const EXTRACT_JS = `(() => {
  function rnd(n, d){ d = d == null ? 0 : d; const p = Math.pow(10, d); return Math.round(n * p) / p; }
  function ll(x, y){
    const a = toLL(x, y);
    return [+a[0].toFixed(5), +a[1].toFixed(5)];
  }
  function thinPts(pts, max){
    if (!pts || pts.length <= max) return pts || [];
    const out = [];
    const step = (pts.length - 1) / (max - 1);
    for (let i = 0; i < max; i++) out.push(pts[Math.round(i * step)]);
    return out;
  }
  function lineLL(line, rev, max){
    if (!line) return [];
    let pts = String(line).split(" ").filter(Boolean).map(q => { const a = q.split(","); return ll(+a[0], +a[1]); });
    if (rev) pts = pts.slice().reverse();
    return thinPts(pts, max || 48);
  }
  function climbFromProf(prof){
    if (!prof || prof.length < 2) return { up: 0, down: 0 };
    let up = 0, down = 0;
    for (let i = 1; i < prof.length; i++){
      const d = prof[i][1] - prof[i - 1][1];
      if (d > 0) up += d; else down -= d;
    }
    return { up: Math.round(up), down: Math.round(down) };
  }
  function saneClimb(raw, km, fromProf){
    const cap = Math.max(2800, (km || 1) * 85);
    if (raw > cap && fromProf > 0) return fromProf;
    if (raw > cap) return Math.round(cap);
    return Math.round(raw || 0);
  }
  function ptAtSeg(seg, k){
    const pts = (seg.line || "").split(" ").map(q => { const a = q.split(","); return [+a[0], +a[1]]; });
    if (pts.length < 2) return pts[0] || [0, 0];
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const f = (k / (seg.km || 1)) * L[L.length - 1];
    let i = 1;
    while (i < L.length - 1 && L[i] < f) i++;
    const t = (f - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
  }
  function thinFac(arr, seg, max){
    if (!arr || !arr.length) return [];
    const step = arr.length <= max ? 1 : Math.ceil(arr.length / max);
    const out = [];
    for (let i = 0; i < arr.length; i += step){
      const f = arr[i];
      const xy = ptAtSeg(seg, f[0]);
      const p = ll(xy[0], xy[1]);
      out.push({ km: +(+f[0]).toFixed(1), off: +(+f[1] || 0).toFixed(1), name: f[2] || "", nameLocal: f[3] || "", lat: p[0], lon: p[1] });
      if (out.length >= max) break;
    }
    return out;
  }
  function packCand(seg){
    const raw = SEG[seg.id] || seg;
    const cand = (raw.cand || []).map(c => {
      const p = c.x != null ? ll(c.x, c.y) : [null, null];
      return {
        km: rnd(c.km, 1),
        eff: rnd(c.eff, 1),
        beds: c.beds || 0,
        node: c.node || null,
        label: c.label || "",
        lat: p[0], lon: p[1]
      };
    });
    return cand;
  }
  function packSeg(id, withFac){
    const s = SEG[id]; if (!s) return null;
    const sd = SD[id] || {};
    const sc = SC[id] || {};
    const facSrc = sd.fac || {};
    const prof = (sd.prof || []).map(p => [rnd(p[0], 1), Math.round(p[1])]);
    const fromProf = climbFromProf(prof);
    const rec = {
      id: s.id,
      frm: s.frm, to: s.to,
      frmName: (NODE[s.frm] || {}).name || s.frm,
      toName: (NODE[s.to] || {}).name || s.to,
      km: rnd(s.km, 1),
      ascent: saneClimb(s.ascent || 0, s.km, fromProf.up),
      descent: saneClimb(s.descent || 0, s.km, fromProf.down),
      effort: Math.round(s.effort || 0),
      effortR: Math.round(s.effortR || 0),
      band: (typeof friendBand === "function" && friendBand(s.id)) || "a",
      signed: Math.round(100 * (sc.route_any || 0)),
      busy: Math.round(100 * (sc.busy || 0)),
      shop: (facSrc.shop || []).length,
      stay: (facSrc.stay || []).length,
      bath: (facSrc.bath || []).length,
      water: (facSrc.water || []).length,
      rail: (facSrc.rail || []).length,
      sights: sc.sights || 0,
      cand: packCand(s),
      prof: thinPts(prof, 40),
      line: lineLL(s.line, false, 48)
    };
    if (withFac){
      rec.fac = {
        shop: thinFac(facSrc.shop, s, 14),
        stay: thinFac(facSrc.stay, s, 14),
        bath: thinFac(facSrc.bath, s, 10),
        rail: thinFac(facSrc.rail, s, 10),
        water: thinFac(facSrc.water, s, 10)
      };
    }
    return rec;
  }
  function chainIds(ch){
    return ch.filter(v => v.mode === "ride").map(v => v.id);
  }
  function sumChain(ch){
    let km = 0, asc = 0;
    ch.forEach(v => { if (v.mode === "ride"){ km += v.km; asc += v.ascent || 0; } });
    return { n: chainIds(ch).length, ids: chainIds(ch), km: Math.round(km), asc: Math.round(asc) };
  }
  function tripPicks(t){
    const p = {};
    tripLegs(t).forEach(L => { Object.assign(p, L.p || {}); });
    return p;
  }
  function chainFlipped(t, node, option){
    const legs = tripLegs(t);
    const out = [];
    for (let i = 0; i < legs.length; i++){
      const L = legs[i];
      const p = Object.assign({}, L.p || {});
      p[node] = option;
      const c = withPicks(p, () => chain(L.s, L.e));
      if (!c.length) return [];
      out.push.apply(out, c);
    }
    return out;
  }
  function dayLine(d){
    if (!d.segs) return [];
    const pts = [];
    d.segs.forEach(g => {
      const s = SEG[g.s.id]; if (!s || !s.line) return;
      const raw = s.line.split(" ").map(q => { const a = q.split(","); return [+a[0], +a[1]]; });
      const a = g.a / (s.km || 1), b = g.b / (s.km || 1);
      const i0 = Math.floor(a * (raw.length - 1));
      const i1 = Math.max(i0 + 1, Math.ceil(b * (raw.length - 1)));
      for (let i = i0; i <= i1 && i < raw.length; i++) pts.push(ll(raw[i][0], raw[i][1]));
    });
    return thinPts(pts, 36);
  }
  function snapshot(t){
    if (!tripHere(t)) return { error: "not on this graph" };
    VEH = "bike";
    try { applyVehicle(); } catch (e) {}
    const target = 100;
    EMIN = CFG.vehicles.minDay.bike;
    EMAX = CFG.vehicles.maxDay.bike;
    const ch = tripChain(t);
    if (!ch.length) return { error: "no chain" };
    const ids = chainIds(ch);
    const townsSet = [];
    const seenT = {};
    ch.forEach(s => {
      [s.frm, s.to].forEach(id => {
        if (!id || seenT[id]) return;
        seenT[id] = 1;
        const n = NODE[id] || {};
        townsSet.push({ id, name: n.name || id, nameLocal: n.nameLocal || n.ja || "" });
      });
    });
    const onNodes = {};
    ch.forEach(s => { onNodes[s.frm] = 1; onNodes[s.to] = 1; });
    const liveForks = P.forks.filter(f => onNodes[f.node]);
    const defaultPick = tripPicks(t);
    const forks = liveForks.map(f => {
      const opts = f.options.map(o => ({
        id: o,
        label: optName(f.node, o),
        band: (typeof VFRIEND !== "undefined" && VFRIEND[o]) || "a"
      }));
      const pick = defaultPick[f.node] || f.options[0];
      return {
        node: f.node,
        name: (NODE[f.node] || {}).name || f.node,
        options: opts,
        pick,
        prompt: LABEL[f.node] || ("At " + ((NODE[f.node] || {}).name || f.node))
      };
    });
    const alts = {};
    liveForks.forEach(f => {
      f.options.forEach(o => {
        const ch2 = chainFlipped(t, f.node, o);
        if (!ch2.length) return;
        const sm = sumChain(ch2);
        alts[f.node + ":" + o] = { pick: o, ids: sm.ids, km: sm.km, asc: sm.asc };
      });
    });
    const altIds = [];
    const seenA = {};
    Object.keys(alts).forEach(k => {
      alts[k].ids.forEach(id => {
        if (ids.indexOf(id) >= 0 || seenA[id]) return;
        seenA[id] = 1;
        altIds.push(id);
      });
    });
    const fw = sumChain(ch);
    const start = tripLegs(t)[0].s;
    const end = tripLegs(t)[tripLegs(t).length - 1].e;
    let bk = { n: 0, ids: [], km: 0, asc: 0 };
    try {
      const bkCh = withPicks(defaultPick, () => chain(end, start));
      if (bkCh && bkCh.length) bk = sumChain(bkCh);
    } catch (e) {}
    const daysIn = splitDays(ch, target).days.filter(d => d.mode === "ride");
    const days = daysIn.map((d, i) => {
      const su = d.segs ? daySupply(d) : { shop: 0, stay: 0, bath: 0, water: 0, rail: 0, gap: 0, prof: [] };
      const line = dayLine(d);
      const last = line[line.length - 1] || [null, null];
      const prof = thinPts((su.prof || []).map(p => [rnd(p[0], 1), Math.round(p[1])]), 32);
      const hi = prof.length ? Math.max.apply(null, prof.map(p => p[1])) : 0;
      const lo = prof.length ? Math.min.apply(null, prof.map(p => p[1])) : 0;
      return {
        n: i + 1,
        frm: d.frm, to: d.to,
        km: rnd(d.km, 1),
        eff: Math.round(d.eff || 0),
        climb: Math.max(0, Math.round(((d.eff || 0) - d.km) * 10)),
        shop: su.shop || 0, stay: su.stay || 0, bath: su.bath || 0,
        water: su.water || 0, rail: su.rail || 0,
        gap: rnd(su.gap || 0, 1),
        hi, lo, prof, line,
        lat: last[0], lon: last[1]
      };
    });
    const extra = [];
    forks.forEach(f => {
      const def = f.options[0] && f.options[0].id;
      if (f.pick && f.pick !== def){
        const o = f.options.find(x => x.id === f.pick);
        extra.push(o ? o.label : f.pick);
      }
    });
    return {
      id: t.id,
      name: t.name,
      num: t.num,
      sub: t.sub,
      why: t.why,
      note: t.note,
      tags: t.tags || [],
      start, end,
      startName: (NODE[start] || {}).name || start,
      endName: (NODE[end] || {}).name || end,
      effort: target,
      signedPct: Math.round(100 * ids.reduce((a, id) => a + ((SC[id] && SC[id].route_any) || 0) * ((SEG[id] && SEG[id].km) || 0), 0) / (fw.km || 1)),
      forkSummary: extra.length ? ("Main line · " + extra.join(" · ")) : ("Main line" + (forks[0] ? " · " + forks.map(f => f.options.find(o => o.id === f.pick)).filter(Boolean).map(o => o.label).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join(", ") : "")),
      stats: { days: days.length, km: fw.km, asc: fw.asc },
      days,
      segs: ids.map(id => packSeg(id, true)).filter(Boolean),
      altSegs: altIds.map(id => packSeg(id, false)).filter(Boolean),
      alts,
      towns: townsSet,
      forks,
      networkForks: P.forks.map(f => ({
        node: f.node,
        prompt: LABEL[f.node] || ("At " + ((NODE[f.node] || {}).name || f.node)),
        on: !!onNodes[f.node],
        options: f.options.map(o => ({
          id: o,
          label: optName(f.node, o),
          band: (typeof VFRIEND !== "undefined" && VFRIEND[o]) || "a"
        }))
      })),
      skippable: skipCands(ids),
      skipRule: SKIPRULE,
      dir: { fw, bk },
      vehicles: CFG.vehicles
    };
  }
  const wanted = window.__WANT__;
  const t = (CFG.trips || []).find(x => x.id === wanted);
  if (!t) return { error: "no trip " + wanted };
  return snapshot(t);
})()`;

const ATLAS_JS = `(() => {
  function ll(x, y){
    const a = toLL(x, y);
    return [+a[0].toFixed(5), +a[1].toFixed(5)];
  }
  function ptsOf(s){
    const raw = typeof s === "string" ? s : (s && (s.pts || s.points)) || "";
    return String(raw).split(" ").filter(Boolean).map(q => {
      const a = q.split(",");
      return ll(+a[0], +a[1]);
    });
  }
  function thin(pts, max){
    if (pts.length <= max) return pts;
    const out = [];
    const step = (pts.length - 1) / (max - 1);
    for (let i = 0; i < max; i++) out.push(pts[Math.round(i * step)]);
    return out;
  }
  return {
    slug: CFG.slug,
    title: CFG.title,
    landFill: !!CFG.landFill,
    coast: (P.coast || []).map(s => thin(ptsOf(s), 200)),
    lakes: ((P.water || {}).lakes || []).map(l => thin(ptsOf(l), 80)),
    rivers: ((P.water || {}).rivers || []).map(r => thin(ptsOf(r), 80))
  };
})()`;

function mime(p) {
  return { ".html": "text/html", ".json": "application/json" }[extname(p)] || "application/octet-stream";
}

function serve() {
  return new Promise((resolve) => {
    const s = createServer(async (req, res) => {
      const p = join(ROOT, req.url === "/" ? "switzerland.html" : req.url.replace(/^\//, ""));
      try {
        const b = await readFile(p);
        res.writeHead(200, { "content-type": mime(p) });
        res.end(b);
      } catch {
        res.writeHead(404);
        res.end("no");
      }
    });
    s.listen(PORT, "127.0.0.1", () => resolve(s));
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitPort(port, n = 50) {
  for (let i = 0; i < n; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) return r.json();
    } catch {}
    await sleep(250);
  }
  throw new Error("chrome did not start");
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.n = 0;
    this.pend = new Map();
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pend.has(msg.id)) {
        const { ok, fail } = this.pend.get(msg.id);
        this.pend.delete(msg.id);
        if (msg.error) fail(new Error(JSON.stringify(msg.error)));
        else ok(msg.result);
      }
    };
  }
  send(method, params = {}) {
    const id = ++this.n;
    return new Promise((ok, fail) => {
      this.pend.set(id, { ok, fail });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function openPage(browserWs, url, waitMs) {
  const ws = new WebSocket(browserWs);
  await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });
  const browser = new Cdp(ws);
  const created = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId: created.targetId, flatten: true });
  const page = {
    send(method, params = {}) {
      const id = ++browser.n;
      return new Promise((ok, fail) => {
        browser.pend.set(id, { ok, fail });
        ws.send(JSON.stringify({ id, method, sessionId, params }));
      });
    }
  };
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Page.navigate", { url });
  await sleep(waitMs || 2500);
  return { browser, page, ws };
}

async function evalJson(page, expression, timeout) {
  const r = await page.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
    timeout: timeout || 90000
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || "eval failed");
  return r.result.value;
}

async function tripIds(page) {
  return evalJson(page, `({slug: CFG.slug, ids: (CFG.trips||[]).filter(t => tripHere(t)).map(t => t.id)})`);
}

async function extractOne(page, id) {
  await page.send("Runtime.evaluate", { expression: `window.__WANT__ = ${JSON.stringify(id)};` });
  return evalJson(page, EXTRACT_JS, 120000);
}

function atlasToGeo(atlas) {
  const feats = [];
  (atlas.coast || []).forEach((ring, i) => {
    if (!ring || ring.length < 2) return;
    const coords = ring.map(p => [p[1], p[0]]);
    feats.push({
      type: "Feature",
      properties: { kind: atlas.landFill ? "land" : "coast", i },
      geometry: atlas.landFill
        ? { type: "Polygon", coordinates: [coords.concat([coords[0]])] }
        : { type: "LineString", coordinates: coords }
    });
  });
  (atlas.lakes || []).forEach((ring, i) => {
    if (!ring || ring.length < 3) return;
    const coords = ring.map(p => [p[1], p[0]]);
    feats.push({
      type: "Feature",
      properties: { kind: "lake", i },
      geometry: { type: "Polygon", coordinates: [coords.concat([coords[0]])] }
    });
  });
  (atlas.rivers || []).forEach((line, i) => {
    if (!line || line.length < 2) return;
    feats.push({
      type: "Feature",
      properties: { kind: "river", i },
      geometry: { type: "LineString", coordinates: line.map(p => [p[1], p[0]]) }
    });
  });
  return { type: "FeatureCollection", features: feats };
}

const PAGES = [
  { country: "switzerland", file: "switzerland.html", wait: 2200 },
  { country: "switzerland", file: "switzerland-ns.html", wait: 1800 },
  { country: "japan", file: "japan.html", wait: 5000 },
  { country: "spain", file: "spain.html", wait: 2500 }
];

function rideDir(country) {
  return join(DATA, "rides", country);
}

async function main() {
  const pages = PAGES.filter(p => !ONLY || p.country === ONLY);
  for (const p of pages) mkdirSync(rideDir(p.country), { recursive: true });

  // Keep existing Swiss snapshots at the old path working until we move them.
  const oldR1 = join(DATA, "rides", "r1.json");
  const newR1 = join(DATA, "rides", "switzerland", "r1.json");
  if (existsSync(oldR1) && !existsSync(newR1)) {
    for (const f of ["ew","r1","r2","r4","r5","r6","r7","r8","r9","r99","furka","susten","grimsel","oberalp","klausen","gotthard","sanbernardino","loetschberg","boatgotthard","loop3","alpine","prealps","bodensee","leman","dreiseen","gotthardx","ticino","loopfng","ns"]) {
      const src = join(DATA, "rides", f + ".json");
      const dest = join(DATA, "rides", "switzerland", f + ".json");
      if (existsSync(src) && !existsSync(dest)) renameSync(src, dest);
    }
  }

  const httpd = await serve();
  const chrome = spawn("google-chrome", [
    `--remote-debugging-port=${CDP}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=/tmp/chrome-snap-${Date.now()}`,
    "--window-size=1280,800"
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let err = "";
  chrome.stderr.on("data", (d) => { err += d.toString(); });
  try {
    const ver = await waitPort(CDP);
    const browserWs = ver.webSocketDebuggerUrl;
    const dumpedAtlas = new Set();
    for (const spec of pages) {
      const url = `http://127.0.0.1:${PORT}/${spec.file}`;
      console.log("open", spec.country, spec.file);
      const { page, ws } = await openPage(browserWs, url, spec.wait);
      const meta = await tripIds(page);
      console.log("  trips on graph:", meta.ids.join(", "));
      if (!dumpedAtlas.has(spec.country)) {
        try {
          const atlas = await evalJson(page, ATLAS_JS);
          const geo = atlasToGeo(atlas);
          const coastPath = join(DATA, spec.country + "_atlas.geojson");
          writeFileSync(coastPath, JSON.stringify(geo));
          console.log("  atlas", geo.features.length, "features →", coastPath);
          dumpedAtlas.add(spec.country);
        } catch (e) {
          console.log("  atlas FAIL", e.message);
        }
      }
      const outDir = rideDir(spec.country);
      for (const id of meta.ids) {
        const path = join(outDir, id + ".json");
        if (!ALL && existsSync(path)) {
          console.log("  skip existing", id);
          continue;
        }
        process.stdout.write("  " + id + " … ");
        try {
          const snap = await extractOne(page, id);
          if (snap && snap.error) {
            console.log("FAIL", snap.error);
            continue;
          }
          writeFileSync(path, JSON.stringify(snap));
          const kb = Math.round(Buffer.byteLength(JSON.stringify(snap)) / 1024);
          console.log(`${snap.stats.days}d ${snap.stats.km}km ${kb}KB segs ${snap.segs.length} alts ${Object.keys(snap.alts).length}`);
        } catch (e) {
          console.log("FAIL", e.message);
        }
      }
      ws.close();
    }
  } finally {
    chrome.kill("SIGTERM");
    httpd.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

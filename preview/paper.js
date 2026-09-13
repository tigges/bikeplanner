const PAPER=Object.assign({
  id:"switzerland",
  title:"Switzerland by bike",
  country:"Switzerland",
  kicker:n=>"Switzerland · "+n+" trips",
  lede:"National routes, pass days and lake loops. Scroll the atlas or use the arrows to walk the list. Open a tour when you are ready. Days are computed from effort — the number is a default, not a timetable.",
  note:"Same catalogue as the old picker. Scroll or use the arrows to walk the list. Open a tour for a paper sheet — days computed from effort, from a snapshot of the graph, not the whole graph in this repo. This page is the product, not a doorway to the dark planner.",
  footer:"Photos Wikimedia Commons. Days are computed, not stored.",
  backAll:n=>"‹ All "+n+" trips",
  tripsUrl:"data/switzerland-trips.json",
  landUrl:"data/switzerland_outline.geojson",
  waterUrl:"data/switzerland_water.geojson",
  atlasUrl:null,
  ridesUrl:"data/rides/switzerland/",
  photosUrl:"data/photos.json",
  landFilter:"Switzerland",
  landMode:"fill",
  bbox:{lon0:5.85, lon1:10.55, lat0:45.78, lat1:47.88},
  photos:{
    r1:"img/furka.jpg", r9:"img/lucerne.jpg", r99:"img/lavaux.jpg", loop3:"img/gletsch.jpg",
    r2:"img/rheinfall.jpg", r4:"img/jaun.jpg", r5:"img/aare.jpg", r6:"img/engadin.jpg",
    r7:"img/jura.jpg", r8:"img/aare.jpg", ns:"img/basel.jpg", ew:"img/furka.jpg",
    furka:"img/furka.jpg", grimsel:"img/gletsch.jpg", susten:"img/gletsch.jpg", oberalp:"img/gletsch.jpg",
    klausen:"img/klausen.jpg", gotthard:"img/gotthard.jpg", sanbernardino:"img/gotthard.jpg",
    loetschberg:"img/gletsch.jpg", boatgotthard:"img/lucerne.jpg", alpine:"img/jaun.jpg",
    prealps:"img/lucerne.jpg", bodensee:"img/constance.jpg", leman:"img/chillon.jpg",
    dreiseen:"img/murten.jpg", gotthardx:"img/gotthard.jpg", ticino:"img/lugano.jpg",
    loopfng:"img/gletsch.jpg"
  },
  places:{
    Realp:["img/furka.jpg","img/gletsch.jpg"],
    Oberwald:["img/gletsch.jpg","img/furka.jpg"],
    Gletsch:["img/gletsch.jpg","img/furka.jpg"],
    Brig:["img/gletsch.jpg","img/furka.jpg"],
    Andermatt:["img/furka.jpg","img/gotthard.jpg"],
    Martigny:["img/lavaux.jpg"],
    Aigle:["img/chillon.jpg","img/lavaux.jpg"],
    Montreux:["img/chillon.jpg","img/lavaux.jpg"],
    Lausanne:["img/lavaux.jpg","img/chillon.jpg"],
    Genève:["img/chillon.jpg","img/lavaux.jpg"],
    Geneva:["img/chillon.jpg","img/lavaux.jpg"],
    Sion:["img/gletsch.jpg"],
    Basel:["img/basel.jpg","img/rheinfall.jpg"],
    Schaffhausen:["img/rheinfall.jpg","img/basel.jpg"],
    "Rhine Falls":["img/rheinfall.jpg"],
    Luzern:["img/lucerne.jpg"],
    Lucerne:["img/lucerne.jpg"],
    Interlaken:["img/lucerne.jpg","img/gletsch.jpg"],
    Chur:["img/engadin.jpg"],
    "St. Moritz":["img/engadin.jpg"],
    Müstair:["img/engadin.jpg"],
    Rorschach:["img/constance.jpg"],
    Romanshorn:["img/constance.jpg"],
    Murten:["img/murten.jpg"],
    "Biel/Bienne":["img/murten.jpg"],
    Biel:["img/murten.jpg"],
    Lugano:["img/lugano.jpg"],
    Chiasso:["img/lugano.jpg"],
    Bellinzona:["img/lugano.jpg","img/gotthard.jpg"],
    Airolo:["img/gotthard.jpg"],
    Linthal:["img/klausen.jpg"],
    "Flüelen":["img/klausen.jpg","img/lucerne.jpg"]
  },
  en:{"Genève":"Geneva","Luzern":"Lucerne","Basel":"Basle","Bern":"Berne","Sankt Gallen":"St. Gallen"},
  photoFallback:"img/furka.jpg"
}, window.PAPER||{});
document.title=PAPER.title;
const DNAME=["easy","moderate","hard","very hard"];
function grade(km,asc){ if(!km) return 0; const r=asc/km; return r<8?0:r<14?1:r<20?2:3; }
function topLabel(n){ if(n<=5) return "Top 5"; if(n<=10) return "Top 10"; if(n<=15) return "Top 15"; return "Top "+n; }
function tripHref(t){ return "#trip="+t.id; }

const PHOTO = PAPER.photos;
function photo(t){
  if(PHOTO[t.id]) return PHOTO[t.id];
  const tags=t.tags||[];
  if(tags.includes("lakes")) return PAPER.photoFallback;
  if(tags.includes("pass")||tags.includes("alpine")) return PAPER.photoFallback;
  return PAPER.photoFallback;
}

const W=900, H=640, PAD=28;
const BBOX=PAPER.bbox;
function xy(lat, lon){
  const x=PAD+(lon-BBOX.lon0)/(BBOX.lon1-BBOX.lon0)*(W-PAD*2);
  const y=PAD+(BBOX.lat1-lat)/(BBOX.lat1-BBOX.lat0)*(H-PAD*2);
  return [x,y];
}
function fromXY(x, y){
  const lon=BBOX.lon0+(x-PAD)/(W-PAD*2)*(BBOX.lon1-BBOX.lon0);
  const lat=BBOX.lat1-(y-PAD)/(H-PAD*2)*(BBOX.lat1-BBOX.lat0);
  return [lat, lon];
}
function esc(s){
  return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function ringPath(ring){
  return ring.map((c,i)=>{ const p=xy(c[1], c[0]); return (i?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1); }).join(" ")+" Z";
}
function linePts(line){
  return (line||[]).map(p=>{ const q=xy(p[0], p[1]); return q[0].toFixed(1)+","+q[1].toFixed(1); }).join(" ");
}

const EN=PAPER.en||{};
const VEH_ORDER=["bike","ebike","opium"];
const VEH_LABEL={bike:"Bicycle",ebike:"E-bike",opium:"45 km/h"};
const VB0="0 0 900 640";

let TRIPS=[], mode="network", ride=null, hover=null, pick=null, filter="top";
let placeOpen=null, placeHits=[];
let PLAN=null, effort=100, veh="bike", selDay=null, filmFocus=1;
let lang="local", zoom=1, startId=null, endId=null;
let folds={plan:true, route:false, days:true};
let picks={}, reversed=false, dtar=0, skipOn={}, skipOff={}, friendOn=false, preferSigned=false, layersOn={}, selSeg=null, vbManual=false, skipCache=null, skipWarn="";
try{
  ["plan","days"].forEach(k=>{
    const v=localStorage.getItem("fold:fold-"+k);
    if(v==="0") folds[k]=false;
    if(v==="1") folds[k]=true;
  });
  if(localStorage.getItem("friend")==="1") friendOn=true;
  if(localStorage.getItem("friend")==="0") friendOn=false;
  if(localStorage.getItem("signed")==="1") preferSigned=true;
  if(localStorage.getItem("signed")==="0") preferSigned=false;
}catch(e){}
const BAND={g:"#97C459",a:"#EF9F27",r:"#E24B4A"};
const LCOL={shop:"#c9a227",stay:"#3d7ec9",bath:"#7a5ea7",rail:"#1c1916",water:"#4a8fa3"};

function geo(t){ return t.geo||{}; }
function daysEst(g){
  const eff=g.eff||g.km||0;
  return Math.max(1, Math.round(eff/100));
}
function matches(t){
  const g=geo(t), n=daysEst(g), tags=t.tags||[];
  if(filter==="top") return t.top>0;
  if(filter==="all") return true;
  if(filter==="d3") return n>0 && n<=3;
  if(filter==="d46"||filter==="d6") return n>=4 && n<=6;
  if(filter==="d7") return n>=7;
  if(filter==="e0"||filter==="easy") return grade(g.km, g.asc)===0;
  if(filter==="e1") return grade(g.km, g.asc)===1;
  if(filter==="e2") return grade(g.km, g.asc)>=2;
  return tags.includes(filter);
}
function filterChips(){
  const tags=[...new Set(TRIPS.flatMap(t=>t.tags||[]))].sort();
  return [
    ["top","top"],["all","all "+TRIPS.length],
    ["d3","up to 3 days"],["d46","4–6 days"],["d7","7+ days"],
    ["e0","easy"],["e1","moderate"],["e2","hard"],
    ...tags.map(t=>[t,t])
  ];
}
function visible(){ return TRIPS.filter(matches); }
function galleryList(){
  return visible().slice().sort((a,b)=>(a.top||99)-(b.top||99));
}
function focusTrip(id){
  if(!id) return;
  pick=id;
  hover=id;
  if(hoverClear){ clearTimeout(hoverClear); hoverClear=null; }
  paint();
  const card=document.querySelector('.tcard[data-id="'+id+'"]');
  if(card) card.scrollIntoView({block:"nearest", behavior:"smooth"});
}
function cycleGallery(dir){
  const list=galleryList();
  if(!list.length) return;
  const cur=pick||hover;
  let i=list.findIndex(t=>t.id===cur);
  if(i<0) i=dir>0?-1:0;
  i=(i+dir+list.length)%list.length;
  focusTrip(list[i].id);
}

function drawGeom(feat, dest, fill, stroke, sw){
  const geom=feat.geometry; if(!geom) return;
  const kind=(feat.properties||{}).kind;
  if(geom.type==="LineString" || geom.type==="MultiLineString" || kind==="coast" || kind==="river"){
    const lines=geom.type==="MultiLineString"?geom.coordinates:(geom.coordinates && geom.coordinates[0] && typeof geom.coordinates[0][0]==="number"?[geom.coordinates]:[]);
    const fromLine=geom.type==="LineString"?[geom.coordinates]:lines;
    (fromLine.length?fromLine:[]).forEach(coords=>{
      if(!coords||coords.length<2) return;
      const pts=coords.map(c=>{ const q=xy(c[1],c[0]); return q[0].toFixed(1)+","+q[1].toFixed(1); }).join(" ");
      const p=document.createElementNS("http://www.w3.org/2000/svg","polyline");
      p.setAttribute("points", pts);
      p.setAttribute("fill","none");
      p.setAttribute("stroke", stroke);
      p.setAttribute("stroke-width", sw);
      p.setAttribute("stroke-linejoin","round");
      dest.appendChild(p);
    });
    if(fromLine.length) return;
  }
  const rings=geom.type==="Polygon"?[geom.coordinates]:(geom.type==="MultiPolygon"?geom.coordinates:[]);
  rings.forEach(poly=>{
    if(!poly||!poly[0]) return;
    const p=document.createElementNS("http://www.w3.org/2000/svg","path");
    p.setAttribute("d", ringPath(poly[0]));
    p.setAttribute("fill", fill);
    p.setAttribute("stroke", stroke);
    p.setAttribute("stroke-width", sw);
    dest.appendChild(p);
  });
}
function drawBase(land, water, atlas){
  const gL=document.getElementById("land"), gW=document.getElementById("water");
  gL.innerHTML=""; gW.innerHTML="";
  (land.features||[]).forEach(f=>{
    if(PAPER.landFilter && (f.properties||{}).name && (f.properties||{}).name!==PAPER.landFilter) return;
    const kind=(f.properties||{}).kind;
    if(kind==="coast" || PAPER.landMode==="coast"){
      drawGeom(f, gL, "none", "#cbbfaf", "1.1");
    } else {
      drawGeom(f, gL, "#e7dfd2", "#cbbfaf", "1.2");
    }
  });
  (atlas.features||[]).forEach(f=>{
    const kind=(f.properties||{}).kind;
    if(kind==="lake") drawGeom(f, gW, "#c5d5de", "#a8c0cc", "0.6");
    else if(kind==="river") drawGeom(f, gW, "none", "#a8c0cc", "1.1");
    else if(kind==="coast") drawGeom(f, gL, "none", "#cbbfaf", "1.0");
    else if(kind==="land") drawGeom(f, gL, "#e7dfd2", "#cbbfaf", "1.2");
  });
  (water.features||[]).forEach(f=>{
    const kind=(f.properties||{}).kind;
    const geom=f.geometry;
    if(kind==="lake" || geom.type==="Polygon" || geom.type==="MultiPolygon"){
      drawGeom(f, gW, "#c5d5de", "#a8c0cc", "0.6");
    } else {
      drawGeom(f, gW, "none", "#a8c0cc", "1.1");
    }
  });
}

function mkPoly(pts){
  const p=document.createElementNS("http://www.w3.org/2000/svg","polyline");
  p.setAttribute("points", pts);
  p.setAttribute("fill","none");
  p.setAttribute("stroke-linecap","round");
  p.setAttribute("stroke-linejoin","round");
  return p;
}
function linkWrap(t){
  const a=document.createElementNS("http://www.w3.org/2000/svg","a");
  const url=tripHref(t);
  a.setAttribute("href", url);
  a.setAttributeNS("http://www.w3.org/1999/xlink","href", url);
  a.setAttribute("data-id", t.id);
  a.style.cursor="pointer";
  a.addEventListener("mouseenter",()=>setHover(t.id));
  a.addEventListener("mouseleave",()=>setHover(null));
  a.addEventListener("click", e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button) return;
    e.preventDefault();
    if(mode==="network"){ focusTrip(t.id); return; }
    openRide(t.id);
  });
  return a;
}
function addTrip(t, dest, role){
  const line=geo(t).line; if(!line||line.length<2) return;
  const pts=linePts(line);
  const a=linkWrap(t);
  a.setAttribute("data-role", role);
  const hit=mkPoly(pts);
  hit.setAttribute("stroke","rgba(0,0,0,0.01)");
  hit.setAttribute("stroke-width","16");
  hit.setAttribute("pointer-events","stroke");
  const vis=mkPoly(pts);
  vis.setAttribute("data-vis","1");
  vis.setAttribute("pointer-events","none");
  a.appendChild(hit);
  a.appendChild(vis);
  dest.appendChild(a);
  styleVis(vis, t, role);
}
function styleVis(vis, t, role){
  const active=hover || pick || (ride && ride.id);
  const isRide=ride && ride.id===t.id;
  vis.removeAttribute("stroke-dasharray");
  if(role==="off"){
    vis.setAttribute("stroke","#d4c9ba"); vis.setAttribute("stroke-width","1"); vis.setAttribute("opacity",".35");
    return;
  }
  if(role==="ghost"){
    vis.setAttribute("stroke","#c4b8a8"); vis.setAttribute("stroke-width","1.4");
    vis.setAttribute("stroke-dasharray","4 5"); vis.setAttribute("opacity",".55");
    return;
  }
  const hl=(mode==="network" && t.id===active) || isRide;
  const dim=mode==="network" && active && t.id!==active;
  vis.setAttribute("stroke", hl?"#f0713f":(t.kind==="crossing"||t.kind==="route"?"#8a7f72":"#b8aea0"));
  vis.setAttribute("stroke-width", hl?4.5:(t.kind==="section"||t.kind==="pass"?1.8:2.6));
  if(t.kind==="crossing" && !hl) vis.setAttribute("stroke-dasharray","7 5");
  vis.setAttribute("opacity", dim?".22":"1");
}
function paintBadge(){
  const gB=document.getElementById("badges");
  gB.innerHTML="";
  if(mode!=="network") return;
  const active=pick || hover || (ride && ride.id);
  const t=TRIPS.find(x=>x.id===active);
  if(!t || (t.kind!=="route" && t.kind!=="crossing")) return;
  const line=geo(t).line||[]; if(!line.length) return;
  const q=xy(line[0][0], line[0][1]);
  const url=tripHref(t);
  const a=document.createElementNS("http://www.w3.org/2000/svg","a");
  a.setAttribute("href", url);
  a.setAttributeNS("http://www.w3.org/1999/xlink","href", url);
  a.style.cursor="pointer";
  a.addEventListener("mouseenter",()=>setHover(t.id));
  a.addEventListener("mouseleave",()=>setHover(null));
  a.addEventListener("click", e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button) return;
    e.preventDefault();
    if(mode==="network"){ focusTrip(t.id); return; }
    openRide(t.id);
  });
  const label=String(t.num||"");
  const w=Math.max(22, label.length*7+12);
  const r=document.createElementNS("http://www.w3.org/2000/svg","rect");
  r.setAttribute("x", q[0]-w/2); r.setAttribute("y", q[1]-10);
  r.setAttribute("width", w); r.setAttribute("height", 20); r.setAttribute("rx",10);
  r.setAttribute("fill","#f0713f"); r.setAttribute("stroke","#f0713f");
  const tx=document.createElementNS("http://www.w3.org/2000/svg","text");
  tx.setAttribute("x", q[0]); tx.setAttribute("y", q[1]+4);
  tx.setAttribute("text-anchor","middle"); tx.setAttribute("font-size","11");
  tx.setAttribute("font-weight","700"); tx.setAttribute("font-family","inherit");
  tx.setAttribute("fill","#fff"); tx.setAttribute("pointer-events","none");
  tx.textContent=label;
  a.appendChild(r); a.appendChild(tx);
  gB.appendChild(a);
}
function paint(){
  document.querySelectorAll("#lines a[data-id], #ghost a[data-id]").forEach(a=>{
    const t=TRIPS.find(x=>x.id===a.dataset.id); if(!t) return;
    const vis=a.querySelector("polyline[data-vis]"); if(!vis) return;
    styleVis(vis, t, a.dataset.role);
  });
  document.querySelectorAll(".tcard[data-id]").forEach(el=>{
    el.classList.toggle("hl", (hover||pick)===el.dataset.id);
  });
  paintBadge();
  pop();
  applyView();
  paintRide();
  paintMini();
  syncMapTools();
}
function draw(){
  skipCache=null;
  const gG=document.getElementById("ghost"), gL=document.getElementById("lines"), gB=document.getElementById("badges");
  const gGold=document.getElementById("gold"), gT=document.getElementById("towns"), gD=document.getElementById("discs");
  const gRide=document.getElementById("ride"), gFac=document.getElementById("fac");
  [gG,gL,gB,gGold,gT,gD,gRide,gFac].forEach(g=>{ if(g) g.innerHTML=""; });
  const showIds=new Set(visible().map(t=>t.id));
  TRIPS.forEach(t=>{
    const line=geo(t).line; if(!line||line.length<2) return;
    const on=showIds.has(t.id);
    const isRide=ride && ride.id===t.id;
    if(mode!=="network"){ addTrip(t, gG, "ghost"); return; }
    if(!on){ addTrip(t, gG, "off"); return; }
    addTrip(t, gL, "live");
  });
  if(mode!=="ride") hidePlaceCard();
  sheet();
  paint();
}

let hoverClear=null;
function setHover(id){
  if(hoverClear){ clearTimeout(hoverClear); hoverClear=null; }
  if(id==null){
    hoverClear=setTimeout(()=>{ hover=null; paint(); }, 160);
    return;
  }
  if(hover===id) return;
  hover=id;
  paint();
}
function parseHash(){
  const h=location.hash.replace(/^#/,"");
  if(!h || h==="network") return {};
  return Object.fromEntries(h.split("&").filter(Boolean).map(s=>{
    const i=s.indexOf("=");
    return i<0?[s,""]:[s.slice(0,i), decodeURIComponent(s.slice(i+1))];
  }));
}
function rideHash(id, day){
  return "trip="+id+(day?("&day="+day):"");
}
function applyHash(){
  const p=parseHash();
  if(p.trip && TRIPS.some(t=>t.id===p.trip)){
    const day=p.day?+p.day:null;
    selDay=day||null;
    vbManual=false;
    if(!(mode==="ride" && ride && ride.id===p.trip)){
      if(ride && ride.id!==p.trip){ PLAN=null; effort=100; veh="bike"; startId=null; endId=null; zoom=1; folds={plan:true, route:false, days:true}; reversed=false; dtar=0; skipOn={}; skipOff={}; selSeg=null; }
      ride=TRIPS.find(t=>t.id===p.trip); mode="ride"; hover=null;
      filmFocus=day||1;
      ensurePlan(p.trip);
    } else if(day) filmFocus=day;
    draw();
    return;
  }
  if(mode!=="network"){ if(ride) pick=ride.id; mode="network"; ride=null; hover=null; selDay=null; draw(); }
}
function openRide(id, day){
  if(!TRIPS.some(t=>t.id===id)) return;
  const h=rideHash(id, day||null);
  if(location.hash.replace(/^#/,"")!==h) location.hash=h;
  else applyHash();
}
function goNetwork(){
  if(ride) pick=ride.id;
  zoom=1; vbManual=false; selDay=null; selSeg=null;
  hidePlaceCard();
  applyView();
  if(location.hash!=="#network") location.hash="network";
  else applyHash();
}
function ensurePlan(id){
  if(PLAN && PLAN.id===id) return;
  const wanted=id;
  PLAN=null;
  fetch(PAPER.ridesUrl+id+".json").then(r=>r.ok?r.json():null).then(d=>{
    if(!ride || ride.id!==wanted) return;
    PLAN=d?sanitizePlan(d):false;
    if(d){
      effort=d.effort||100; startId=d.start; endId=d.end; zoom=1; vbManual=false;
      picks={}; (d.forks||[]).forEach(f=>picks[f.node]=f.pick);
      reversed=false; dtar=0; skipOn={}; skipOff={}; selSeg=null; skipCache=null;
    }
    draw();
  }).catch(()=>{ if(ride && ride.id===wanted){ PLAN=false; draw(); } });
}

function townById(id){
  return ((PLAN&&PLAN.towns)||[]).find(t=>t.id===id);
}
function showName(t){
  if(!t) return "";
  if(typeof t==="string"){
    const o=((PLAN&&PLAN.towns)||[]).find(x=>x.id===t || x.name===t);
    return o?showName(o):niceName(t);
  }
  const local=t.name||"";
  if(lang==="en") return t.nameEn || EN[local] || local;
  return local;
}
function segBook(){
  const m={};
  ((PLAN&&PLAN.segs)||[]).forEach(s=>m[s.id]=s);
  ((PLAN&&PLAN.altSegs)||[]).forEach(s=>m[s.id]=s);
  return m;
}
function pickedIds(){
  const segs=PLAN.segs||[];
  if(!PLAN.alts) return segs.map(s=>s.id);
  const forks=PLAN.forks||[];
  for(let i=forks.length-1;i>=0;i--){
    const f=forks[i], stored=f.pick, def=f.options[0]&&f.options[0].id;
    const p=picks[f.node]||stored||def;
    if(p && stored && p!==stored && PLAN.alts[f.node+":"+p]) return PLAN.alts[f.node+":"+p].ids;
  }
  return segs.map(s=>s.id);
}
function climbFromProf(s, reverse){
  const prof=s.prof||[];
  if(prof.length<2) return null;
  const h=reverse?prof.map(p=>p[1]).slice().reverse():prof.map(p=>p[1]);
  let up=0;
  for(let i=1;i<h.length;i++){ const d=h[i]-h[i-1]; if(d>0) up+=d; }
  return Math.round(up);
}
function climbCap(km){ return Math.max(2800,(km||1)*85); }
function saneClimb(s, reverse){
  const raw=reverse?(s.descent||0):(s.ascent||0);
  const cap=climbCap(s.km);
  if(raw<=cap) return raw;
  const fromProf=climbFromProf(s, reverse);
  if(fromProf!=null) return fromProf;
  return Math.round(cap);
}
function effortOf(s, reverse){
  const climb=saneClimb(s, reverse);
  const guess=Math.round((s.km||0)+climb/10);
  const raw=reverse?(s.effortR||0):(s.effort||0);
  const cap=Math.max(guess*4, (s.km||1)*25);
  if(raw>0 && raw<=cap) return raw;
  return guess;
}
function flipCand(s, newEffort){
  const oldE=s.effort||0;
  const oldSane=oldE>0 && oldE<=Math.max((s.km||1)*25, 800);
  return (s.cand||[]).slice().reverse().map(c=>{
    const km=+((s.km-(c.km||0)).toFixed(1));
    let eff;
    if(oldSane) eff=+(newEffort*(1-(c.eff||0)/oldE)).toFixed(1);
    else eff=+(newEffort*(km/Math.max(s.km,0.01))).toFixed(1);
    return {...c, km, eff:Math.max(0,eff)};
  });
}
function sanitizeSeg(s){
  const ascent=saneClimb(s,false);
  const descent=saneClimb(s,true);
  const effort=effortOf(s,false);
  const effortR=effortOf(s,true);
  if(ascent===s.ascent && descent===s.descent && effort===s.effort && effortR===(s.effortR||0)) return s;
  return {...s, ascent, descent, effort, effortR};
}
function sanitizePlan(d){
  if(!d||!d.segs) return d;
  const segs=d.segs.map(sanitizeSeg);
  const altSegs=(d.altSegs||[]).map(sanitizeSeg);
  const book={}; segs.concat(altSegs).forEach(s=>book[s.id]=s);
  const dir=d.dir?{...d.dir}:d.dir;
  if(dir&&dir.bk&&dir.bk.ids){
    dir.bk={...dir.bk, asc:Math.round(dir.bk.ids.reduce((n,id)=>n+saneClimb(book[id]||{}, true),0))};
  }
  if(dir&&dir.fw&&dir.fw.ids){
    dir.fw={...dir.fw, asc:Math.round(dir.fw.ids.reduce((n,id)=>n+saneClimb(book[id]||{}, false),0))};
  }
  return {...d, segs, altSegs, dir};
}
function flipSeg(s){
  const ascent=saneClimb(s,true);
  const descent=saneClimb(s,false);
  const effort=effortOf(s,true);
  const line=(s.line||[]).slice().reverse();
  const cand=flipCand(s, effort);
  const prof=(s.prof||[]).slice().reverse().map(p=>[+(s.km-(p[0]||0)).toFixed(1), p[1]]);
  return {...s, frm:s.to, to:s.frm, frmName:s.toName, toName:s.frmName,
    ascent, descent, effort, effortR:effortOf(s,false), line, cand, prof};
}
function orientWalk(segs, fromId){
  if(!segs.length) return segs;
  const out=[];
  let at=fromId||segs[0].frm;
  segs.forEach(s=>{
    const cur=(at && s.frm!==at && s.to===at) ? flipSeg(s) : s;
    out.push(cur);
    at=cur.to;
  });
  return out;
}
function chainSegs(){
  if(!PLAN || PLAN===false) return [];
  const book=segBook();
  let segs=pickedIds().map(id=>book[id]).filter(Boolean).map(s=>{
    if(s.cand&&s.cand.length) return s;
    const last=s.line&&s.line[s.line.length-1], first=s.line&&s.line[0];
    return {...s, cand:[
      {km:0,eff:0,beds:0,label:s.frmName,lat:first&&first[0],lon:first&&first[1]},
      {km:s.km,eff:s.effort,beds:0,node:s.to,label:s.toName,lat:last&&last[0],lon:last&&last[1]}
    ]};
  });
  if(preferSigned && veh!=="opium"){
    segs=segs.map(s=>{
      const a=s.signedAlt; if(!a) return s;
      return {...s, km:a.km, ascent:a.ascent, descent:a.descent, effort:a.effort, effortR:a.effortR,
        line:a.line||s.line, cand:a.cand&&a.cand.length?a.cand:s.cand, prof:a.prof||s.prof, signedGeom:true};
    });
  }
  segs=orientWalk(segs, PLAN.start||(segs[0]&&segs[0].frm));
  if(reversed) segs=segs.slice().reverse().map(flipSeg);
  return segs;
}
function skipState(){
  if(skipCache) return skipCache;
  const segs=chainSegs();
  const ids=segs.map(s=>s.id);
  const cands=(PLAN.skippable||[]).filter(id=>ids.includes(id));
  const on={...skipOn}, auto={};
  function rideN(flag){
    const kept=segs.filter(s=>!(on[s.id]||flag[s.id]));
    if(!kept.length) return 0;
    return splitRide({...PLAN, segs:kept, startName:kept[0].frmName, endName:kept[kept.length-1].toName}, effort, veh).length;
  }
  skipWarn="";
  if(dtar>0){
    for(const id of cands){
      if(on[id]||skipOff[id]) continue;
      if(rideN(auto)<=dtar) break;
      auto[id]=1;
    }
    const n=rideN(auto);
    if(n>dtar) skipWarn="Still "+n+" riding days with every sensible train hop taken — raise the daily effort, allow more days, or shorten the route.";
  }
  return skipCache={cands, on, auto};
}
function chainTowns(){
  const segs=chainSegs();
  const out=[], seen=new Set();
  segs.forEach(s=>{
    [{id:s.frm,name:s.frmName},{id:s.to,name:s.toName}].forEach(t=>{
      if(!t.id||seen.has(t.id)) return;
      seen.add(t.id);
      out.push({id:t.id, name:t.name});
    });
  });
  return out.length?out:(PLAN.towns||[]);
}
function forkSummary(){
  const extra=[];
  (PLAN.forks||[]).forEach(f=>{
    const def=f.options[0]&&f.options[0].id;
    const p=picks[f.node]||f.pick||def;
    if(p && p!==def){
      const o=f.options.find(x=>x.id===p);
      extra.push(o?o.label:p);
    }
  });
  return extra.length?"Main line · "+extra.join(" · "):(PLAN.forkSummary||"Main line");
}
function signedNoteText(){
  if(veh==="opium") return "Not used by the S-pedelec: it keeps its own line.";
  const book=segBook();
  const sl=pickedIds().map(id=>book[id]).filter(s=>s && s.signedAlt);
  if(!sl.length) return "";
  const extra=sl.reduce((n,s)=>n+((s.signedAlt.km||0)-(s.km||0)),0);
  const km=Math.round(extra);
  return preferSigned
    ? sl.length+" legs on this journey follow a signed cycle route, "+km+" km longer in total than the direct lines."
    : "Would move "+sl.length+" legs on this journey onto a signed cycle route, adding "+km+" km.";
}
function travelEnds(){
  const segs=activeSegs();
  if(!segs.length) return {from:PLAN.startName, to:PLAN.endName, fromId:startId, toId:endId};
  return {from:showName(segs[0].frmName||segs[0].frm), to:showName(segs[segs.length-1].toName||segs[segs.length-1].to), fromId:segs[0].frm, toId:segs[segs.length-1].to};
}
function peekDir(rev){
  if(rev===reversed){
    const st=rideStats();
    return {asc:st.asc, km:st.km, days:planDays().filter(d=>d.mode!=="train").length};
  }
  const keepR=reversed, keepC=skipCache, keepW=skipWarn, keepS=startId, keepE=endId;
  const tmp=startId; startId=endId; endId=tmp;
  reversed=rev; skipCache=null;
  const st=rideStats();
  const days=planDays().filter(d=>d.mode!=="train").length;
  reversed=keepR; skipCache=keepC; skipWarn=keepW; startId=keepS; endId=keepE;
  return {asc:st.asc, km:st.km, days};
}
function isSkipped(id){
  const st=skipState();
  return !!(st.on[id]||st.auto[id]);
}
function activeSegs(){
  const segs=chainSegs();
  const towns=segs.flatMap(s=>[s.frm,s.to]);
  let i0=segs.findIndex(s=>s.frm===startId);
  let i1=segs.findIndex(s=>s.to===endId);
  if(i0<0) i0=0;
  if(i1<0) i1=segs.length-1;
  if(i1<i0){ i0=0; i1=segs.length-1; }
  return segs.slice(i0, i1+1);
}
function rideStats(){
  const segs=activeSegs().filter(s=>!isSkipped(s.id));
  let km=0,asc=0,signed=0;
  segs.forEach(s=>{ km+=s.km; asc+=saneClimb(s,false); signed+=(s.signed||0)*s.km; });
  return {km:Math.round(km), asc:Math.round(asc), signed:km?Math.round(signed/km):0};
}
function ridePoints(){
  const pts=[];
  activeSegs().forEach(s=>{ if(isSkipped(s.id)) return; (s.line||[]).forEach(p=>pts.push(p)); });
  return pts;
}
function fitPts(pts, pad){
  const svg=document.getElementById("map"); if(!svg||!pts||pts.length<2){ if(svg) svg.setAttribute("viewBox", VB0); return; }
  const xypts=pts.map(p=>xy(p[0], p[1]));
  let x0=Math.min(...xypts.map(p=>p[0])), x1=Math.max(...xypts.map(p=>p[0]));
  let y0=Math.min(...xypts.map(p=>p[1])), y1=Math.max(...xypts.map(p=>p[1]));
  const padN=pad||1.2;
  let w=Math.max((x1-x0)*padN, 28), h=Math.max((y1-y0)*padN, 28);
  const ar=W/H;
  if(w/h<ar) w=h*ar; else h=w/ar;
  let cx=(x0+x1)/2, cy=(y0+y1)/2;
  let x=cx-w/2, y=cy-h/2;
  x=Math.max(-120, Math.min(W+80-w, x));
  y=Math.max(-120, Math.min(H+80-h, y));
  zoom=Math.max(1, +(W/w).toFixed(2));
  svg.setAttribute("viewBox", x.toFixed(1)+" "+y.toFixed(1)+" "+w.toFixed(1)+" "+h.toFixed(1));
}
function ink(n){
  const z=Math.max(zoom,1);
  return +Math.max(n/z, n*0.09).toFixed(2);
}
function fitRide(){ fitPts(ridePoints(), 1.38); }
function fitDay(){
  const days=planDays();
  const d=days.find(x=>x.n===selDay);
  let line=d && d.line;
  if(!line||line.length<2){
    let k0=0,k1=0;
    days.forEach(x=>{ if(x.mode==="train") return; if(x.n<selDay) k0+=x.km; if(x.n<=selDay) k1+=x.km; });
    line=sliceLine(activeSegs().filter(s=>!isSkipped(s.id)), k0, k1);
  }
  if(line&&line.length>1) fitPts(line, 1.18);
  else fitRide();
}
function fitSeg(){
  const s=activeSegs().find(x=>x.id===selSeg);
  if(s&&s.line&&s.line.length>1) fitPts(s.line, 1.1);
  else fitRide();
}
function applyView(){
  const svg=document.getElementById("map");
  if(!svg) return;
  if(mode!=="ride" || !PLAN || PLAN===false){
    svg.setAttribute("viewBox", VB0);
    vbManual=false;
    return;
  }
  if(vbManual) return;
  if(selDay) fitDay();
  else if(selSeg) fitSeg();
  else fitRide();
}
function bumpZoom(f){
  const svg=document.getElementById("map"); if(!svg) return;
  const vb=(svg.getAttribute("viewBox")||VB0).split(/\s+/).map(Number);
  const cx=vb[0]+vb[2]/2, cy=vb[1]+vb[3]/2;
  let w=Math.min(Math.max(vb[2]*f, 90), W*1.45);
  let h=w*(H/W);
  vbManual=true;
  zoom=Math.max(1, +(W/w).toFixed(2));
  svg.setAttribute("viewBox", (cx-w/2).toFixed(1)+" "+(cy-h/2).toFixed(1)+" "+w.toFixed(1)+" "+h.toFixed(1));
  paintMini();
}
function syncMapTools(){
  const back=document.getElementById("mapback");
  const tools=document.getElementById("maptools");
  const layers=document.getElementById("maplayers");
  const on=mode==="ride" && PLAN && PLAN!==false;
  back.hidden=!on;
  tools.hidden=!on;
  layers.hidden=!on;
  if(!on) return;
  back.textContent=PAPER.backAll(TRIPS.length);
  document.getElementById("vehbtn").textContent=VEH_LABEL[veh]||"Bicycle";
  document.getElementById("langbtn").textContent=lang==="local"?"English names":(PAPER.localLabel||"Lokale Namen");
  layers.querySelectorAll("button[data-l]").forEach(b=>b.classList.toggle("on", !!layersOn[b.dataset.l]));
}
function setVeh(k){
  veh=k;
  if(PLAN && PLAN.vehicles && PLAN.vehicles.targetRange){
    const tr=PLAN.vehicles.targetRange[k];
    if(tr){ if(effort<tr[0]) effort=tr[0]; if(effort>tr[1]) effort=tr[1]; }
  }
  selDay=null; skipCache=null;
  draw();
}

function scaleSeg(s, v){
  if(v==="ebike"){
    return {km:s.km, effort:Math.round(s.km+(s.effort-s.km)/3), ascent:s.ascent,
      cand:(s.cand||[]).map(c=>({...c, eff:+(c.km+(c.eff-c.km)/3).toFixed(1)}))};
  }
  if(v==="opium"){
    return {km:s.km, effort:Math.round(s.km), ascent:s.ascent,
      cand:(s.cand||[]).map(c=>({...c, eff:+(+c.km).toFixed(1)}))};
  }
  return {km:s.km, effort:s.effort, ascent:s.ascent, cand:s.cand};
}
function splitRide(plan, target, v){
  const EMIN={bike:40,ebike:32,opium:38}[v], EMAX={bike:300,ebike:160,opium:280}[v];
  const L=plan.segs.map(s=>scaleSeg(s,v));
  const c0=plan.segs[0]&&plan.segs[0].cand&&plan.segs[0].cand[0];
  const C=[{eff:0,km:0,beds:(c0&&c0.beds)||0,label:plan.startName,lat:c0&&c0.lat, lon:c0&&c0.lon}];
  let base=0,bk=0;
  const SEGS=[];
  L.forEach(s=>{
    s.cand.forEach(c=>{ if(c.km<=0) return; C.push({eff:base+c.eff, km:bk+c.km, beds:c.beds, label:c.label||(c.node||""), lat:c.lat, lon:c.lon}); });
    SEGS.push({s,k0:bk,k1:bk+s.km});
    base+=s.effort; bk+=s.km;
  });
  const n=C.length, dp=Array(n).fill(Infinity), bp=Array(n).fill(-1); dp[0]=0;
  for(let i=1;i<n;i++){
    for(let j=Math.max(0,i-160);j<i;j++){
      if(dp[j]===Infinity) continue;
      const e=C[i].eff-C[j].eff;
      if(e<EMIN||e>EMAX) continue;
      const c=dp[j]+Math.pow((e-target)/target,2)*100-Math.min(C[i].beds||0,6)*1.2-(C[i].label?14:0);
      if(c<dp[i]){ dp[i]=c; bp[i]=j; }
    }
  }
  if(dp[n-1]===Infinity){
    return [{n:1,frm:plan.startName,to:plan.endName,km:+bk.toFixed(1),eff:Math.round(base),climb:plan.stats.asc,lat:null,lon:null}];
  }
  const path=[]; let i=n-1; while(i>0){ path.push(C[i]); i=bp[i]; } path.push(C[0]); path.reverse();
  const days=[];
  for(let k=1;k<path.length;k++){
    const km=+(path[k].km-path[k-1].km).toFixed(1);
    const eff=Math.round(path[k].eff-path[k-1].eff);
    days.push({
      n:k, frm:niceName(path[k-1].label||plan.startName), to:niceName(path[k].label||plan.endName),
      km, eff, climb:Math.max(0,Math.round((eff-km)*10)),
      lat:path[k].lat, lon:path[k].lon
    });
  }
  return days;
}
function sliceLine(segs, k0, k1){
  const pts=[]; let off=0;
  segs.forEach(s=>{
    const a=Math.max(k0,off), b=Math.min(k1,off+s.km);
    if(b>a+0.05 && s.line && s.line.length){
      const t0=(a-off)/s.km, t1=(b-off)/s.km;
      const i0=Math.floor(t0*(s.line.length-1)), i1=Math.max(i0+1, Math.ceil(t1*(s.line.length-1)));
      for(let i=i0;i<=i1 && i<s.line.length;i++) pts.push(s.line[i]);
    }
    off+=s.km;
  });
  return pts;
}
function planDays(){
  if(!PLAN || PLAN===false) return [];
  const segs=activeSegs();
  const st=skipState();
  const skipped=segs.some(s=>st.on[s.id]||st.auto[s.id]);
  const defaultPick=(PLAN.forks||[]).every(f=>(picks[f.node]||f.pick)===f.pick);
  const full=!reversed && startId===PLAN.start && endId===PLAN.end && !skipped && defaultPick
    && veh==="bike" && effort===PLAN.effort && PLAN.days;
  if(full) return PLAN.days.map(d=>({...d, mode:"ride", frm:showName(d.frm), to:showName(d.to)}));
  const days=[];
  let buf=[];
  const flush=()=>{
    if(!buf.length) return;
    splitRide({...PLAN, segs:buf, startName:buf[0].frmName, endName:buf[buf.length-1].toName}, effort, veh)
      .forEach(d=>days.push({...d, mode:"ride"}));
    buf=[];
  };
  segs.forEach(s=>{
    if(isSkipped(s.id)){
      flush();
      days.push({mode:"train", frm:showName(s.frmName||s.frm), to:showName(s.toName||s.to), km:Math.round(s.km)});
    } else buf.push(s);
  });
  flush();
  let n=0;
  days.forEach(d=>{
    if(d.mode==="train") return;
    n++; d.n=n; d.frm=showName(d.frm); d.to=showName(d.to);
  });
  return enrichDays(days);
}
function enrichDays(days){
  const segs=activeSegs().filter(s=>!isSkipped(s.id));
  let dayOff=0;
  days.forEach(d=>{
    if(d.mode==="train") return;
    let shop=0,stay=0,bath=0,rail=0,water=0,k=0;
    segs.forEach(s=>{
      const a=Math.max(dayOff,k), b=Math.min(dayOff+d.km, k+s.km);
      if(b>a+0.05){
        const frac=(b-a)/s.km;
        shop+=(s.shop||0)*frac; stay+=(s.stay||0)*frac; bath+=(s.bath||0)*frac;
        rail+=(s.rail||0)*frac; water+=(s.water||0)*frac;
      }
      k+=s.km;
    });
    d.shop=Math.round(shop); d.stay=Math.round(stay); d.bath=Math.round(bath);
    d.rail=Math.round(rail); d.water=Math.round(water);
    if(!d.line||d.line.length<2) d.line=sliceLine(segs, dayOff, dayOff+d.km);
    if(!d.prof||!d.prof.length){
      const prof=[];
      let k=0;
      segs.forEach(s=>{
        (s.prof||[]).forEach(q=>{
          const x=k+q[0];
          if(x>=dayOff-0.05 && x<=dayOff+d.km+0.05) prof.push([+(x-dayOff).toFixed(2), q[1]]);
        });
        k+=s.km;
      });
      d.prof=prof;
    }
    if(d.lat==null && d.line&&d.line.length){
      const last=d.line[d.line.length-1];
      d.lat=last[0]; d.lon=last[1];
    }
    dayOff+=d.km;
  });
  return days;
}
function dayPhotos(to){
  const places=PAPER.places||{};
  const hit=places[to];
  if(hit) return Array.isArray(hit)?hit:[hit];
  const low=String(to||"").toLowerCase();
  if(low){
    for(const k of Object.keys(places)){
      const kl=k.toLowerCase();
      if(low===kl || low.indexOf(kl)>=0 || kl.indexOf(low)>=0){
        const v=places[k];
        return Array.isArray(v)?v:[v];
      }
    }
  }
  const src=ride && PHOTO[ride.id];
  return src?[src]:[];
}
function niceName(label){
  if(!label) return label;
  const t=(PLAN.towns||[]).find(x=>x.id===label || (x.name||"").toLowerCase()===String(label).toLowerCase());
  if(t) return t.name;
  return String(label).replace(/\b([a-z])/g,c=>c.toUpperCase());
}
function paintRide(){
  const gRide=document.getElementById("ride"), gGold=document.getElementById("gold");
  const gT=document.getElementById("towns"), gD=document.getElementById("discs"), gFac=document.getElementById("fac");
  [gRide,gGold,gT,gD,gFac].forEach(g=>{ if(g) g.innerHTML=""; });
  placeHits=[];
  if(mode!=="ride" || !PLAN || PLAN===false) return;
  const days=planDays();
  const segs=activeSegs();
  const rideSegs=segs.filter(s=>!isSkipped(s.id));
  rideSegs.forEach(seg=>{
    const pts=seg.line||[];
    if(pts.length<2) return;
    const p=document.createElementNS("http://www.w3.org/2000/svg","polyline");
    p.setAttribute("points", linePts(pts));
    p.setAttribute("fill","none");
    p.setAttribute("stroke-linecap","round");
    p.setAttribute("stroke-linejoin","round");
    p.setAttribute("stroke", friendOn?(BAND[seg.band]||"#f0713f"):"#f0713f");
    p.setAttribute("stroke-width", ink(selSeg===seg.id?3.2:2.1));
    gRide.appendChild(p);
  });
  if(selSeg){
    const s=rideSegs.find(x=>x.id===selSeg);
    if(s&&s.line&&s.line.length>1){
      const p=document.createElementNS("http://www.w3.org/2000/svg","polyline");
      p.setAttribute("points", linePts(s.line));
      p.setAttribute("fill","none"); p.setAttribute("stroke","#1c1916");
      p.setAttribute("stroke-width", ink(3.6)); p.setAttribute("stroke-opacity",".28");
      p.setAttribute("stroke-linecap","round"); p.setAttribute("stroke-linejoin","round");
      gGold.appendChild(p);
    }
  }
  if(selDay){
    const d=days.find(x=>x.n===selDay);
    let line=d && d.line;
    if(!line || !line.length){
      let k0=0, k1=0;
      days.forEach(x=>{ if(x.mode==="train") return; if(x.n<selDay) k0+=x.km; if(x.n<=selDay) k1+=x.km; });
      line=sliceLine(rideSegs, k0, k1);
    }
    if(line && line.length>1){
      const p=document.createElementNS("http://www.w3.org/2000/svg","polyline");
      p.setAttribute("points", linePts(line));
      p.setAttribute("fill","none"); p.setAttribute("stroke","#c9a227");
      p.setAttribute("stroke-width", ink(5.2)); p.setAttribute("stroke-linecap","round"); p.setAttribute("stroke-linejoin","round");
      gGold.appendChild(p);
    }
  }
  const labels=[];
  const c0=rideSegs[0]&&rideSegs[0].cand&&rideSegs[0].cand[0];
  const ends=travelEnds();
  if(selDay){
    const d=days.find(x=>x.n===selDay);
    if(d){
      const a=d.line&&d.line[0];
      if(a) labels.push({name:d.frm, lat:a[0], lon:a[1]});
      labels.push({name:d.to, lat:d.lat, lon:d.lon});
    }
  } else {
    if(c0&&c0.lat!=null) labels.push({name:ends.from, lat:c0.lat, lon:c0.lon});
    else if(rideSegs[0]&&rideSegs[0].line&&rideSegs[0].line[0]) labels.push({name:ends.from, lat:rideSegs[0].line[0][0], lon:rideSegs[0].line[0][1]});
    days.forEach(d=>{ if(d.mode==="train") return; if(d.lat!=null) labels.push({name:d.to, lat:d.lat, lon:d.lon}); });
  }
  const off=ink(8);
  labels.forEach(t=>{
    if(t.lat==null || t.lon==null) return;
    const q=xy(t.lat,t.lon);
    const hit={kind:"town", name:showName(t.name), lat:t.lat, lon:t.lon, sub:"town on the route", x:q[0], y:q[1]};
    placeHits.push(hit);
    const disc=document.createElementNS("http://www.w3.org/2000/svg","circle");
    disc.setAttribute("cx", q[0]); disc.setAttribute("cy", q[1]); disc.setAttribute("r", ink(11));
    disc.setAttribute("fill","transparent");
    disc.style.cursor="pointer";
    disc.addEventListener("click",e=>{ e.stopPropagation(); showPlaceCard(hit); });
    const tx=document.createElementNS("http://www.w3.org/2000/svg","text");
    tx.setAttribute("x", q[0]+off); tx.setAttribute("y", q[1]-off);
    tx.setAttribute("class","townlab"); tx.setAttribute("pointer-events","none");
    tx.setAttribute("font-size", ink(9));
    tx.textContent=showName(t.name);
    gT.appendChild(disc);
    gT.appendChild(tx);
  });
  const discR=ink(7);
  days.forEach(d=>{
    if(d.mode==="train" || d.lat==null) return;
    const q=xy(d.lat,d.lon);
    const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx", q[0]); c.setAttribute("cy", q[1]); c.setAttribute("r", discR);
    c.setAttribute("fill", selDay===d.n?"#c9a227":"#f0713f");
    c.style.cursor="pointer";
    c.addEventListener("click",e=>{ e.stopPropagation(); vbManual=false; selSeg=null; openRide(ride.id, selDay===d.n?null:d.n); });
    const tx=document.createElementNS("http://www.w3.org/2000/svg","text");
    tx.setAttribute("x", q[0]); tx.setAttribute("y", q[1]+ink(3.4));
    tx.setAttribute("text-anchor","middle"); tx.setAttribute("font-size", ink(9));
    tx.setAttribute("font-weight","700"); tx.setAttribute("fill","#fff"); tx.setAttribute("pointer-events","none");
    tx.textContent=d.n;
    gD.appendChild(c); gD.appendChild(tx);
  });
  rideSegs.forEach(seg=>{
    const fac=seg.fac||{};
    Object.keys(LCOL).forEach(k=>{
      if(!layersOn[k]) return;
      (fac[k]||[]).forEach(f=>{
        if(f.lat==null||f.lon==null) return;
        const q=xy(f.lat,f.lon);
        const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
        c.setAttribute("cx", q[0]); c.setAttribute("cy", q[1]);         c.setAttribute("r", ink(1.6));
        c.setAttribute("fill", LCOL[k]);
        c.setAttribute("fill-opacity","0.9");
        c.setAttribute("stroke", "#fffdf8");
        c.setAttribute("stroke-width", ink(0.4));
        c.style.cursor="pointer";
        const kindLab={shop:"shop",stay:"beds",bath:"bath",rail:"station",water:"drinking water"}[k]||k;
        const nm=(lang==="local"&&f.nameLocal)?f.nameLocal:(f.name||kindLab);
        const hit={kind:k, name:nm, nameLocal:f.nameLocal||"", lat:f.lat, lon:f.lon,
          sub:kindLab+(f.off!=null?" · "+f.off+" km off the road":""), x:q[0], y:q[1]};
        placeHits.push(hit);
        c.addEventListener("click",e=>{ e.stopPropagation(); showPlaceCard(hit); });
        gFac.appendChild(c);
      });
    });
  });
  renderPlaceCard();
}
function paintMini(){
  const mini=document.getElementById("minimap");
  if(!mini) return;
  const on=mode==="ride" && PLAN && PLAN!==false && !!selDay;
  if(!on){
    mini.setAttribute("hidden","");
    mini.innerHTML="";
    mini.onclick=null;
    return;
  }
  mini.removeAttribute("hidden");
  const days=planDays();
  const today=days.find(d=>d.n===selDay);
  const segs=activeSegs().filter(s=>!isSkipped(s.id));
  const all=[];
  segs.forEach(s=>(s.line||[]).forEach(p=>all.push(p)));
  if(all.length<2){ mini.setAttribute("hidden",""); mini.innerHTML=""; return; }
  const xypts=all.map(p=>xy(p[0],p[1]));
  let x0=Math.min(...xypts.map(p=>p[0])), x1=Math.max(...xypts.map(p=>p[0]));
  let y0=Math.min(...xypts.map(p=>p[1])), y1=Math.max(...xypts.map(p=>p[1]));
  let w=Math.max(x1-x0, 12), h=Math.max(y1-y0, 12);
  const ar=180/120;
  if(w/h<ar) w=h*ar; else h=w/ar;
  const pad=Math.max(w,h)*0.08;
  w+=pad*2; h+=pad*2;
  const cx=(x0+x1)/2, cy=(y0+y1)/2;
  const vb=[cx-w/2, cy-h/2, w, h];
  mini.setAttribute("viewBox", vb.map(n=>n.toFixed(1)).join(" "));
  mini.innerHTML="";
  const bg=document.createElementNS("http://www.w3.org/2000/svg","rect");
  bg.setAttribute("x", vb[0].toFixed(1)); bg.setAttribute("y", vb[1].toFixed(1));
  bg.setAttribute("width", vb[2].toFixed(1)); bg.setAttribute("height", vb[3].toFixed(1));
  bg.setAttribute("fill", "#efe8dc");
  mini.appendChild(bg);
  const sw=Math.max(vb[2], vb[3])/90;
  segs.forEach(seg=>{
    if(!seg.line||seg.line.length<2) return;
    const p=document.createElementNS("http://www.w3.org/2000/svg","polyline");
    p.setAttribute("points", linePts(seg.line));
    p.setAttribute("fill","none"); p.setAttribute("stroke","#f0713f");
    p.setAttribute("stroke-width", sw.toFixed(2));
    p.setAttribute("stroke-linecap","round"); p.setAttribute("stroke-linejoin","round");
    p.setAttribute("pointer-events","none");
    mini.appendChild(p);
  });
  let dayLine=today && today.line;
  if((!dayLine||dayLine.length<2) && today){
    let k0=0,k1=0;
    days.forEach(x=>{ if(x.mode==="train") return; if(x.n<selDay) k0+=x.km; if(x.n<=selDay) k1+=x.km; });
    dayLine=sliceLine(segs, k0, k1);
  }
  if(dayLine&&dayLine.length>1){
    const p=document.createElementNS("http://www.w3.org/2000/svg","polyline");
    p.setAttribute("points", linePts(dayLine));
    p.setAttribute("fill","none"); p.setAttribute("stroke","#c9a227");
    p.setAttribute("stroke-width", (sw*1.8).toFixed(2));
    p.setAttribute("stroke-linecap","round"); p.setAttribute("stroke-linejoin","round");
    p.setAttribute("pointer-events","none");
    mini.appendChild(p);
  }
  const map=document.getElementById("map");
  const mvb=(map&&map.getAttribute("viewBox")||VB0).split(/\s+/).map(Number);
  if(mvb.length===4 && mvb[2]>0 && mvb[3]>0){
    const r=document.createElementNS("http://www.w3.org/2000/svg","rect");
    r.setAttribute("x", mvb[0]); r.setAttribute("y", mvb[1]);
    r.setAttribute("width", mvb[2]); r.setAttribute("height", mvb[3]);
    r.setAttribute("fill","none"); r.setAttribute("stroke","#1c1916");
    r.setAttribute("stroke-width", (sw*0.7).toFixed(2));
    r.setAttribute("stroke-opacity",".55");
    r.setAttribute("pointer-events","none");
    mini.appendChild(r);
  }
  mini.onclick=()=>{ vbManual=false; selSeg=null; openRide(ride.id, null); };
}
function gpxFor(days){
  let g='<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="bikeplanner"><metadata><name>'+PLAN.name+'</name></metadata>';
  let off=0;
  days.forEach(d=>{
    if(d.mode==="train") return;
    const line=(d.line&&d.line.length)?d.line:sliceLine(activeSegs().filter(s=>!isSkipped(s.id)), off, off+d.km);
    off+=d.km;
    g+='<trk><name>Day '+d.n+': '+d.frm+' → '+d.to+'</name><trkseg>';
    (line||[]).forEach(p=>{ g+='<trkpt lat="'+p[0]+'" lon="'+p[1]+'"/>'; });
    g+='</trkseg></trk>';
  });
  return g+'</gpx>';
}
function csvFor(days){
  const rows=[["day","from","to","mode","km","climb_m","effort","shops","beds","baths","stations"]];
  days.forEach(d=>rows.push([d.n||"",d.frm,d.to,d.mode||"ride",d.km,d.climb||0,d.eff||"",d.shop||0,d.stay||0,d.bath||0,d.rail||0]));
  return rows.map(r=>r.join(",")).join("\n");
}
function download(name, text, mime){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([text],{type:mime}));
  a.download=name;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 800);
}
function drawProfile(days){
  const g=document.getElementById("prof"); if(!g) return;
  g.innerHTML="";
  const W=300,H=56;
  if(days && days.length===1 && days[0].prof && days[0].prof.length>1){
    const d=days[0];
    const pts=d.prof;
    let tot=d.km||0, lo=Infinity, hi=-Infinity;
    pts.forEach(q=>{ lo=Math.min(lo,q[1]); hi=Math.max(hi,q[1]); });
    if(!(tot>0 && hi>lo)) return;
    const span=Math.max(hi-lo,80); lo=Math.max(0,hi-span);
    const dstr=pts.map(q=>(q[0]/tot*W).toFixed(1)+","+(4+(1-(q[1]-lo)/span)*(H-12)).toFixed(1)).join(" ");
    const f=document.createElementNS("http://www.w3.org/2000/svg","polyline");
    f.setAttribute("points","0,"+H+" "+dstr+" "+W+","+H); f.setAttribute("fill","#c9a227"); f.setAttribute("fill-opacity",".22"); g.appendChild(f);
    const l=document.createElementNS("http://www.w3.org/2000/svg","polyline");
    l.setAttribute("points",dstr); l.setAttribute("fill","none"); l.setAttribute("stroke","#c9a227"); l.setAttribute("stroke-width","1.4"); g.appendChild(l);
    const hiEl=document.getElementById("profhi"), loEl=document.getElementById("proflo");
    if(hiEl) hiEl.textContent="▲ "+Math.round(hi).toLocaleString()+" m";
    if(loEl) loEl.textContent="▼ "+Math.round(lo).toLocaleString()+" m";
    return;
  }
  const pts=[]; let tot=0, lo=Infinity, hi=-Infinity;
  activeSegs().filter(s=>!isSkipped(s.id)).forEach(s=>{
    (s.prof||[]).forEach(q=>{ pts.push([tot+q[0], q[1]]); lo=Math.min(lo,q[1]); hi=Math.max(hi,q[1]); });
    tot+=s.km;
  });
  if(!(tot>0 && hi>lo && pts.length>1)) return;
  const span=Math.max(hi-lo,150); lo=Math.max(0,hi-span);
  let off=0;
  days.forEach((d,i)=>{
    const w=d.km/tot*W;
    const r=document.createElementNS("http://www.w3.org/2000/svg","rect");
    r.setAttribute("x",off); r.setAttribute("y",0); r.setAttribute("width",w); r.setAttribute("height",H);
    r.setAttribute("fill", selDay===d.n?"#e8d7a4":(i%2?"#efe8dc":"#e7dfd2"));
    r.style.cursor="pointer";
    r.addEventListener("click",()=>openRide(ride.id, selDay===d.n?null:d.n));
    g.appendChild(r);
    if(w>16){ const t=document.createElementNS("http://www.w3.org/2000/svg","text");
      t.setAttribute("x",off+3); t.setAttribute("y",H-5); t.setAttribute("font-size","9"); t.setAttribute("fill","#6f675e"); t.textContent=d.n; g.appendChild(t); }
    off+=w;
  });
  const d=pts.map(q=>(q[0]/tot*W).toFixed(1)+","+(4+(1-(q[1]-lo)/span)*(H-12)).toFixed(1)).join(" ");
  const f=document.createElementNS("http://www.w3.org/2000/svg","polyline");
  f.setAttribute("points","0,"+H+" "+d+" "+W+","+H); f.setAttribute("fill","#f0713f"); f.setAttribute("fill-opacity",".2"); g.appendChild(f);
  const l=document.createElementNS("http://www.w3.org/2000/svg","polyline");
  l.setAttribute("points",d); l.setAttribute("fill","none"); l.setAttribute("stroke","#f0713f"); l.setAttribute("stroke-width","1.3"); g.appendChild(l);
  const hiEl=document.getElementById("profhi"), loEl=document.getElementById("proflo");
  if(hiEl) hiEl.textContent="▲ "+Math.round(hi).toLocaleString()+" m";
  if(loEl) loEl.textContent="▼ "+Math.round(lo).toLocaleString()+" m";
}
function plannerSheet(t){
  const col=document.getElementById("col");
  const st=rideStats();
  const d0=grade(st.km, st.asc);
  const days=planDays();
  const rideDays=days.filter(d=>d.mode!=="train");
  const ends=travelEnds();
  const rng=(PLAN.vehicles&&PLAN.vehicles.targetRange||{})[veh]||[55,300];
  const kmDay=rideDays.length?Math.round(st.km/rideDays.length):st.km;
  const onDay=!!selDay;
  const today=rideDays.find(d=>d.n===selDay);
  const todayPh=today?dayPhotos(today.to):[];
  const filmHtml=rideDays.map(d=>`<button type="button" class="tile" data-day="${d.n}">
      <span class="tile-n">${d.n}</span>
      <span class="tile-who">${d.frm} → ${d.to}</span>
      <span class="tile-km">${d.km} km · ${Math.round(d.eff||0)} eff</span>
      ${d.prof&&d.prof.length>1?`<svg class="spark" viewBox="0 0 300 26" preserveAspectRatio="none">${sparkPoly(d)}</svg>`:""}
    </button>`).join("");
  document.getElementById("head").innerHTML="";
  col.className="sheet";
  col.innerHTML=onDay?`
    <div class="daybar hit" id="daybar">
      <button type="button" class="opt" id="alldays">All days</button>
      <button type="button" class="opt" id="prevday" ${selDay<=1?"disabled":""}>‹</button>
      <span>Day ${selDay} of ${rideDays.length} · ${today?today.frm+" → "+today.to:ends.from+" → "+ends.to}</span>
      <button type="button" class="opt" id="nextday" ${selDay>=rideDays.length?"disabled":""}>›</button>
    </div>
    <aside class="ctx-card hit" id="ctx">
      <div class="tn"><span class="badge">${today?today.n:selDay}</span><h2>${today?today.frm+" → "+today.to:t.name}</h2></div>
      <div class="stats4">
        <div><b>${today?today.km:"—"}</b><span>km today</span></div>
        <div><b>${today?Math.round(today.climb||today.eff||0).toLocaleString():"—"}</b><span>m / effort</span></div>
        <div><b>${today?today.stay||0:0}</b><span>beds</span></div>
        <div><b>${today?today.shop||0:0}</b><span>shops</span></div>
      </div>
      <div class="profwrap">
        <svg viewBox="0 0 300 56" preserveAspectRatio="none"><g id="prof"></g></svg>
        <div class="profhi" id="profhi"></div><div class="proflo" id="proflo"></div>
      </div>
      <div class="dayfacts">${today?`<b>${today.shop||0}</b> shops · <b>${today.stay||0}</b> beds · <b>${today.bath||0}</b> baths · <b>${today.rail||0}</b> stations`:""}</div>
      <div class="phs" id="dayph">${todayPh.map(src=>`<div style="background-image:url('${src}')"></div>`).join("")}</div>
      <div class="export"><div class="row">
        <button class="opt" id="gpx">GPX today</button>
        <button class="opt" id="pdf">Print</button>
        <button class="opt" id="copylink">Copy link</button>
        <span class="ghost" id="expnote"></span>
      </div></div>
    </aside>
    <div id="strip" hidden></div><div id="segcard" hidden></div>
    <select id="start" hidden></select><select id="end" hidden></select>
    <div id="dirrow" hidden></div><div id="forks" hidden></div><div id="forks-off" hidden></div>
    <div id="skips" hidden></div><div id="days" hidden></div>
    <input id="eff" type="hidden" value="${effort}"><input id="dtar" type="hidden" value="${dtar}">
    <span id="slv" hidden></span><span id="dlv" hidden></span><span id="vehnote" hidden></span>
        <button type="button" id="friendtog" hidden></button><button type="button" id="signedtog" hidden></button><button type="button" id="csv" hidden></button>
    <span id="warn" hidden></span>
    <details id="netforks" hidden></details>`:`
    <aside class="ctx-card hit" id="ctx">
      <div class="tn"><span class="badge">${t.num}</span><h2>${t.name}</h2>
        <span class="dl dl${d0}">${DNAME[d0]}</span></div>
      <p class="oneline">${ends.from} → ${ends.to} · ${rideDays.length} d · ${st.km} km · ${st.asc.toLocaleString()} m</p>
      <div class="profwrap">
        <svg viewBox="0 0 300 56" preserveAspectRatio="none"><g id="prof"></g></svg>
        <div class="profhi" id="profhi"></div><div class="proflo" id="proflo"></div>
      </div>
      <div class="strip" id="strip" title="Click a colour band"></div>
      <button type="button" id="friendtog" class="${friendOn?"on":""}">colour the map line</button>
      <details class="edittrip">
        <summary>Edit trip</summary>
        <div class="ends">
          <label>From <select id="start"></select></label>
          <label>To <select id="end"></select></label>
        </div>
        <div id="dirrow"></div>
        <div class="slgrid">
          <div>
            <div class="slrow"><span>Daily effort</span><span><b id="slv">${effort}</b> (~${kmDay} km/day)</span></div>
            <input class="effort" id="eff" type="range" min="${rng[0]}" max="${rng[1]}" step="5" value="${effort}">
          </div>
          <div>
            <div class="slrow"><span>Days I have</span><span id="dlv">${dtar?dtar+" days":"no limit"}</span></div>
            <input class="effort" id="dtar" type="range" min="0" max="60" step="1" value="${dtar}">
          </div>
        </div>
        <div class="row" id="skips"></div>
        <p id="warn">${skipWarn?skipWarn:""}</p>
        <p class="ghost" id="vehnote"></p>
        <button type="button" id="signedtog" class="${preferSigned?"on":""}" ${((PLAN.segs||[]).concat(PLAN.altSegs||[]).some(s=>s.signedAlt))?"":"hidden"}>Prefer signed cycle routes</button>
        <p class="ghost" id="signednote"></p>
        <p class="forkq">${forkSummary()}</p>
        <div id="forks"></div>
        <details class="netforks" id="netforks" hidden><summary>Other forks</summary><div id="forks-off"></div></details>
      </details>
      <div class="segcard" id="segcard" hidden></div>
      <div class="export"><div class="row">
        <button class="opt" id="gpx">GPX</button>
        <button class="opt" id="csv">CSV</button>
        <button class="opt" id="pdf">Print</button>
        <button class="opt" id="copylink">Copy link</button>
        <span class="ghost" id="expnote"></span>
      </div></div>
    </aside>
    <div class="filmwrap hit" id="filmwrap">
      <button type="button" class="film-nav" id="filmprev" aria-label="Previous day">‹</button>
      <div class="film-track" id="film">${filmHtml}</div>
      <button type="button" class="film-nav" id="filmnext" aria-label="Next day">›</button>
    </div>
    <div id="days" hidden></div>`;
    drawProfile(onDay && today ? [today] : rideDays);
  const strip=document.getElementById("strip");
  if(strip && !strip.hidden){
    activeSegs().forEach(s=>{
      if(isSkipped(s.id)) return;
      const i=document.createElement("i");
      i.style.flexGrow=Math.max(s.km,1);
      i.style.background=BAND[s.band]||"#c4b8a8";
      i.dataset.seg=s.id;
      i.classList.toggle("sel", selSeg===s.id);
      i.title=showName(s.frmName)+" → "+showName(s.toName)+" · "+Math.round(s.km)+" km · signed "+Math.round(s.signed||0)+"% · busy "+Math.round(s.busy||0)+"%";
      i.onclick=e=>{ e.stopPropagation(); selectSeg(s); };
      strip.appendChild(i);
    });
  }
  if(selSeg) renderSegCard(activeSegs().find(s=>s.id===selSeg));
  const towns=chainTowns();
  const startSel=document.getElementById("start"), endSel=document.getElementById("end");
  const loop=!!PLAN && PLAN.start===PLAN.end;
  towns.forEach((tn,i)=>{
    const o=document.createElement("option"); o.value=tn.id; o.textContent=showName(tn);
    if(tn.id===startId) o.selected=true;
    if(i<towns.length-1 || loop) startSel.appendChild(o);
  });
  towns.forEach((tn,i)=>{
    if(i===0 && !loop) return;
    const o=document.createElement("option"); o.value=tn.id; o.textContent=showName(tn);
    if(tn.id===endId) o.selected=true;
    endSel.appendChild(o);
  });
  startSel.onchange=()=>{
    startId=startSel.value;
    const i0=towns.findIndex(x=>x.id===startId), i1=towns.findIndex(x=>x.id===endId);
    if(i1<i0 || (i1===i0 && !loop)) endId=towns[towns.length-1].id;
    selDay=null; selSeg=null; vbManual=false; skipCache=null; draw();
  };
  endSel.onchange=()=>{
    endId=endSel.value;
    const i0=towns.findIndex(x=>x.id===startId), i1=towns.findIndex(x=>x.id===endId);
    if(i1<i0 || (i1===i0 && !loop)) startId=towns[0].id;
    selDay=null; selSeg=null; vbManual=false; skipCache=null; draw();
  };
  const dirrow=document.getElementById("dirrow");
  if(dirrow && !dirrow.hidden){
    const off=peekDir(!reversed);
    [[true, ends.from, ends.to, st.asc, rideDays.length], [false, ends.to, ends.from, off.asc, off.days]].forEach(row=>{
      const b=document.createElement("button");
      b.type="button";
      const on=row[0];
      b.className="opt"+(on?" on":"");
      b.textContent=row[1]+" → "+row[2]+" · ↑"+Math.round(row[3]||0).toLocaleString()+" m · "+row[4]+" d";
      b.title=on?"the direction you are planning":"ride it the other way";
      if(!on) b.onclick=()=>{
        const tmp=startId; startId=endId; endId=tmp;
        reversed=!reversed; selDay=null; selSeg=null; vbManual=false; skipCache=null; draw();
      };
      dirrow.appendChild(b);
    });
  }
  document.getElementById("eff").oninput=e=>{ document.getElementById("slv").textContent=e.target.value; };
  document.getElementById("eff").onchange=e=>{ effort=+e.target.value; selDay=null; skipCache=null; draw(); };
  document.getElementById("dtar").oninput=e=>{ document.getElementById("dlv").textContent=+e.target.value?e.target.value+" days":"no limit"; };
  document.getElementById("dtar").onchange=e=>{ dtar=+e.target.value; selDay=null; skipCache=null; draw(); };
  const skipBox=document.getElementById("skips");
  skipBox.innerHTML="";
  const stt=skipState();
  const book=segBook();
  const showHops=dtar>0 || Object.keys(skipOn).length>0;
  if(showHops && stt.cands.length){
  stt.cands.forEach(id=>{
    const s=book[id]; if(!s) return;
    const b=document.createElement("button");
    const auto=!!stt.auto[id] && !stt.on[id];
    const on=!!(stt.on[id]||stt.auto[id]);
    b.type="button";
    b.className="opt train"+(on?" on":"")+(auto?" auto":"");
    b.dataset.id=id;
    b.textContent=showName(s.frmName||s.frm)+" → "+showName(s.toName||s.to)+" · "+Math.round(s.km)+" km";
    b.title=stt.on[id]?"kept by you":auto?"proposed — click to refuse":"click to take the train here";
    b.onclick=()=>{
      if(on){ if(skipOn[id]){ delete skipOn[id]; skipOff[id]=1; } else skipOff[id]=1; }
      else { delete skipOff[id]; skipOn[id]=1; }
      skipCache=null; selDay=null; vbManual=false; draw();
    };
    skipBox.appendChild(b);
  });
  }
  const vnote=document.getElementById("vehnote");
  vnote.textContent=veh==="opium"?"S-pedelec mode: a day is distance only (no climb penalty).":
    veh==="ebike"?"E-bike mode: same roads as the bicycle, climbing counts a third, days capped at one battery.":"";
  document.getElementById("friendtog").onclick=()=>{
    friendOn=!friendOn;
    try{ localStorage.setItem("friend", friendOn?"1":"0"); }catch(e){}
    document.getElementById("friendtog").classList.toggle("on", friendOn);
    paint();
  };
  const signedTog=document.getElementById("signedtog");
  const signedNote=document.getElementById("signednote");
  if(signedTog && !onDay){
    const n=((PLAN.segs||[]).concat(PLAN.altSegs||[])).filter(s=>s.signedAlt).length;
    signedTog.hidden=!n || veh==="opium";
    if(signedNote) signedNote.textContent=signedTog.hidden?"":signedNoteText();
    signedTog.onclick=()=>{
      preferSigned=!preferSigned;
      try{ localStorage.setItem("signed", preferSigned?"1":"0"); }catch(e){}
      skipCache=null; selDay=null; vbManual=false; draw();
    };
  }
  const warnEl=document.getElementById("warn");
  if(warnEl && !onDay) warnEl.textContent=skipWarn||"";
  document.getElementById("gpx").onclick=()=>{
    const pack=onDay && today ? [today] : rideDays;
    const name=onDay && today ? (PLAN.id||"ride")+"-day"+today.n+".gpx" : (PLAN.id||"ride")+".gpx";
    download(name, gpxFor(pack), "application/gpx+xml");
    document.getElementById("expnote").textContent=onDay?"GPX for today downloaded.":"GPX downloaded.";
  };
  const csvBtn=document.getElementById("csv");
  if(csvBtn) csvBtn.onclick=()=>{ download((PLAN.id||"ride")+"-days.csv", csvFor(days), "text/csv"); document.getElementById("expnote").textContent="CSV downloaded."; };
  document.getElementById("pdf").onclick=()=>window.print();
  document.getElementById("copylink").onclick=()=>{
    const url=location.href;
    const done=()=>{ document.getElementById("expnote").textContent="Link copied."; };
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done).catch(()=>{ window.prompt("Copy this link", url); done(); });
    else { window.prompt("Copy this link", url); done(); }
  };
  document.querySelectorAll(".foldhead").forEach(b=>b.onclick=()=>{
    const id=b.dataset.fold;
    b.parentElement.classList.toggle("closed");
    folds[id]=!b.parentElement.classList.contains("closed");
    try{ localStorage.setItem("fold:fold-"+id, folds[id]?"1":"0"); }catch(e){}
  });
  const fb=document.getElementById("forks");
  const fbOff=document.getElementById("forks-off");
  const onNodes=new Set();
  chainSegs().forEach(s=>{ onNodes.add(s.frm); onNodes.add(s.to); });
  const forkByNode={};
  (PLAN.forks||[]).forEach(f=>forkByNode[f.node]=f);
  const list=(PLAN.networkForks&&PLAN.networkForks.length)?PLAN.networkForks:(PLAN.forks||[]).map(f=>({node:f.node, prompt:f.prompt||("At "+f.name), on:true, options:f.options}));
  let offN=0;
  list.forEach(nf=>{
    const live=forkByNode[nf.node];
    const onJourney=onNodes.has(nf.node);
    const dest=onJourney?fb:fbOff;
    if(!dest) return;
    const q=document.createElement("div"); q.className="forkq"; q.textContent=nf.prompt||("At "+showName(nf.node));
    dest.appendChild(q);
    const row=document.createElement("div"); row.className="row";
    const pick=live?(picks[nf.node]||live.pick||(live.options[0]&&live.options[0].id)):null;
    (nf.options||[]).forEach(o=>{
      const b=document.createElement("button");
      b.type="button";
      b.className="opt"+(live&&o.id===pick?" on":"");
      const dot=document.createElement("span");
      dot.className="fdot";
      dot.style.background=BAND[o.band]||"#c4b8a8";
      b.appendChild(dot);
      b.appendChild(document.createTextNode(o.label));
      if(live && onJourney && PLAN.alts && PLAN.alts[live.node+":"+o.id]){
        b.onclick=()=>{
          picks[nf.node]=o.id;
          const towns=chainTowns();
          if(!towns.some(x=>x.id===startId)) startId=towns[0]&&towns[0].id;
          if(!towns.some(x=>x.id===endId)) endId=towns[towns.length-1]&&towns[towns.length-1].id;
          selDay=null; selSeg=null; vbManual=false; skipCache=null; draw();
        };
      } else {
        b.disabled=true;
      }
      row.appendChild(b);
    });
    dest.appendChild(row);
    if(!onJourney){
      offN++;
      const off=document.createElement("div"); off.className="forkoff"; off.textContent="not on the current journey";
      dest.appendChild(off);
    }
  });
  const net=document.getElementById("netforks");
  if(net){ net.hidden=onDay || !offN; }
  const film=document.getElementById("film");
  if(film){
    film.querySelectorAll(".tile").forEach(btn=>{
      btn.onclick=()=>{ vbManual=false; selSeg=null; openRide(ride.id, Number(btn.dataset.day)); };
    });
    const prev=document.getElementById("filmprev");
    const next=document.getElementById("filmnext");
    if(prev) prev.onclick=()=>filmStep(-1);
    if(next) next.onclick=()=>filmStep(1);
    filmFocus=Math.min(Math.max(1, filmFocus||1), rideDays.length||1);
    syncFilm();
  }
  const alldays=document.getElementById("alldays");
  if(alldays) alldays.onclick=()=>{ vbManual=false; selSeg=null; openRide(ride.id, null); };
  const prevd=document.getElementById("prevday");
  if(prevd) prevd.onclick=()=>{ if(selDay>1){ vbManual=false; selSeg=null; openRide(ride.id, selDay-1); } };
  const nextd=document.getElementById("nextday");
  if(nextd) nextd.onclick=()=>{ if(selDay<rideDays.length){ vbManual=false; selSeg=null; openRide(ride.id, selDay+1); } };
}
function selectSeg(s){
  if(!s){ selSeg=null; const c=document.getElementById("segcard"); if(c) c.hidden=true; vbManual=false; paint(); return; }
  if(selSeg===s.id){ selectSeg(null); return; }
  selSeg=s.id; selDay=null; vbManual=false;
  renderSegCard(s);
  paint();
}
function renderSegCard(s){
  const c=document.getElementById("segcard"); if(!c||!s) return;
  const fac=s.fac||{};
  const shops=(fac.shop||[]).length||s.shop||0;
  const beds=(fac.stay||[]).length||s.stay||0;
  const sights=typeof s.sights==="number"?s.sights:0;
  const r=Math.round(s.signed||0), bsy=Math.round(s.busy||0);
  c.hidden=false;
  c.innerHTML=`<div class="schead"><b>${showName(s.frmName||s.frm)} → ${showName(s.toName||s.to)}</b><button type="button" class="scx" title="close">×</button></div>
    <div class="scmeta">${Math.round(s.km)} km · ${Math.round(s.ascent||0)} m climb</div>
    <div class="scbar"><i style="width:${r}%;background:#97C459"></i><i style="width:${bsy}%;background:#E24B4A"></i></div>
    <div class="scmeta">signed ${r}% · busy ${bsy}% · ${shops} shops · ${beds} beds · ${sights} sights</div>
    <div class="scbtns"><button class="opt" id="sHere">start here</button><button class="opt" id="eHere">end here</button></div>`;
  c.querySelector(".scx").onclick=e=>{ e.stopPropagation(); selectSeg(null); };
  c.querySelector("#sHere").onclick=()=>{ startId=s.frm; selSeg=null; selDay=null; vbManual=false; skipCache=null; draw(); };
  c.querySelector("#eHere").onclick=()=>{ endId=s.to; selSeg=null; selDay=null; vbManual=false; skipCache=null; draw(); };
}
function filmStep(dir){
  const n=planDays().filter(d=>d.mode!=="train").length;
  if(!n) return;
  const next=Math.min(Math.max(1, (filmFocus||1)+dir), n);
  if(next===filmFocus) return;
  filmFocus=next;
  syncFilm();
}
function syncFilm(){
  const film=document.getElementById("film");
  if(!film) return;
  const n=planDays().filter(d=>d.mode!=="train").length;
  filmFocus=Math.min(Math.max(1, filmFocus||1), n||1);
  let on=null;
  film.querySelectorAll(".tile").forEach(b=>{
    const num=+b.dataset.day;
    const is=!!n && num===filmFocus;
    b.classList.toggle("on", is);
    if(is) on=b;
  });
  if(on){
    const left=on.offsetLeft-(film.clientWidth-on.offsetWidth)/2;
    film.scrollTo({left:Math.max(0,left), behavior:"smooth"});
  }
  const prev=document.getElementById("filmprev");
  const next=document.getElementById("filmnext");
  if(prev) prev.disabled=filmFocus<=1;
  if(next) next.disabled=!n || filmFocus>=n;
}
function sparkPoly(d){
  if(!d.prof||d.prof.length<2||!d.km) return "";
  const W=300,H=26, mx=Math.max.apply(null,d.prof.map(p=>p[1])), top=Math.max(100,mx);
  const pts=d.prof.map(p=>(p[0]/d.km*W).toFixed(1)+","+(H-2-(p[1]/top)*(H-6)).toFixed(1)).join(" ");
  return `<polyline points="0,${H-2} ${pts} ${W},${H-2}" fill="#f0713f" fill-opacity=".18" stroke="none"/>
    <polyline points="${pts}" fill="none" stroke="#f0713f" stroke-width="1.2"/>`;
}

function sheet(){
  const head=document.getElementById("head");
  const col=document.getElementById("col");
  const plannerOn=mode==="ride" && PLAN && PLAN!==false && PLAN.id===ride.id;
  document.documentElement.classList.toggle("planner", plannerOn);
  document.body.classList.toggle("planner", plannerOn);
  document.body.classList.toggle("onday", plannerOn && !!selDay);
  if(mode==="network"){
    col.className="";
    const n=visible().length;
    head.innerHTML=`<a class="back" href="hub.html">‹ Where to ride</a>
      <p class="kicker">${PAPER.kicker(TRIPS.length)}</p>
      <h1>${PAPER.title}</h1>
      <p class="lede">${PAPER.lede}</p>
      <div class="chips" id="filters"></div>`;
    filterChips().forEach(([k,lab])=>{
      const b=document.createElement("button"); b.className="chip"+(filter===k?" on":""); b.textContent=lab;
      b.onclick=()=>{ filter=k; if(pick && !visible().some(t=>t.id===pick)) pick=null; draw(); };
      document.getElementById("filters").appendChild(b);
    });
    col.innerHTML=`<p class="tm" style="margin:0 0 10px">${n} trip${n===1?"":"s"}</p><div id="cards"></div>
      <p class="note">${PAPER.note}</p>`;
    const box=document.getElementById("cards");
    visible().sort((a,b)=>(a.top||99)-(b.top||99)).forEach(t=>{
      const g=geo(t), d=grade(g.km,g.asc);
      const el=document.createElement("div");
      el.className="tcard"+((hover||pick)===t.id?" hl":"");
      el.dataset.id=t.id;
      el.innerHTML=`<div class="ph" style="background-image:url('${photo(t)}')"></div>
        <div class="b"><div class="tn"><span class="badge">${t.num}</span><h2>${t.name}</h2>
        <span class="dl dl${d}">${DNAME[d]}</span>${t.top?`<span class="top">${topLabel(t.top)}</span>`:""}</div>
        ${t.why?`<div class="why">${t.why}</div>`:""}
        <div class="tm">${t.sub} · ${g.km||"—"} km · ${(g.asc||0).toLocaleString()} m · ~${daysEst(g)} days</div>
        <button type="button" class="open-tour">Open tour</button></div>`;
      el.onmouseenter=()=>setHover(t.id);
      el.onmouseleave=()=>setHover(null);
      el.onclick=e=>{
        if(e.target.closest(".open-tour")) return;
        focusTrip(t.id);
      };
      el.ondblclick=()=>openRide(t.id);
      el.querySelector(".open-tour").onclick=e=>{ e.stopPropagation(); openRide(t.id); };
      box.appendChild(el);
    });
  } else {
    const t=ride, g=geo(t), d=grade(g.km,g.asc);
    if(PLAN && PLAN.id===t.id){
      plannerSheet(t);
    } else if(PLAN===false){
      col.className="";
      head.innerHTML=`<button class="back" id="up">‹ All trips</button>
        <p class="kicker">Your tour, planned</p>
        <h1>${t.name}</h1>
        <p class="lede">${t.sub}${t.why?" · "+t.why:""}</p>`;
      document.getElementById("up").onclick=goNetwork;
      col.innerHTML=`
        <div class="tn" style="margin-bottom:8px"><span class="badge">${t.num}</span>
          <span class="dl dl${d}">${DNAME[d]}</span>${t.top?`<span class="top">${topLabel(t.top)}</span>`:""}</div>
        <div class="stats">
          <div><b>${daysEst(g)}</b><span>days</span></div>
          <div><b>${g.km||"—"}</b><span>km</span></div>
          <div><b>${(g.asc||0).toLocaleString()}</b><span>m climbed</span></div>
        </div>
        <p class="tm">${(t.tags||[]).join(" · ")}${t.note?" · "+t.note:""}</p>
        <p class="note">The atlas marks this ride. A full tour sheet needs a snapshot from the graph — this trip does not have one in the repo yet.</p>`;
    } else {
      col.className="";
      head.innerHTML=`<button class="back" id="up">‹ All trips</button>
        <p class="kicker">Your tour, planned</p>
        <h1>${t.name}</h1>
        <p class="lede">${t.sub}${t.why?" · "+t.why:""}</p>`;
      document.getElementById("up").onclick=goNetwork;
      col.innerHTML=`<p class="ghost">Loading the ride…</p>`;
    }
  }
}
function hidePlaceCard(){
  placeOpen=null;
  const el=document.getElementById("place");
  if(!el) return;
  el.hidden=true;
  el.innerHTML="";
}
function showPlaceCard(hit){
  if(!hit || hit.lat==null || hit.lon==null) return;
  placeOpen=hit;
  renderPlaceCard();
}
function renderPlaceCard(){
  const el=document.getElementById("place");
  if(!el) return;
  if(mode!=="ride" || !placeOpen){
    el.hidden=true;
    el.innerHTML="";
    return;
  }
  const p=placeOpen;
  const q=xy(p.lat, p.lon);
  p.x=q[0]; p.y=q[1];
  const title=p.name||"Place";
  const other=p.nameLocal && p.nameLocal!==title ? p.nameLocal : "";
  const lat=+p.lat, lon=+p.lon;
  const osmMap="https://www.openstreetmap.org/?mlat="+lat.toFixed(5)+"&mlon="+lon.toFixed(5)+"#map=14/"+lat.toFixed(5)+"/"+lon.toFixed(5);
  const osmSearch="https://www.openstreetmap.org/search?query="+encodeURIComponent(p.nameLocal||p.name||"");
  const ph=(dayPhotos(p.name)||[])[0];
  el.hidden=false;
  el.innerHTML=
    '<button type="button" class="scx" id="placex" title="close">×</button>'+
    (ph?`<div class="placeph" style="background-image:url('${esc(ph)}')"></div>`:"")+
    "<b>"+esc(title)+"</b>"+
    (other?`<div class="ja">${esc(other)}</div>`:"")+
    (p.sub?`<div class="sub">${esc(p.sub)}</div>`:"")+
    '<div class="links">'+
      `<a target="_blank" rel="noopener" href="${osmMap}">OpenStreetMap ↗</a>`+
      (title==="Point on the route"?"":`<a target="_blank" rel="noopener" href="${osmSearch}">Search by name ↗</a>`)+
    "</div>";
  const svg=document.getElementById("map");
  const st=document.getElementById("stage").getBoundingClientRect();
  const r=svg.getBoundingClientRect();
  const vb=(svg.getAttribute("viewBox")||VB0).split(/\s+/).map(Number);
  const px=r.left-st.left+(q[0]-vb[0])/vb[2]*r.width;
  const py=r.top-st.top+(q[1]-vb[1])/vb[3]*r.height;
  el.style.left="0px"; el.style.top="0px";
  const w=el.offsetWidth, h=el.offsetHeight;
  let left=px+14, top=py-h/2;
  if(left+w>st.width-8) left=px-w-14;
  if(left<8) left=8;
  if(top<8) top=8;
  if(top+h>st.height-8) top=st.height-h-8;
  el.style.left=left+"px";
  el.style.top=top+"px";
  const xbtn=document.getElementById("placex");
  if(xbtn) xbtn.onclick=e=>{ e.stopPropagation(); hidePlaceCard(); };
}
function svgPt(clientX, clientY){
  const svg=document.getElementById("map");
  if(!svg.createSVGPoint) return null;
  const pt=svg.createSVGPoint();
  pt.x=clientX; pt.y=clientY;
  const ctm=svg.getScreenCTM();
  if(!ctm) return null;
  const p=pt.matrixTransform(ctm.inverse());
  return [p.x, p.y];
}
function nearestPlace(x, y){
  const svg=document.getElementById("map");
  const r=svg.getBoundingClientRect();
  const vb=(svg.getAttribute("viewBox")||VB0).split(/\s+/).map(Number);
  const slop=16*vb[2]/Math.max(r.width,1);
  let best=null, bd=slop;
  placeHits.forEach(h=>{
    const d=Math.hypot(h.x-x, h.y-y);
    if(d<bd){ bd=d; best=h; }
  });
  return best;
}
function tapMap(e){
  if(mode!=="ride" || !PLAN || PLAN===false) return;
  if(e.target.closest && e.target.closest("#place,#maptools,#maplayers,#mapback,#minimap,.ctx-card,.filmwrap,.daybar")) return;
  const pt=svgPt(e.clientX, e.clientY);
  if(!pt) return;
  const hit=nearestPlace(pt[0], pt[1]);
  if(hit){ showPlaceCard(hit); return; }
  if(selDay){
    const days=planDays();
    const d=days.find(x=>x.n===selDay);
    const line=(d&&d.line)||[];
    const svg=document.getElementById("map");
    const r=svg.getBoundingClientRect();
    const vb=(svg.getAttribute("viewBox")||VB0).split(/\s+/).map(Number);
    const slop=14*vb[2]/Math.max(r.width,1);
    let bp=null, bl=slop;
    for(let i=1;i<line.length;i++){
      const a=xy(line[i-1][0], line[i-1][1]), b=xy(line[i][0], line[i][1]);
      const dx=b[0]-a[0], dy=b[1]-a[1], L2=dx*dx+dy*dy;
      const t=L2?Math.max(0,Math.min(1,((pt[0]-a[0])*dx+(pt[1]-a[1])*dy)/L2)):0;
      const qx=a[0]+t*dx, qy=a[1]+t*dy, dd=Math.hypot(qx-pt[0], qy-pt[1]);
      if(dd<bl){ bl=dd; bp=[qx,qy]; }
    }
    if(bp){
      const ll=fromXY(bp[0], bp[1]);
      showPlaceCard({kind:"point", name:"Point on the route", lat:ll[0], lon:ll[1],
        sub:(d.frm||"")+" → "+(d.to||"")+" · "+ll[0].toFixed(4)+", "+ll[1].toFixed(4)});
      return;
    }
  }
  hidePlaceCard();
}

function pop(){
  const pop=document.getElementById("pop");
  const id=hover||pick;
  if(mode!=="network" || !id){
    pop.style.display="none";
    pop.removeAttribute("href");
    return;
  }
  const t=TRIPS.find(x=>x.id===id); if(!t) return;
  const url=tripHref(t);
  const line=geo(t).line||[]; const pt=line[0]||[46.8,8.2]; const q=xy(pt[0], pt[1]);
  const st=document.getElementById("stage").getBoundingClientRect();
  pop.href=url;
  pop.innerHTML=`<b>${t.num} · ${t.name}</b><div class="tm" style="margin:0">${geo(t).km||""} km · scroll to browse</div><span class="cta">Open the sheet →</span>`;
  pop.style.display="block";
  pop.style.left=Math.min(st.width-250, Math.max(8, q[0]*(st.width/W)-40))+"px";
  pop.style.top=Math.max(8, q[1]*(st.height/H)-24)+"px";
}

const popEl=document.getElementById("pop");
popEl.addEventListener("mouseenter",()=>{ if(hoverClear){ clearTimeout(hoverClear); hoverClear=null; } });
popEl.addEventListener("mouseleave",()=>setHover(null));
document.getElementById("map").addEventListener("click", tapMap);

document.getElementById("mapback").onclick=goNetwork;
document.getElementById("vehbtn").onclick=()=>{
  const i=VEH_ORDER.indexOf(veh);
  setVeh(VEH_ORDER[(i+1)%VEH_ORDER.length]);
};
document.getElementById("langbtn").onclick=()=>{ lang=lang==="local"?"en":"local"; draw(); };
document.getElementById("fitbtn").onclick=()=>{
  selDay=null; selSeg=null; vbManual=false;
  if(ride) openRide(ride.id, null);
  else applyView();
};
document.getElementById("zin").onclick=()=>bumpZoom(0.78);
document.getElementById("zout").onclick=()=>bumpZoom(1.22);
document.getElementById("maplayers").addEventListener("click", e=>{
  const b=e.target.closest("button[data-l]"); if(!b) return;
  layersOn[b.dataset.l]=!layersOn[b.dataset.l];
  paint();
});

function typingIn(e){
  const t=e.target;
  if(!t) return false;
  const tag=(t.tagName||"").toLowerCase();
  return tag==="input"||tag==="select"||tag==="textarea"||t.isContentEditable;
}
let wheelLock=0;
document.getElementById("stage").addEventListener("wheel", e=>{
  if(mode!=="network") return;
  if(Math.abs(e.deltaY)<2 && Math.abs(e.deltaX)<2) return;
  e.preventDefault();
  if(Date.now()<wheelLock) return;
  wheelLock=Date.now()+160;
  const d=Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX;
  cycleGallery(d>0?1:-1);
}, {passive:false});
document.addEventListener("keydown",e=>{
  if(typingIn(e)) return;
  if(e.key==="Escape"){
    if(placeOpen){ e.preventDefault(); hidePlaceCard(); return; }
    if(mode==="network") return;
    e.preventDefault();
    if(selDay && ride) openRide(ride.id, null);
    else goNetwork();
    return;
  }
  if(mode==="network"){
    if(e.key==="ArrowUp"){ e.preventDefault(); cycleGallery(-1); }
    else if(e.key==="ArrowDown"){ e.preventDefault(); cycleGallery(1); }
    else if(e.key==="Enter"){
      const tag=(e.target.tagName||"").toLowerCase();
      if(tag==="button"||tag==="a"||tag==="summary") return;
      const id=hover||pick;
      if(id){ e.preventDefault(); openRide(id); }
    }
    return;
  }
  if(mode==="ride" && PLAN && PLAN!==false){
    if(e.key==="ArrowLeft"){
      e.preventDefault();
      if(selDay){ if(selDay>1){ vbManual=false; selSeg=null; openRide(ride.id, selDay-1); } }
      else filmStep(-1);
    } else if(e.key==="ArrowRight"){
      e.preventDefault();
      if(selDay){
        const n=planDays().filter(d=>d.mode!=="train").length;
        if(selDay<n){ vbManual=false; selSeg=null; openRide(ride.id, selDay+1); }
      } else filmStep(1);
    }
  }
});
window.addEventListener("hashchange", applyHash);

Promise.all([
  fetch(PAPER.tripsUrl).then(r=>r.json()),
  PAPER.landUrl?fetch(PAPER.landUrl).then(r=>r.ok?r.json():{features:[]}):Promise.resolve({features:[]}),
  PAPER.waterUrl?fetch(PAPER.waterUrl).then(r=>r.ok?r.json():{features:[]}):Promise.resolve({features:[]}),
  PAPER.atlasUrl?fetch(PAPER.atlasUrl).then(r=>r.ok?r.json():{features:[]}):Promise.resolve({features:[]}),
  PAPER.photosUrl?fetch(PAPER.photosUrl).then(r=>r.ok?r.json():null).catch(()=>null):Promise.resolve(null)
]).then(([trips, land, water, atlas, photos])=>{
  TRIPS=trips.trips||trips;
  if(photos){
    const block=photos[PAPER.id]||photos;
    if(block.trips) Object.assign(PHOTO, block.trips);
    if(block.places) PAPER.places=Object.assign({}, PAPER.places||{}, block.places);
  }
  const foot=document.querySelector("footer");
  if(foot) foot.textContent=PAPER.footer;
  drawBase(land, water, atlas);
  applyHash();
  if(mode==="network") draw();
});

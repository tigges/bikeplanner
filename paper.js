const PAPER=Object.assign({
  id:"switzerland",
  title:"Switzerland by bike",
  country:"Switzerland",
  kicker:n=>"Switzerland · "+n+" trips",
  lede:"National routes, pass days, lake loops and the Swiss leg of EuroVelo 6. Scroll the atlas or use the arrows to walk the list. Open a tour when you are ready. Days are computed from effort — the number is a default, not a timetable.",
  note:"Same catalogue as the old picker. Scroll or use the arrows to walk the list. Open a tour for a paper sheet — days computed from effort, from a snapshot of graphs in this repo.",
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
    loopfng:"img/gletsch.jpg", ev6:"img/rheinfall.jpg"
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
    "Stein am Rhein":["img/rheinfall.jpg","img/basel.jpg"],
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
const RAD=Math.PI/180;
function mercY(lat){
  const s=Math.sin(Math.max(-85.05112878, Math.min(85.05112878, lat))*RAD);
  return Math.log((1+s)/(1-s))/2;
}
const PJ=(function(){
  const mx0=BBOX.lon0, mx1=BBOX.lon1;
  const my0=mercY(BBOX.lat0), my1=mercY(BBOX.lat1);
  const innerW=W-PAD*2, innerH=H-PAD*2;
  const lonSpan=mx1-mx0, mercSpan=my1-my0;
  const kx=Math.min(innerW/lonSpan, innerH/(mercSpan*180/Math.PI));
  const ky=-kx*180/Math.PI;
  const usedW=lonSpan*kx, usedH=mercSpan*(-ky);
  const bx=PAD+(innerW-usedW)/2-mx0*kx;
  const by=PAD+(innerH-usedH)/2-my1*ky;
  return {kx, ky, bx, by, BM_W:360*kx, BM_X0:kx*(-180)+bx, BM_Y0:ky*Math.PI+by};
})();
function xy(lat, lon){
  return [PJ.kx*lon+PJ.bx, PJ.ky*mercY(lat)+PJ.by];
}
function fromXY(x, y){
  const lon=(x-PJ.bx)/PJ.kx;
  const m=(y-PJ.by)/PJ.ky;
  const lat=(2*Math.atan(Math.exp(m))-Math.PI/2)/RAD;
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
let placeOpen=null, placeHits=[], stopHits=[];
let PLAN=null, effort=100, veh="bike", selDay=null, selStop=null, filmFocus=1, filmOpen=false;
let lang="local", zoom=1, startId=null, endId=null;
let folds={plan:true, route:false, days:true};
let editOpen=false, netForksOpen=false, ctxSlim=null, panMode=true;
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
const BAND_TILE={g:"#ffe34a",a:"#ff8a00",r:"#ff2d55"};
const RIDE_CORAL="#ff3b1a";
const DAY_LINE="#ffbf00";
const LCOL={shop:"#c9a227",stay:"#3d7ec9",eat:"#b85c38",camp:"#3d8b6e",bath:"#7a5ea7",rail:"#1c1916",water:"#4a8fa3",wc:"#6b7280"};
const LAYER_LAB={shop:"shop",stay:"beds",eat:"food",camp:"camp",bath:"bath",rail:"station",water:"drinking water",wc:"toilet"};

function geo(t){ return t.geo||{}; }
function daysEst(g){
  const eff=g.eff||g.km||0;
  return Math.max(1, Math.round(eff/100));
}
function matches(t){
  const g=geo(t), n=daysEst(g), tags=t.tags||[];
  if(filter==="top") return t.top>0;
  if(filter==="all") return true;
  if(filter==="crossing") return t.kind==="crossing" || tags.includes("crossing");
  if(filter==="d3") return n>0 && n<=3;
  if(filter==="d46"||filter==="d6") return n>=4 && n<=6;
  if(filter==="d7") return n>=7;
  if(filter==="e0"||filter==="easy") return grade(g.km, g.asc)===0;
  if(filter==="e1") return grade(g.km, g.asc)===1;
  if(filter==="e2") return grade(g.km, g.asc)>=2;
  return tags.includes(filter);
}
function filterChips(){
  const reserved=new Set(["top","all","crossing","d3","d46","d6","d7","e0","easy","e1","e2","moderate","hard"]);
  const tags=[...new Set(TRIPS.flatMap(t=>t.tags||[]))]
    .filter(t=>t && !reserved.has(String(t).toLowerCase()))
    .sort();
  const hasCrossing=TRIPS.some(t=>t.kind==="crossing" || (t.tags||[]).includes("crossing"));
  const featured=[["top","top"]];
  if(hasCrossing) featured.push(["crossing","crossing"]);
  return [
    ...featured,
    ["all","all "+TRIPS.length],
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

const BM_SRC={
  plain:{url:"https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",s:"",max:16,attr:"© Esri, HERE, Garmin, OpenStreetMap contributors"},
  cycle:{url:"https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",s:"abc",max:20,attr:"© OpenStreetMap contributors · CyclOSM"}
};
const BM_SWITCH=10;
let BM_TILES={}, BM_T=null;
function mapViewBox(){
  const svg=document.getElementById("map");
  return ((svg&&svg.getAttribute("viewBox"))||VB0).split(/\s+/).map(Number);
}
function pxPerUnit(){
  const svg=document.getElementById("map");
  if(!svg) return 1;
  return svg.getBoundingClientRect().width/Math.max(mapViewBox()[2], 1);
}
function tilesRoot(){
  let g=document.getElementById("tiles");
  if(!g){
    const svg=document.getElementById("map");
    g=document.createElementNS("http://www.w3.org/2000/svg","g");
    g.id="tiles";
    g.setAttribute("pointer-events","none");
    const ghost=document.getElementById("ghost");
    svg.insertBefore(g, ghost||null);
  }
  return g;
}
function attribEl(){
  let el=document.getElementById("attrib");
  if(!el){
    el=document.createElement("div");
    el.id="attrib";
    const stage=document.getElementById("stage");
    if(stage) stage.appendChild(el);
  }
  return el;
}
function bmZoom(){
  const ppu=pxPerUnit(), dpr=Math.min(window.devicePixelRatio||1, 2);
  return Math.round(Math.log(PJ.BM_W*ppu*dpr/256)/Math.LN2);
}
function bmOnRide(){
  return mode==="ride" && PLAN && PLAN!==false;
}
function bmSource(){
  if(!bmOnRide()) return null;
  const z=bmZoom();
  return z>=BM_SWITCH?"cycle":"plain";
}
function clearTiles(){
  const g=document.getElementById("tiles");
  if(g) g.innerHTML="";
  BM_TILES={};
  const att=document.getElementById("attrib");
  if(att) att.textContent="";
  document.body.classList.remove("tiled");
}
function bmClean(){
  let pending=false;
  for(const id in BM_TILES){
    const im=BM_TILES[id];
    if(!im.dataset.stale && im.style.opacity==="0"){ pending=true; break; }
  }
  if(pending) return;
  for(const id in BM_TILES){
    const im=BM_TILES[id];
    if(im.dataset.stale){ im.remove(); delete BM_TILES[id]; }
  }
}
function drawTiles(){
  const att=attribEl();
  const key=bmSource();
  if(!key){ clearTiles(); return; }
  const src=BM_SRC[key];
  const z=Math.max(src.min||0, Math.min(src.max||19, bmZoom()));
  const S=PJ.BM_W/Math.pow(2,z), n=Math.pow(2,z);
  const vb=mapViewBox();
  let x0=Math.floor((vb[0]-PJ.BM_X0)/S)-1;
  let x1=Math.floor((vb[0]+vb[2]-PJ.BM_X0)/S)+1;
  let y0=Math.max(0, Math.floor((vb[1]-PJ.BM_Y0)/S)-1);
  let y1=Math.min(n-1, Math.floor((vb[1]+vb[3]-PJ.BM_Y0)/S)+1);
  if((x1-x0+1)*(y1-y0+1)>400){ return; }
  document.body.classList.add("tiled");
  const g=tilesRoot();
  const want={}, sub=src.s||"";
  for(let tx=x0; tx<=x1; tx++){
    for(let ty=y0; ty<=y1; ty++){
      const wx=((tx%n)+n)%n, id=key+"/"+z+"/"+tx+"/"+ty;
      want[id]=1;
      if(BM_TILES[id]) continue;
      const im=document.createElementNS("http://www.w3.org/2000/svg","image");
      im.setAttribute("x", PJ.BM_X0+tx*S);
      im.setAttribute("y", PJ.BM_Y0+ty*S);
      im.setAttribute("width", S*1.003);
      im.setAttribute("height", S*1.003);
      im.setAttribute("preserveAspectRatio","none");
      const url=src.url.replace("{z}",z).replace("{x}",wx).replace("{y}",ty).replace("{s}",sub?sub[(tx+ty)%sub.length]:"");
      im.setAttributeNS("http://www.w3.org/1999/xlink","href", url);
      im.setAttribute("href", url);
      im.dataset.z=z; im.dataset.src=key;
      im.style.opacity="0";
      im.addEventListener("load", e=>{ e.target.style.opacity="1"; bmClean(); });
      im.addEventListener("error", e=>{
        const t=e.target; t.remove();
        for(const q in BM_TILES) if(BM_TILES[q]===t) delete BM_TILES[q];
        bmClean();
      });
      g.appendChild(im);
      BM_TILES[id]=im;
    }
  }
  for(const id in BM_TILES){
    const im=BM_TILES[id];
    if(want[id]) continue;
    if(+im.dataset.z===z && im.dataset.src===key){ im.remove(); delete BM_TILES[id]; }
    else im.dataset.stale=1;
  }
  att.textContent=src.attr||"";
  g.querySelectorAll("image[data-stale]").forEach(im=>g.insertBefore(im, g.firstChild));
  setTimeout(bmClean, 1500);
}
function scheduleTiles(){
  if(BM_T) clearTimeout(BM_T);
  BM_T=setTimeout(()=>{ BM_T=null; drawTiles(); }, 60);
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
  hit.setAttribute("pointer-events", mode==="ride"?"none":"stroke");
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
  scheduleTiles();
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
    if(mode!=="network") return;
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
    const same=ride && ride.id===p.trip && (selDay||null)===(day||null);
    if(!same){ selStop=null; hidePlaceCard(); filmOpen=false; if(isNarrowSheet()) ctxSlim=true; }
    selDay=day||null;
    vbManual=false;
    if(!(mode==="ride" && ride && ride.id===p.trip)){
      if(ride && ride.id!==p.trip){ PLAN=null; effort=100; veh="bike"; startId=null; endId=null; zoom=1; folds={plan:true, route:false, days:true}; editOpen=false; netForksOpen=false; reversed=false; dtar=0; skipOn={}; skipOff={}; selSeg=null; selStop=null; }
      ride=TRIPS.find(t=>t.id===p.trip); mode="ride"; hover=null;
      filmFocus=day||1;
      ensurePlan(p.trip);
    } else if(day) filmFocus=day;
    draw();
    return;
  }
  if(mode!=="network"){ if(ride) pick=ride.id; mode="network"; ride=null; hover=null; selDay=null; selStop=null; draw(); }
}
function openRide(id, day){
  if(!TRIPS.some(t=>t.id===id)) return;
  const h=rideHash(id, day||null);
  if(location.hash.replace(/^#/,"")!==h) location.hash=h;
  else applyHash();
}
function goNetwork(){
  if(ride) pick=ride.id;
  zoom=1; vbManual=false; selDay=null; selSeg=null; selStop=null;
  hidePlaceCard();
  applyView();
  if(location.hash!=="#network") location.hash="network";
  else applyHash();
}
function goTour(){
  if(!ride) return;
  selDay=null; selSeg=null; selStop=null; vbManual=false;
  hidePlaceCard();
  openRide(ride.id, null);
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
  const poi=(s.poi||[]).map(p=>({...p, km:+((s.km-(p.km||0)).toFixed(1))}));
  return {...s, frm:s.to, to:s.frm, frmName:s.toName, toName:s.frmName,
    ascent, descent, effort, effortR:effortOf(s,false), line, cand, prof, poi};
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
  if(veh==="opium"){
    segs=segs.map(s=>{
      const a=s.mopedAlt; if(!a) return s;
      return {...s, km:a.km, ascent:a.ascent, descent:a.descent, effort:a.effort, effortR:a.effortR,
        line:a.line||s.line, cand:a.cand&&a.cand.length?a.cand:s.cand, prof:a.prof||s.prof, mopedGeom:true};
    });
  } else if(preferSigned){
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
  const fromT=(PLAN.towns||[]).find(t=>t.id===startId);
  const toT=(PLAN.towns||[]).find(t=>t.id===endId);
  if(!segs.length) return {
    from:showName(fromT?fromT.name:PLAN.startName),
    to:showName(toT?toT.name:PLAN.endName),
    fromId:startId, toId:endId
  };
  return {
    from:fromT?showName(fromT.name):showName(segs[0].frmName||segs[0].frm),
    to:toT?showName(toT.name):showName(segs[segs.length-1].toName||segs[segs.length-1].to),
    fromId:startId||segs[0].frm,
    toId:endId||segs[segs.length-1].to
  };
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
  let i0=segs.findIndex(s=>s.frm===startId);
  let i1=segs.findIndex(s=>s.to===endId);
  if(i0<0){
    const after=segs.findIndex(s=>s.to===startId);
    if(after>=0) i0=after+1;
  }
  if(i1<0){
    const before=segs.findIndex(s=>s.frm===endId);
    if(before>0) i1=before-1;
  }
  if(i0<0) i0=0;
  if(i1<0) i1=segs.length-1;
  if(i0>=segs.length) return [];
  if(i1<i0){ i0=0; i1=segs.length-1; }
  return segs.slice(i0, i1+1);
}
function nodePoint(id){
  if(!id) return null;
  const segs=chainSegs();
  for(let i=0;i<segs.length;i++){
    const s=segs[i], line=s.line||[];
    if(s.frm===id && line[0]) return line[0];
    if(s.to===id && line.length) return line[line.length-1];
  }
  return null;
}
function rideStats(){
  const segs=activeSegs().filter(s=>!isSkipped(s.id));
  let km=0,asc=0,signed=0;
  segs.forEach(s=>{ km+=s.km; asc+=saneClimb(s,false); signed+=(s.signed||0)*s.km; });
  return {km:Math.round(km), asc:Math.round(asc), signed:km?Math.round(signed/km):0};
}
function ridePoints(){
  const pts=[];
  const startPt=nodePoint(startId);
  if(startPt) pts.push(startPt);
  activeSegs().forEach(s=>{ if(isSkipped(s.id)) return; (s.line||[]).forEach(p=>pts.push(p)); });
  return pts;
}
function overlayFractions(){
  const svg=document.getElementById("map");
  if(!svg) return {left:0, right:0.02, top:0.06, bottom:0.04, ar:W/H};
  const r=svg.getBoundingClientRect();
  const ar=(r.width>8 && r.height>8)? r.width/r.height : W/H;
  let left=0, right=0.02, top=0.05, bottom=0.03;
  const clip=(el, edge)=>{
    if(!el || el.hidden) return;
    const b=el.getBoundingClientRect();
    const ox=Math.max(0, Math.min(b.right,r.right)-Math.max(b.left,r.left));
    const oy=Math.max(0, Math.min(b.bottom,r.bottom)-Math.max(b.top,r.top));
    if(ox<12 || oy<8) return;
    if(edge==="left") left=Math.max(left, (Math.min(b.right,r.right)-r.left)/r.width);
    if(edge==="bottom") bottom=Math.max(bottom, (r.bottom-Math.max(b.top,r.top))/r.height);
    if(edge==="top") top=Math.max(top, (Math.min(b.bottom,r.bottom)-r.top)/r.height);
  };
  const ctx=document.getElementById("ctx");
  if(ctx && !ctx.hidden){
    const b=ctx.getBoundingClientRect();
    const coverW=Math.max(0, Math.min(b.right,r.right)-Math.max(b.left,r.left))/Math.max(r.width,1);
    if(coverW>0.55) clip(ctx, "top");
    else clip(ctx, "left");
  }
  const dock=document.getElementById("daydock")||document.getElementById("filmwrap");
  if(dock && !dock.hidden && dock.offsetHeight) clip(dock, "bottom");
  const tools=document.getElementById("maptools");
  if(tools && !tools.hidden){
    const b=tools.getBoundingClientRect();
    top=Math.max(top, (Math.min(b.bottom, r.bottom)-r.top+10)/r.height);
  }
  return {left, right, top, bottom, ar};
}
function fitPts(pts, pad){
  const svg=document.getElementById("map"); if(!svg||!pts||pts.length<2){ if(svg) svg.setAttribute("viewBox", VB0); return; }
  const xypts=pts.map(p=>xy(p[0], p[1]));
  const x0=Math.min(...xypts.map(p=>p[0])), x1=Math.max(...xypts.map(p=>p[0]));
  const y0=Math.min(...xypts.map(p=>p[1])), y1=Math.max(...xypts.map(p=>p[1]));
  const padN=pad||1.1;
  const rw=Math.max((x1-x0)*padN, 10), rh=Math.max((y1-y0)*padN, 10);
  const chrome=overlayFractions();
  const visW=Math.max(0.36, 1-chrome.left-chrome.right);
  const visH=Math.max(0.42, 1-chrome.top-chrome.bottom);
  const ar=chrome.ar||(W/H);
  const w=Math.max(rw/visW, rh/visH*ar, 3);
  const h=w/ar;
  const cx=(x0+x1)/2, cy=(y0+y1)/2;
  let x=cx-(chrome.left+visW/2)*w;
  let y=cy-(chrome.top+visH/2)*h;
  if(!bmOnRide()){
    x=Math.max(-120, Math.min(W+80-w, x));
    y=Math.max(-120, Math.min(H+80-h, y));
  }
  zoom=Math.max(1, +(W/w).toFixed(2));
  svg.setAttribute("viewBox", x.toFixed(1)+" "+y.toFixed(1)+" "+w.toFixed(1)+" "+h.toFixed(1));
}
function ink(n){
  const z=Math.max(zoom,1);
  return +Math.max(n/z, 0.04).toFixed(3);
}
function rideStroke(band){
  if(!friendOn) return RIDE_CORAL;
  if(bmOnRide()) return BAND_TILE[band]||RIDE_CORAL;
  return BAND[band]||"#f0713f";
}
function addPoly(g, ptsStr, stroke, w, extra){
  const p=document.createElementNS("http://www.w3.org/2000/svg","polyline");
  p.setAttribute("points", ptsStr);
  p.setAttribute("fill","none");
  p.setAttribute("stroke", stroke);
  p.setAttribute("stroke-width", w);
  p.setAttribute("stroke-linecap","round");
  p.setAttribute("stroke-linejoin","round");
  if(extra) Object.keys(extra).forEach(k=>p.setAttribute(k, extra[k]));
  g.appendChild(p);
  return p;
}
function strokeOnMap(g, ptsStr, color, w){
  if(bmOnRide()){
    addPoly(g, ptsStr, "#1c1916", w*2.7, {opacity:".4"});
    addPoly(g, ptsStr, "#fffdf8", w*2.05, {opacity:".96"});
  }
  addPoly(g, ptsStr, color, w);
}
function fitRide(){ fitPts(ridePoints(), 1.1); }
function fitDay(){
  const days=planDays();
  const d=days.find(x=>x.n===selDay);
  let line=d && d.line;
  if(!line||line.length<2){
    let k0=0,k1=0;
    days.forEach(x=>{ if(x.mode==="train") return; if(x.n<selDay) k0+=x.km; if(x.n<=selDay) k1+=x.km; });
    line=sliceLine(activeSegs().filter(s=>!isSkipped(s.id)), k0, k1);
  }
  if(line&&line.length>1) fitPts(line, 1.12);
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
  let w=Math.min(Math.max(vb[2]*f, 3), W*1.6);
  let h=w*(H/W);
  vbManual=true;
  zoom=Math.max(1, +(W/w).toFixed(2));
  svg.setAttribute("viewBox", (cx-w/2).toFixed(1)+" "+(cy-h/2).toFixed(1)+" "+w.toFixed(1)+" "+h.toFixed(1));
  paintRide();
  paintMini();
  scheduleTiles();
}
function setViewBox(svg, x, y, w, h){
  const ww=Math.min(Math.max(w, 3), W*1.6);
  const hh=ww*(H/W);
  vbManual=true;
  zoom=Math.max(1, +(W/ww).toFixed(2));
  svg.setAttribute("viewBox", x.toFixed(1)+" "+y.toFixed(1)+" "+ww.toFixed(1)+" "+hh.toFixed(1));
}
function bindCtxFold(){
  const ctx=document.getElementById("ctx");
  const fold=document.getElementById("ctxfold");
  if(!ctx) return;
  if(ctxSlim==null) ctxSlim=window.matchMedia("(max-width:860px)").matches;
  const slim=!!ctxSlim;
  ctx.classList.toggle("slim", slim);
  if(!fold) return;
  fold.setAttribute("aria-expanded", slim?"false":"true");
  fold.textContent=slim?"Details":"Hide";
  fold.onclick=e=>{
    e.stopPropagation();
    ctxSlim=!ctx.classList.contains("slim");
    ctx.classList.toggle("slim", ctxSlim);
    fold.setAttribute("aria-expanded", ctxSlim?"false":"true");
    fold.textContent=ctxSlim?"Details":"Hide";
    if(!vbManual) applyView();
    bindCtxScrollHint();
  };
}
function syncMapTools(){
  const back=document.getElementById("mapback");
  const tools=document.getElementById("maptools");
  const layers=document.getElementById("maplayers");
  const on=mode==="ride" && PLAN && PLAN!==false;
  back.hidden=!on;
  tools.hidden=!on;
  layers.hidden=!on;
  document.getElementById("stage").classList.toggle("pan", on && panMode);
  if(!on) return;
  if(selDay && ride){
    back.textContent="‹ "+ride.name;
    back.title="Back to the tour";
    back.onclick=goTour;
  } else {
    back.textContent=PAPER.backAll(TRIPS.length);
    back.title="All trips";
    back.onclick=goNetwork;
  }
  document.getElementById("vehbtn").textContent=VEH_LABEL[veh]||"Bicycle";
  document.getElementById("langbtn").textContent=lang==="local"?"English names":(PAPER.localLabel||"Lokale Namen");
  const facSegs=(PLAN.segs||[]).concat(PLAN.altSegs||[]);
  layers.querySelectorAll("button[data-l]").forEach(b=>{
    const k=b.dataset.l;
    const has=facSegs.some(s=>(s.fac&&s.fac[k]&&s.fac[k].length)||s[k]);
    b.hidden=!has;
    b.classList.toggle("on", !!layersOn[k]);
  });
  const pan=document.getElementById("panbtn");
  if(pan){
    pan.classList.toggle("on", panMode);
    pan.setAttribute("aria-pressed", panMode?"true":"false");
  }
}
function setVeh(k){
  veh=k;
  if(PLAN && PLAN.vehicles && PLAN.vehicles.targetRange){
    const tr=PLAN.vehicles.targetRange[k];
    if(tr){ if(effort<tr[0]) effort=tr[0]; if(effort>tr[1]) effort=tr[1]; }
  }
  selDay=null; selStop=null; skipCache=null;
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
  if(full) return enrichDays(PLAN.days.map(d=>({...d, mode:"ride", frm:showName(d.frm), to:showName(d.to)})));
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
    let shop=0,stay=0,bath=0,rail=0,water=0,eat=0,wc=0,camp=0,k=0;
    segs.forEach(s=>{
      const a=Math.max(dayOff,k), b=Math.min(dayOff+d.km, k+s.km);
      if(b>a+0.05){
        const frac=(b-a)/s.km;
        shop+=(s.shop||0)*frac; stay+=(s.stay||0)*frac; bath+=(s.bath||0)*frac;
        rail+=(s.rail||0)*frac; water+=(s.water||0)*frac;
        eat+=(s.eat||0)*frac; wc+=(s.wc||0)*frac; camp+=(s.camp||0)*frac;
      }
      k+=s.km;
    });
    if(d.shop==null){
      d.shop=Math.round(shop); d.stay=Math.round(stay); d.bath=Math.round(bath);
      d.rail=Math.round(rail); d.water=Math.round(water);
    }
    if(d.eat==null){
      d.eat=Math.round(eat); d.wc=Math.round(wc); d.camp=Math.round(camp);
    }
    d.line=sliceLine(segs, dayOff, dayOff+d.km);
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
    if(d.line&&d.line.length){
      const last=d.line[d.line.length-1];
      d.lat=last[0]; d.lon=last[1];
    }
    dayOff+=d.km;
  });
  return days;
}
function placePhotoList(v){
  if(!v) return [];
  return Array.isArray(v)?v.filter(Boolean):[v];
}
function placePhotos(name){
  const places=PAPER.places||{};
  if(!name) return [];
  const aliases=PAPER.photoAliases||{};
  const names=[name];
  if(aliases[name]) names.push(aliases[name]);
  const paren=String(name).match(/\(([^)]+)\)/);
  if(paren) names.push(paren[1]);
  const plus=String(name).match(/^(.+?)\s+\+\d+\s*km$/i);
  if(plus) names.push(plus[1]);
  const tried=new Set();
  for(const n of names){
    if(!n || tried.has(n)) continue;
    tried.add(n);
    const hit=places[n];
    if(hit) return placePhotoList(hit);
    const low=String(n).toLowerCase();
    const en=PAPER.en||{};
    for(const k of Object.keys(places)){
      const alias=String(en[k]||"").toLowerCase();
      if(low===k.toLowerCase() || (alias && low===alias)) return placePhotoList(places[k]);
    }
    if(aliases[n] && !tried.has(aliases[n])) names.push(aliases[n]);
  }
  return [];
}
function dayGapLine(today){
  if(!today) return "";
  const gapKm=today.gap!=null?Math.round(today.gap):null;
  return `${gapKm!=null?gapKm+" km longest gap · ":""}<b>${today.bath||0}</b> bath${(today.bath||0)===1?"":"s"} · <b>${today.rail||0}</b> station${(today.rail||0)===1?"":"s"}${today.water?` · <b>${today.water}</b> water`:""}`;
}
function rideDayCount(){
  return planDays().filter(d=>d.mode!=="train").length;
}
function filmVisible(){
  return mode==="ride" && PLAN && PLAN!==false && rideDayCount()>=1;
}
function isNarrowSheet(){
  return window.matchMedia("(max-width:860px)").matches;
}
function syncFilmCollapse(){
  const narrow=isNarrowSheet();
  const collapse=!!(selDay && narrow && !filmOpen);
  document.body.classList.toggle("film-collapsed", collapse);
  const tog=document.getElementById("filmtog");
  if(!tog) return;
  const n=rideDayCount();
  const today=planDays().find(d=>d.n===selDay);
  tog.hidden=!(selDay && narrow);
  tog.setAttribute("aria-expanded", filmOpen?"true":"false");
  const who=today?(today.frm+" → "+today.to):"";
  tog.innerHTML=filmOpen
    ? `<span class="filmtog-ch" aria-hidden="true">▾</span>`
    : `<span class="filmtog-lab">Day ${selDay} of ${n}</span><span class="filmtog-who">${esc(who)}</span><span class="filmtog-ch" aria-hidden="true">▴</span>`;
  tog.title=filmOpen?"Hide days":"Show days";
  tog.setAttribute("aria-label", filmOpen?"Hide days":("Day "+selDay+" of "+n));
}
function bindCtxScrollHint(){
  const ctx=document.getElementById("ctx");
  if(!ctx) return;
  const hint=()=>{
    const more=ctx.scrollHeight>ctx.clientHeight+12;
    const atEnd=ctx.scrollTop+ctx.clientHeight>=ctx.scrollHeight-10;
    ctx.classList.toggle("has-more", more && !atEnd);
  };
  if(ctx.dataset.scrollHint!=="1"){
    ctx.dataset.scrollHint="1";
    ctx.addEventListener("scroll", hint, {passive:true});
  }
  requestAnimationFrame(hint);
}
function dayKmRange(days, n){
  let k0=0, k1=0;
  (days||[]).forEach(x=>{
    if(x.mode==="train") return;
    if(x.n<n) k0+=x.km||0;
    if(x.n<=n) k1+=x.km||0;
  });
  return [k0, k1];
}
function segsOnDay(today, days){
  if(!today) return [];
  const segs=activeSegs().filter(s=>!isSkipped(s.id));
  const [k0,k1]=dayKmRange(days, today.n);
  const out=[];
  let k=0;
  segs.forEach(s=>{
    const a=Math.max(k0,k), b=Math.min(k1, k+(s.km||0));
    if(b>a+0.8) out.push({seg:s, km:b-a});
    k+=s.km||0;
  });
  return out;
}
function stopEq(a, b){
  if(!a||!b) return false;
  if(a.name!==b.name) return false;
  if(a.km==null || b.km==null) return true;
  return Math.abs(a.km-b.km)<0.8;
}
function shortStop(name){
  const s=String(name||"");
  if(s.length<=22) return s;
  const m=s.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if(m && m[1] && m[1].length>=8 && m[1].length<s.length) return m[1];
  if(m && m[2] && m[2].length>=3 && m[2].length<s.length) return m[2];
  return s;
}
function mapStopLabel(name, others){
  const full=String(name||"");
  const short=shortStop(full);
  if(short!==full && (others||[]).some(o=>o!==full && (o===short || shortStop(o)===short))){
    const head=full.replace(/\s*\([^)]+\)\s*$/,"").trim();
    return head || short;
  }
  return short;
}
function mapSightLabel(p){
  let n=String((p&&p.name)||"");
  if((p&&p.kind)==="mne"){
    n=n.replace(/^michi[- ]?no[- ]?eki\s*/i,"").replace(/^[「"'“‘（(]+/,"").replace(/[」"'”’）)]+$/,"").trim();
  }
  if(n && n[0]>="a" && n[0]<="z") n=n[0].toUpperCase()+n.slice(1);
  return shortStop(n) || shortStop(p&&p.name);
}
function stopNameKey(name){
  return String(name||"").toLowerCase().replace(/\s*\([^)]*\)\s*/g," ").replace(/[^a-z0-9]+/g," ").trim();
}
function dayHopLine(today, days){
  const names=[];
  segsOnDay(today, days).forEach(({seg})=>{
    [showName(seg.frmName||seg.frm), showName(seg.toName||seg.to)].forEach(n=>{
      if(!n || names.some(x=>stopNameKey(x)===stopNameKey(n))) return;
      names.push(n);
    });
  });
  const endK=stopNameKey(today && today.to);
  const cut=[];
  for(let i=0;i<names.length;i++){
    cut.push(names[i]);
    if(endK && stopNameKey(names[i])===endK) break;
  }
  return cut.length>1?cut.join(" → "):"";
}
function dayStops(today, days){
  if(!today) return [];
  const segs=activeSegs().filter(s=>!isSkipped(s.id));
  const [k0,k1]=dayKmRange(days, today.n);
  const raw=[];
  const push=(name, lat, lon, km, role)=>{
    if(lat==null || lon==null || !name) return;
    const nm=showName(name);
    if(!nm) return;
    const key=stopNameKey(nm);
    if(!key) return;
    if(raw.some(s=>stopNameKey(s.name)===key)) return;
    raw.push({name:nm, lat, lon, km:+(+km).toFixed(1), role:role||"via"});
  };
  const a=today.line&&today.line[0];
  if(a) push(today.frm, a[0], a[1], k0, "start");
  let k=0;
  segs.forEach(s=>{
    (s.cand||[]).forEach(c=>{
      const km=k+(c.km||0);
      if(km<k0+0.6 || km>k1-0.6) return;
      const label=c.label||((PLAN.towns||[]).find(t=>t.id===c.node)||{}).name||"";
      if(!label) return;
      push(label, c.lat, c.lon, km, "via");
    });
    k+=s.km||0;
  });
  push(today.to, today.lat, today.lon, k1, "end");
  const start=raw.filter(s=>s.role==="start");
  const end=raw.filter(s=>s.role==="end");
  const startK=stopNameKey(today.frm), endK=stopNameKey(today.to);
  let vias=raw.filter(s=>s.role==="via" && stopNameKey(s.name)!==startK && stopNameKey(s.name)!==endK);
  const maxVia=6;
  if(vias.length>maxVia){
    const picked=[];
    for(let i=0;i<maxVia;i++){
      const idx=Math.round(i*(vias.length-1)/Math.max(maxVia-1,1));
      if(!picked.includes(vias[idx])) picked.push(vias[idx]);
    }
    vias=picked;
  }
  return start.concat(vias).concat(end);
}
const SIGHT_KIND={
  mne:"road station", castle:"castle", waterfall:"waterfall", cape:"cape", peak:"peak",
  viewpoint:"viewpoint", attraction:"sight", museum:"museum", ruins:"ruins", beach:"beach"
};
function daySights(today, days){
  if(!today) return [];
  const segs=activeSegs().filter(s=>!isSkipped(s.id));
  const [k0, k1]=dayKmRange(days, today.n);
  const stops=dayStops(today, days);
  const raw=[];
  let k=0;
  segs.forEach(s=>{
    (s.poi||[]).forEach(p=>{
      const km=k+(p.km||0);
      if(km<k0+0.4 || km>k1-0.4) return;
      if(p.lat==null || p.lon==null || !p.name) return;
      if(stops.some(t=>Math.abs((t.km||0)-km)<3) && !/^(mne|cape|peak|castle|waterfall)$/.test(p.kind||"")) return;
      raw.push({name:p.name, nameLocal:p.nameLocal||"", kind:p.kind||"attraction",
        off:p.off, lat:p.lat, lon:p.lon, km:+(+km).toFixed(1)});
    });
    k+=s.km||0;
  });
  const seen={};
  const uniq=raw.filter(p=>{
    const key=String(p.name||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
    if(!key || seen[key]) return false;
    seen[key]=1;
    return true;
  });
  uniq.sort((a,b)=>{
    if(a.kind==="mne" && b.kind!=="mne") return -1;
    if(b.kind==="mne" && a.kind!=="mne") return 1;
    return (a.off||0)-(b.off||0);
  });
  const max=10;
  const minKm=Math.max(5, (today.km||40)/12);
  const picked=[];
  uniq.forEach(p=>{
    if(picked.length>=max) return;
    if(p.kind!=="mne" && picked.filter(q=>q.kind!=="mne").some(q=>{
      const gap=/^(cape|peak|castle|waterfall)$/.test(p.kind)?1.4:minKm;
      return Math.abs(q.km-p.km)<gap;
    })) return;
    picked.push(p);
  });
  return picked.sort((a,b)=>a.km-b.km);
}
function mapLabelPack(){
  const boxes=[];
  const hits=(a,b)=>!(a.x+a.w+ink(3)<b.x || b.x+b.w+ink(3)<a.x || a.y+a.h+ink(2)<b.y || b.y+b.h+ink(2)<a.y);
  return {
    take(x, y, text, fs, always){
      const w=Math.max(ink(16), String(text).length*fs*0.56);
      const h=fs*1.35;
      const cands=[
        [x+ink(8), y-ink(7)],
        [x+ink(8), y+ink(h+2)],
        [x-w-ink(6), y-ink(7)],
        [x-w-ink(6), y+ink(h+2)]
      ];
      for(let i=0;i<cands.length;i++){
        const lx=cands[i][0], ly=cands[i][1];
        const box={x:lx, y:ly-h, w, h};
        if(boxes.some(b=>hits(b, box))) continue;
        boxes.push(box);
        return {x:lx, y:ly};
      }
      if(!always) return null;
      const lx=cands[0][0], ly=cands[0][1];
      boxes.push({x:lx, y:ly-h, w, h});
      return {x:lx, y:ly};
    }
  };
}
function dayForkNote(today, days){
  if(!today || !PLAN) return "";
  const on=new Set();
  segsOnDay(today, days).forEach(({seg})=>{ on.add(seg.frm); on.add(seg.to); });
  const notes=[];
  (PLAN.forks||[]).forEach(f=>{
    const def=f.pick||(f.options[0]&&f.options[0].id);
    const p=picks[f.node]||f.pick||def;
    if(!p || p===def) return;
    if(!on.has(f.node)) return;
    const o=(f.options||[]).find(x=>x.id===p);
    notes.push((f.name||showName(f.node))+": "+(o?o.label:p));
  });
  return notes.join(" · ");
}
function dayRouteHint(){
  const note=(ride&&ride.note)||"";
  const bits=[];
  const re=/National Route\s+\d+|EuroVelo\s+\d+|Route\s+\d+/gi;
  let m; while((m=re.exec(note))) bits.push(m[0].replace(/\s+/g," "));
  return [...new Set(bits)].join(" · ");
}
function dayBandPhrase(daySegs){
  const tot=daySegs.reduce((n,x)=>n+(x.km||0),0)||1;
  const g=daySegs.filter(x=>x.seg.band==="g").reduce((n,x)=>n+x.km,0);
  const r=daySegs.filter(x=>x.seg.band==="r").reduce((n,x)=>n+x.km,0);
  const signed=daySegs.reduce((n,x)=>n+((x.seg.signed||0)*x.km),0)/tot;
  const parts=[];
  if(signed>=55) parts.push("mostly signed");
  else if(signed>=25) parts.push("partly signed");
  if(g/tot>=0.55) parts.push("quiet roads");
  else if(r/tot>=0.35) parts.push("busy stretches");
  else parts.push("mixed roads");
  return parts.join(" · ");
}
function dayCharLine(today, days){
  if(!today) return "";
  const hops=segsOnDay(today, days);
  const bits=[dayRouteHint(), dayBandPhrase(hops)];
  if(today.gap!=null) bits.push(Math.round(today.gap)+" km longest shop gap");
  const fork=dayForkNote(today, days);
  if(fork) bits.push(fork);
  return bits.filter(Boolean).join(" · ");
}
function dayCues(today, days){
  if(!today) return {steps:[], phrase:"", route:"", fork:""};
  const hops=segsOnDay(today, days);
  const stops=dayStops(today, days);
  const k0=stops[0]?stops[0].km:0;
  let steps=stops.map(s=>({
    kind:s.role==="start"?"start":s.role==="end"?"end":"via",
    name:s.name, km:s.km, dayKm:+((s.km||0)-k0).toFixed(1),
    lat:s.lat, lon:s.lon, role:s.role
  }));
  const seen={};
  steps=steps.filter(s=>{
    const k=stopNameKey(s.name);
    if(!k || seen[k]) return false;
    seen[k]=1;
    return true;
  });
  if(steps.length>8){
    const first=steps[0], last=steps[steps.length-1];
    const mid=steps.slice(1,-1);
    const take=[];
    const n=Math.min(6, mid.length);
    for(let i=0;i<n;i++){
      const idx=Math.round(i*(mid.length-1)/Math.max(n-1,1));
      if(mid[idx] && !take.includes(mid[idx])) take.push(mid[idx]);
    }
    steps=[first].concat(take).concat([last]);
  }
  return {steps, phrase:dayBandPhrase(hops), route:dayRouteHint(), fork:dayForkNote(today, days)};
}
function dayCueHtml(today, days){
  const c=dayCues(today, days);
  if(!c.steps.length) return "";
  const chips=c.steps.map(s=>{
    const km=Math.round(s.dayKm!=null?s.dayKm:s.km||0);
    const tag=s.kind==="start"?"Start":s.kind==="end"?"Sleep":s.kind==="sight"?(SIGHT_KIND[s.sight]||"sight"):km+" km";
    return `<button type="button" class="cue cue-${s.kind}" data-name="${esc(s.name)}" data-km="${s.km}" data-lat="${s.lat||""}" data-lon="${s.lon||""}" data-role="${esc(s.role||s.kind)}">`+
      `<span class="cue-tag">${esc(tag)}</span><span class="cue-who">${esc(s.name)}</span></button>`;
  }).join('<span class="cue-then" aria-hidden="true">then</span>');
  return `<div class="cuebar hit" id="daycues">`+
    (c.route?`<p class="cue-kicker">${esc(c.route)}</p>`:"")+
    `<div class="cue-row">${chips}</div>`+
    `</div>`;
}
function dayPhotoItems(stops, today){
  const items=[];
  const add=stop=>{
    if(!stop) return;
    const src=(placePhotos(stop.name)||[])[0];
    if(!src) return;
    if(items.some(p=>p.src===src)) return;
    items.push({src, name:stop.name, stop});
  };
  if(selStop) add(selStop);
  (stops||[]).forEach(add);
  return items.slice(0,6);
}
function stopPlace(stop){
  const sub=stop.role==="start"?"start of the day":stop.role==="end"?"sleep tonight":"town on the route";
  return {kind:"town", name:stop.name, lat:stop.lat, lon:stop.lon, sub:sub, photo:stop.photo};
}
function selectStop(stop){
  if(!stop || stopEq(selStop, stop)){
    selStop=null;
    hidePlaceCard();
    paint();
    syncDayOverlay();
    return;
  }
  selStop={name:stop.name, lat:stop.lat, lon:stop.lon, km:stop.km, role:stop.role,
    photo:(placePhotos(stop.name)||[])[0]||null};
  paint();
  syncDayOverlay();
  showPlaceCard(stopPlace(selStop));
}
function syncDayOverlay(){
  document.querySelectorAll("#dayph .ph").forEach(el=>{
    const mine=!!(selStop && (el.dataset.name===selStop.name || (selStop.photo && el.dataset.src===selStop.photo)));
    el.classList.toggle("on", mine);
  });
  document.querySelectorAll(".waylist .way").forEach(el=>{
    const km=+el.dataset.km;
    el.classList.toggle("on", !!(selStop && Math.abs((selStop.km||0)-km)<0.8));
  });
  const sleep=document.getElementById("daysleep");
  if(sleep) sleep.classList.toggle("on", !!(selStop && selStop.role==="end"));
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
  stopHits=[];
  if(mode!=="ride" || !PLAN || PLAN===false) return;
  const days=planDays();
  const segs=activeSegs();
  const rideSegs=segs.filter(s=>!isSkipped(s.id));
  const todayRide=selDay?days.find(x=>x.n===selDay):null;
  const todayIds=new Set(todayRide?segsOnDay(todayRide, days).map(x=>x.seg.id):[]);
  rideSegs.forEach(seg=>{
    const pts=seg.line||[];
    if(pts.length<2) return;
    const ptsStr=linePts(pts);
    if(selDay){
      if(todayIds.has(seg.id)) return;
      addPoly(gRide, ptsStr, rideStroke(seg.band), ink(0.85), {opacity:".22"});
      return;
    }
    const w=ink(selSeg===seg.id?2.2:1.35);
    strokeOnMap(gRide, ptsStr, rideStroke(seg.band), w);
  });
  if(!selDay){
    const gapA=nodePoint(startId);
    const firstPt=rideSegs[0]&&rideSegs[0].line&&rideSegs[0].line[0];
    if(gapA && firstPt && (Math.abs(gapA[0]-firstPt[0])>0.04 || Math.abs(gapA[1]-firstPt[1])>0.04)){
      addPoly(gRide, linePts([gapA, firstPt]), "#c4b8a8", ink(1.1), {opacity:".5", "stroke-dasharray":"5 6"});
    }
  }
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
      addPoly(gGold, linePts(line), "#fffdf8", ink(3.1), {opacity:".92"});
      addPoly(gGold, linePts(line), DAY_LINE, ink(2.3));
    }
  }
  const labels=[];
  const c0=rideSegs[0]&&rideSegs[0].cand&&rideSegs[0].cand[0];
  const ends=travelEnds();
  const today=selDay?days.find(x=>x.n===selDay):null;
  const cues=today?dayCues(today, days).steps:[];
  if(selDay && today){
    const pack=mapLabelPack();
    cues.forEach(s=>{
      if(s.lat==null || s.lon==null) return;
      const q=xy(s.lat, s.lon);
      if(q[0]==null) return;
      const stop={name:s.name, lat:s.lat, lon:s.lon, km:s.km, role:s.role||s.kind};
      stopHits.push({x:q[0], y:q[1], stop});
      const on=stopEq(selStop, stop);
      const hit=document.createElementNS("http://www.w3.org/2000/svg","circle");
      hit.setAttribute("cx", q[0]); hit.setAttribute("cy", q[1]);
      hit.setAttribute("r", ink(14));
      hit.setAttribute("fill", "transparent");
      hit.style.cursor="pointer";
      hit.addEventListener("click",e=>{ e.stopPropagation(); selectStop(stop); });
      gT.appendChild(hit);
      const disc=document.createElementNS("http://www.w3.org/2000/svg","circle");
      disc.setAttribute("cx", q[0]); disc.setAttribute("cy", q[1]);
      disc.setAttribute("r", ink(on?8:6));
      disc.setAttribute("fill", on?"#c9a227":"#fffdf8");
      disc.setAttribute("stroke", "#c9a227");
      disc.setAttribute("stroke-width", ink(on?2.2:1.4));
      disc.style.cursor="pointer";
      disc.addEventListener("click",e=>{ e.stopPropagation(); selectStop(stop); });
      gT.appendChild(disc);
      const always=s.kind==="start" || s.kind==="end" || on;
      const lab=mapStopLabel(s.name, cues.map(o=>o.name));
      const pos=pack.take(q[0], q[1], lab, ink(on?9:8), always);
      if(!pos) return;
      const fs=ink(on?9:8);
      const labW=Math.max(ink(16), String(lab).length*fs*0.56);
      stopHits.push({x:pos.x, y:pos.y, w:labW, h:fs*1.35, stop});
      const tx=document.createElementNS("http://www.w3.org/2000/svg","text");
      tx.setAttribute("x", pos.x); tx.setAttribute("y", pos.y);
      tx.style.cursor="pointer";
      tx.setAttribute("font-size", ink(on?9:8));
      tx.setAttribute("font-weight", on?"700":"600");
      tx.setAttribute("fill", on?"#1c1916":"#6f675e");
      tx.setAttribute("stroke", "#fffdf8");
      tx.setAttribute("stroke-width", ink(2.2));
      tx.setAttribute("paint-order", "stroke");
      tx.setAttribute("stroke-linejoin", "round");
      tx.textContent=lab;
      tx.addEventListener("click",e=>{ e.stopPropagation(); selectStop(stop); });
      gT.appendChild(tx);
    });
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
    disc.setAttribute("cx", q[0]); disc.setAttribute("cy", q[1]); disc.setAttribute("r", ink(5));
    disc.setAttribute("fill","transparent");
    disc.style.cursor="pointer";
    disc.addEventListener("click",e=>{ e.stopPropagation(); showPlaceCard(hit); });
    const tx=document.createElementNS("http://www.w3.org/2000/svg","text");
    tx.setAttribute("x", q[0]+off); tx.setAttribute("y", q[1]-off);
    tx.setAttribute("class","townlab"); tx.setAttribute("pointer-events","none");
    tx.setAttribute("font-size", ink(8));
    tx.setAttribute("stroke", "#fffdf8");
    tx.setAttribute("stroke-width", ink(2.2));
    tx.setAttribute("paint-order", "stroke");
    tx.setAttribute("stroke-linejoin", "round");
    tx.textContent=showName(t.name);
    gT.appendChild(disc);
    gT.appendChild(tx);
  });
  const discR=ink(5.2);
  if(!selDay){
    const start=rideSegs[0]&&rideSegs[0].line&&rideSegs[0].line[0];
    if(start){
      const q=xy(start[0], start[1]);
      if(q[0]!=null){
        const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
        c.setAttribute("cx", q[0]); c.setAttribute("cy", q[1]); c.setAttribute("r", ink(4.2));
        c.setAttribute("fill", "#fffdf8");
        c.setAttribute("stroke", "#e24b2a");
        c.setAttribute("stroke-width", ink(1.6));
        c.style.cursor="pointer";
        c.addEventListener("click",e=>{
          e.stopPropagation();
          const d0=days.find(x=>x.mode!=="train");
          vbManual=false; selSeg=null; selStop=null;
          openRide(ride.id, d0?d0.n:1);
        });
        gD.appendChild(c);
      }
    }
    days.forEach(d=>{
      if(d.mode==="train" || d.lat==null) return;
      const q=xy(d.lat,d.lon);
      const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
      c.setAttribute("cx", q[0]); c.setAttribute("cy", q[1]); c.setAttribute("r", discR);
      c.setAttribute("fill", "#f0713f");
      c.style.cursor="pointer";
      c.addEventListener("click",e=>{ e.stopPropagation(); vbManual=false; selSeg=null; selStop=null; openRide(ride.id, d.n); });
      const tx=document.createElementNS("http://www.w3.org/2000/svg","text");
      tx.setAttribute("x", q[0]); tx.setAttribute("y", q[1]+ink(3.4));
      tx.setAttribute("text-anchor","middle"); tx.setAttribute("font-size", ink(9));
      tx.setAttribute("font-weight","700"); tx.setAttribute("fill","#fff"); tx.setAttribute("pointer-events","none");
      tx.textContent=d.n;
      gD.appendChild(c); gD.appendChild(tx);
    });
  }
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
        const kindLab=LAYER_LAB[k]||k;
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
  const on=mode==="ride" && PLAN && PLAN!==false && !!selDay && !filmVisible();
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
  let g='<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="bikeplanner"><metadata><name>'+esc(PLAN.name)+'</name></metadata>';
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
function kmlFor(days){
  let k='<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>'+esc(PLAN.name)+'</name>';
  let off=0;
  days.forEach(d=>{
    if(d.mode==="train") return;
    const line=(d.line&&d.line.length)?d.line:sliceLine(activeSegs().filter(s=>!isSkipped(s.id)), off, off+d.km);
    off+=d.km;
    const coords=(line||[]).map(p=>p[1]+","+p[0]+",0").join(" ");
    k+='<Placemark><name>Day '+d.n+': '+esc(d.frm)+' → '+esc(d.to)+'</name>'+
      '<Style><LineStyle><color>ff00bfff</color><width>4</width></LineStyle></Style>'+
      '<LineString><tessellate>1</tessellate><coordinates>'+coords+'</coordinates></LineString></Placemark>';
  });
  return k+'</Document></kml>';
}
function csvFor(days){
  const rows=[["day","from","to","mode","km","climb_m","effort","shops","beds","food","camps","baths","stations","toilets"]];
  days.forEach(d=>rows.push([d.n||"",d.frm,d.to,d.mode||"ride",d.km,d.climb||0,d.eff||"",d.shop||0,d.stay||0,d.eat||0,d.camp||0,d.bath||0,d.rail||0,d.wc||0]));
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
    r.addEventListener("click",()=>openRide(ride.id, d.n));
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
  const stops=onDay&&today?dayStops(today, days):[];
  const phItems=onDay&&today?dayPhotoItems(stops, today).slice(0,2):[];
  const daySegs=onDay&&today?segsOnDay(today, days):[];
  const charLine=onDay&&today?dayCharLine(today, days):"";
  const filmHtml=rideDays.map(d=>`<button type="button" class="tile" data-day="${d.n}">
      <span class="tile-n">${d.n}</span>
      <span class="tile-who">${d.frm} → ${d.to}</span>
      <span class="tile-km">${d.km} km · ${Math.round(d.eff||0)} eff</span>
      ${d.prof&&d.prof.length>1?`<svg class="spark" viewBox="0 0 300 26" preserveAspectRatio="none">${sparkPoly(d)}</svg>`:""}
    </button>`).join("");
  const filmBlock=rideDays.length>=1?`<div class="daydock hit" id="daydock">
      ${onDay&&today?dayCueHtml(today, days):""}
      <div class="filmwrap" id="filmwrap">
      <button type="button" class="tile tour-tile${!selDay?" on":""}" id="filmtour" title="Whole tour — edit start, end, and effort">
        <span class="tile-n tour-n">Tour</span>
        <span class="tile-who">All days</span>
        <span class="tile-km">${rideDays.length} d · ${st.km} km</span>
      </button>
      ${onDay&&today?`<button type="button" class="filmtog" id="filmtog" aria-controls="film">Day ${today.n} of ${rideDays.length}</button>`:""}
      <button type="button" class="film-nav" id="filmprev" aria-label="Previous day">‹</button>
      <div class="film-track" id="film">${filmHtml}</div>
      <button type="button" class="film-nav" id="filmnext" aria-label="Next day">›</button>
    </div>
    </div>`:`<div id="filmwrap" hidden></div>`;
  document.getElementById("head").innerHTML="";
  col.className="sheet";
  col.innerHTML=onDay?`
    <aside class="ctx-card hit" id="ctx">
      <button type="button" class="sheetback" id="dayback">‹ ${esc(t.name)}</button>
      <div class="ctxhead">
        <div class="tn"><span class="badge">${today?today.n:selDay}</span><h2>${today?today.frm+" → "+today.to:t.name}</h2></div>
        <button type="button" class="ctxfold" id="ctxfold" aria-controls="ctxbody">Details</button>
      </div>
      <div class="ctxbody" id="ctxbody">
      <div class="stats4">
        <div><b>${today?today.km:"—"}</b><span>km</span></div>
        <div><b>${today?Math.round(today.eff||today.climb||0).toLocaleString():"—"}</b><span>effort</span></div>
        <div><b>${today?today.stay||0:0}</b><span>beds</span></div>
      </div>
      <div class="profwrap">
        <svg viewBox="0 0 300 56" preserveAspectRatio="none"><g id="prof"></g></svg>
        <div class="profhi" id="profhi"></div><div class="proflo" id="proflo"></div>
      </div>
      ${charLine?`<p class="dayfacts">${esc(charLine)}</p>`:""}
      <div class="strip daystrip" id="daystrip" title="Friendliness on today's legs">${daySegs.map(({seg,km})=>`<i style="flex-grow:${Math.max(km,1)};background:${BAND[seg.band]||"#c4b8a8"}" title="${esc(showName(seg.frmName)+" → "+showName(seg.toName))}"></i>`).join("")}</div>
      <div class="phs" id="dayph"${phItems.length?"":" hidden"}>${phItems.map(p=>`<button type="button" class="ph${selStop&&(stopEq(selStop,p.stop)||selStop.photo===p.src)?" on":""}" data-name="${esc(p.name)}" data-src="${esc(p.src)}" style="background-image:url('${esc(p.src)}')"></button>`).join("")}</div>
      <button type="button" class="sleep${selStop&&selStop.role==="end"?" on":""}" id="daysleep">Sleep: ${esc(today?today.to:"")} · ${today?today.stay||0:0} beds</button>
      <div class="export"><div class="row">
        <button class="opt" id="gpx">GPX today</button>
        <button class="opt" id="kml" title="Import into Google My Maps">KML</button>
        <button class="opt" id="pdf">Print</button>
        <button class="opt" id="copylink">Copy link</button>
        <span class="ghost" id="expnote"></span>
      </div></div>
      </div>
    </aside>
    <div id="strip" hidden></div><div id="segcard" hidden></div>
    <select id="start" hidden></select><select id="end" hidden></select>
    <div id="dirrow" hidden></div><div id="forks" hidden></div><div id="forks-off" hidden></div>
    <div id="skips" hidden></div><div id="days" hidden></div>
    <input id="eff" type="hidden" value="${effort}"><input id="dtar" type="hidden" value="${dtar}">
    <span id="slv" hidden></span><span id="dlv" hidden></span><span id="vehnote" hidden></span>
        <button type="button" id="friendtog" hidden></button><button type="button" id="signedtog" hidden></button><button type="button" id="csv" hidden></button>
    <span id="warn" hidden></span>
    <details id="netforks" hidden></details>
    ${filmBlock}`:`
    <aside class="ctx-card hit" id="ctx">
      <div class="ctxhead">
        <div class="tn"><span class="badge">${t.num}</span><h2>${t.name}</h2>
          <span class="dl dl${d0}">${DNAME[d0]}</span></div>
        <button type="button" class="ctxfold" id="ctxfold" aria-controls="ctxbody">Details</button>
      </div>
      <p class="oneline">${ends.from} → ${ends.to} · ${rideDays.length} d · ${st.km} km · ${st.asc.toLocaleString()} m</p>
      <div class="ctxbody" id="ctxbody">
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
        <button class="opt" id="kml" title="Import into Google My Maps">KML</button>
        <button class="opt" id="csv">CSV</button>
        <button class="opt" id="pdf">Print</button>
        <button class="opt" id="copylink">Copy link</button>
        <span class="ghost" id="expnote"></span>
      </div></div>
      </div>
    </aside>
    ${filmBlock}
    <div id="days" hidden></div>`;
    drawProfile(onDay && today ? [today] : rideDays);
  bindCtxFold();
  bindCtxScrollHint();
  const edit=document.querySelector("details.edittrip");
  if(edit){
    edit.open=!!editOpen;
    edit.addEventListener("toggle",()=>{
      editOpen=edit.open;
      document.body.classList.toggle("editing", !selDay && edit.open);
    });
  }
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
    selDay=null; selSeg=null; selStop=null; vbManual=false; skipCache=null; draw();
  };
  endSel.onchange=()=>{
    endId=endSel.value;
    const i0=towns.findIndex(x=>x.id===startId), i1=towns.findIndex(x=>x.id===endId);
    if(i1<i0 || (i1===i0 && !loop)) startId=towns[0].id;
    selDay=null; selSeg=null; selStop=null; vbManual=false; skipCache=null; draw();
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
        reversed=!reversed; selDay=null; selSeg=null; selStop=null; vbManual=false; skipCache=null; draw();
      };
      dirrow.appendChild(b);
    });
  }
  document.getElementById("eff").oninput=e=>{ document.getElementById("slv").textContent=e.target.value; };
  document.getElementById("eff").onchange=e=>{ effort=+e.target.value; selDay=null; selStop=null; skipCache=null; draw(); };
  document.getElementById("dtar").oninput=e=>{ document.getElementById("dlv").textContent=+e.target.value?e.target.value+" days":"no limit"; };
  document.getElementById("dtar").onchange=e=>{ dtar=+e.target.value; selDay=null; selStop=null; skipCache=null; draw(); };
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
      skipCache=null; selDay=null; selStop=null; vbManual=false; draw();
    };
    skipBox.appendChild(b);
  });
  }
  const vnote=document.getElementById("vehnote");
  if(veh==="opium"){
    const n=((PLAN.segs||[]).concat(PLAN.altSegs||[])).filter(s=>s.mopedAlt).length;
    vnote.textContent=n
      ? "S-pedelec: a day is distance only. "+n+" segment"+(n===1?"":"s")+" follow"+(n===1?"s":"")+" the moped line (cycle-only paths dropped)."
      : "S-pedelec mode: a day is distance only (no climb penalty).";
  } else {
    vnote.textContent=veh==="ebike"?"E-bike mode: same roads as the bicycle, climbing counts a third, days capped at one battery.":"";
  }
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
      skipCache=null; selDay=null; selStop=null; vbManual=false; draw();
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
  const kmlBtn=document.getElementById("kml");
  if(kmlBtn) kmlBtn.onclick=()=>{
    const pack=onDay && today ? [today] : rideDays;
    const name=onDay && today ? (PLAN.id||"ride")+"-day"+today.n+".kml" : (PLAN.id||"ride")+".kml";
    download(name, kmlFor(pack), "application/vnd.google-earth.kml+xml");
    document.getElementById("expnote").textContent=onDay?"KML for today — import in Google My Maps.":"KML downloaded — import in Google My Maps.";
  };
  const csvBtn=document.getElementById("csv");
  if(csvBtn) csvBtn.onclick=()=>{ download((PLAN.id||"ride")+"-days.csv", csvFor(days), "text/csv"); document.getElementById("expnote").textContent="CSV downloaded."; };
  document.getElementById("pdf").onclick=()=>{ fillPrintSheet(); window.print(); };
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
          selDay=null; selSeg=null; selStop=null; vbManual=false; skipCache=null; draw();
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
  if(net){
    net.hidden=onDay || !offN;
    if(!net.hidden){
      net.open=!!netForksOpen;
      net.addEventListener("toggle",()=>{ netForksOpen=net.open; });
    }
  }
  const tourBtn=document.getElementById("filmtour");
  if(tourBtn){
    tourBtn.onclick=()=>{ vbManual=false; selSeg=null; selStop=null; openRide(ride.id, null); };
    tourBtn.classList.toggle("on", !selDay);
    tourBtn.setAttribute("aria-pressed", selDay?"false":"true");
  }
  const film=document.getElementById("film");
  if(film){
    film.querySelectorAll(".tile").forEach(btn=>{
      btn.onclick=()=>{
        vbManual=false; selSeg=null; selStop=null;
        openRide(ride.id, Number(btn.dataset.day));
      };
      btn.title=selDay===Number(btn.dataset.day)?"This day":"Open this day";
    });
    const prev=document.getElementById("filmprev");
    const next=document.getElementById("filmnext");
    if(prev) prev.onclick=()=>{
      if(selDay){ if(selDay>1){ vbManual=false; selSeg=null; selStop=null; openRide(ride.id, selDay-1); } }
      else filmStep(-1);
    };
    if(next) next.onclick=()=>{
      if(selDay){
        if(selDay<rideDays.length){ vbManual=false; selSeg=null; selStop=null; openRide(ride.id, selDay+1); }
      } else filmStep(1);
    };
    if(selDay) filmFocus=selDay;
    filmFocus=Math.min(Math.max(1, filmFocus||1), rideDays.length||1);
    syncFilm();
  }
  const filmtog=document.getElementById("filmtog");
  if(filmtog){
    filmtog.onclick=e=>{
      e.stopPropagation();
      filmOpen=!filmOpen;
      syncFilmCollapse();
      if(!vbManual) applyView();
      scheduleTiles();
    };
  }
  syncFilmCollapse();
  if(onDay){
    document.querySelectorAll("#dayph .ph").forEach(el=>{
      el.onclick=e=>{
        e.stopPropagation();
        const name=el.dataset.name;
        const stop=stops.find(s=>s.name===name);
        if(stop) selectStop(stop);
      };
    });
    document.querySelectorAll(".waylist .way").forEach(el=>{
      el.onclick=e=>{
        e.stopPropagation();
        const km=+el.dataset.km;
        const stop=stops.find(s=>Math.abs(s.km-km)<0.8);
        if(stop) selectStop(stop);
      };
    });
    const sleep=document.getElementById("daysleep");
    if(sleep) sleep.onclick=e=>{
      e.stopPropagation();
      const stop=stops.find(s=>s.role==="end");
      if(stop) selectStop(stop);
    };
    const dayback=document.getElementById("dayback");
    if(dayback) dayback.onclick=e=>{ e.stopPropagation(); goTour(); };
    document.querySelectorAll("#daycues .cue").forEach(el=>{
      el.onclick=e=>{
        e.stopPropagation();
        const lat=+el.dataset.lat, lon=+el.dataset.lon;
        const stop=stops.find(s=>s.name===el.dataset.name)
          || (lat && lon ? {name:el.dataset.name, lat, lon, km:+el.dataset.km, role:el.dataset.role||"via"} : null);
        if(stop) selectStop(stop);
      };
    });
  }
}
function selectSeg(s){
  if(!s){ selSeg=null; const c=document.getElementById("segcard"); if(c) c.hidden=true; vbManual=false; paint(); return; }
  if(selSeg===s.id) return;
  selSeg=s.id; selDay=null; selStop=null; vbManual=false;
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
  c.innerHTML=`<div class="schead"><b>${showName(s.frmName||s.frm)} → ${showName(s.toName||s.to)}</b><button type="button" class="scx" title="Whole tour">Tour</button></div>
    <div class="scmeta">${Math.round(s.km)} km · ${Math.round(s.ascent||0)} m climb</div>
    <div class="scbar"><i style="width:${r}%;background:#97C459"></i><i style="width:${bsy}%;background:#E24B4A"></i></div>
    <div class="scmeta">signed ${r}% · busy ${bsy}% · ${shops} shops · ${beds} beds · ${sights} sights</div>
    <div class="scbtns"><button class="opt" id="sHere">start here</button><button class="opt" id="eHere">end here</button></div>`;
  c.querySelector(".scx").onclick=e=>{ e.stopPropagation(); selectSeg(null); };
  c.querySelector("#sHere").onclick=()=>{ startId=s.frm; selSeg=null; selDay=null; selStop=null; vbManual=false; skipCache=null; draw(); };
  c.querySelector("#eHere").onclick=()=>{ endId=s.to; selSeg=null; selDay=null; selStop=null; vbManual=false; skipCache=null; draw(); };
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
  const tour=document.getElementById("filmtour");
  if(tour){
    tour.classList.toggle("on", !selDay);
    tour.setAttribute("aria-pressed", selDay?"false":"true");
  }
  film.querySelectorAll(".tile").forEach(b=>{
    const num=+b.dataset.day;
    const is=!!selDay && num===selDay;
    b.classList.toggle("on", is);
    if(num===(selDay||filmFocus)) on=b;
  });
  if(on){
    const left=on.offsetLeft-(film.clientWidth-on.offsetWidth)/2;
    film.scrollTo({left:Math.max(0,left), behavior:"smooth"});
  }
  const prev=document.getElementById("filmprev");
  const next=document.getElementById("filmnext");
  if(prev) prev.disabled=(selDay?selDay:filmFocus)<=1;
  if(next) next.disabled=!n || (selDay?selDay:filmFocus)>=n;
}
function sparkPoly(d){
  if(!d.prof||d.prof.length<2||!d.km) return "";
  const W=300,H=26, mx=Math.max.apply(null,d.prof.map(p=>p[1])), top=Math.max(100,mx);
  const pts=d.prof.map(p=>(p[0]/d.km*W).toFixed(1)+","+(H-2-(p[1]/top)*(H-6)).toFixed(1)).join(" ");
  return `<polyline points="0,${H-2} ${pts} ${W},${H-2}" fill="#f0713f" fill-opacity=".18" stroke="none"/>
    <polyline points="${pts}" fill="none" stroke="#f0713f" stroke-width="1.2"/>`;
}
function printRoot(){
  let el=document.getElementById("printsheet");
  if(!el){
    el=document.createElement("article");
    el.id="printsheet";
    el.setAttribute("aria-hidden","true");
    document.body.appendChild(el);
  }
  return el;
}
function printProfSvg(days, gold){
  const W=560,H=72;
  if(!days||!days.length) return "";
  if(days.length===1 && days[0].prof && days[0].prof.length>1){
    const d=days[0], pts=d.prof;
    let tot=d.km||0, lo=Infinity, hi=-Infinity;
    pts.forEach(q=>{ lo=Math.min(lo,q[1]); hi=Math.max(hi,q[1]); });
    if(!(tot>0 && hi>lo)) return "";
    const span=Math.max(hi-lo,80); lo=Math.max(0,hi-span);
    const dstr=pts.map(q=>(q[0]/tot*W).toFixed(1)+","+(6+(1-(q[1]-lo)/span)*(H-14)).toFixed(1)).join(" ");
    const col=gold?"#c9a227":"#f0713f";
    return `<svg class="print-prof" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <polyline points="0,${H} ${dstr} ${W},${H}" fill="${col}" fill-opacity=".22" stroke="none"/>
      <polyline points="${dstr}" fill="none" stroke="${col}" stroke-width="1.6"/>
    </svg><p class="print-hi">▲ ${Math.round(hi).toLocaleString()} m · ▼ ${Math.round(lo).toLocaleString()} m</p>`;
  }
  const pts=[]; let tot=0, lo=Infinity, hi=-Infinity;
  activeSegs().filter(s=>!isSkipped(s.id)).forEach(s=>{
    (s.prof||[]).forEach(q=>{ pts.push([tot+q[0], q[1]]); lo=Math.min(lo,q[1]); hi=Math.max(hi,q[1]); });
    tot+=s.km;
  });
  if(!(tot>0 && hi>lo && pts.length>1)) return "";
  const span=Math.max(hi-lo,150); lo=Math.max(0,hi-span);
  const dstr=pts.map(q=>(q[0]/tot*W).toFixed(1)+","+(6+(1-(q[1]-lo)/span)*(H-14)).toFixed(1)).join(" ");
  return `<svg class="print-prof" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <polyline points="0,${H} ${dstr} ${W},${H}" fill="#f0713f" fill-opacity=".2" stroke="none"/>
    <polyline points="${dstr}" fill="none" stroke="#f0713f" stroke-width="1.5"/>
  </svg><p class="print-hi">▲ ${Math.round(hi).toLocaleString()} m · ▼ ${Math.round(lo).toLocaleString()} m</p>`;
}
function printDayFig(d){
  const line=d&&d.line||[];
  if(line.length<2) return "";
  const days=planDays();
  const stops=dayStops(d, days);
  let minLat=Infinity,maxLat=-Infinity,minLon=Infinity,maxLon=-Infinity;
  const bump=(lat, lon)=>{
    if(lat==null || lon==null) return;
    if(lat<minLat) minLat=lat; if(lat>maxLat) maxLat=lat;
    if(lon<minLon) minLon=lon; if(lon>maxLon) maxLon=lon;
  };
  line.forEach(p=>bump(p[0], p[1]));
  stops.forEach(s=>bump(s.lat, s.lon));
  daySights(d, days).forEach(p=>bump(p.lat, p.lon));
  const W=560, H=200;
  const dx=Math.max(maxLon-minLon, 0.01), dy=Math.max(maxLat-minLat, 0.01);
  const pad=0.12;
  const x=lon=> ((lon-(minLon-dx*pad))/((dx*(1+2*pad))||1))*W;
  const y=lat=> ((maxLat+dy*pad-lat)/((dy*(1+2*pad))||1))*H;
  const pts=line.map(p=>x(p[1]).toFixed(1)+","+y(p[0]).toFixed(1)).join(" ");
  const boxes=[];
  const overlap=(a,b)=>!(a.x+a.w+6<b.x || b.x+b.w+6<a.x || a.y+a.h+4<b.y || b.y+b.h+4<a.y);
  const labelBits=[];
  const discBits=[];
  const addLabel=(stop, px, py, always)=>{
    const text=mapStopLabel(stop.name, stops.map(o=>o.name));
    const fs=(stop.role==="start"||stop.role==="end")?12:11;
    const tw=Math.max(24, text.length*fs*0.58);
    const th=fs+3;
    let lx=px+7, ly=py-7;
    if(lx+tw>W-4) lx=Math.max(4, px-tw-7);
    if(ly-th<4) ly=py+th+4;
    const box={x:lx, y:ly-th, w:tw, h:th};
    if(!always && boxes.some(b=>overlap(b, box))) return;
    if(lx<2 || lx+tw>W+8 || ly>H+8) { if(!always) return; }
    boxes.push(box);
    const fill=always?"#1c1916":"#6f675e";
    const wt=always?"700":"600";
    labelBits.push(`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="${fs}" font-weight="${wt}" fill="${fill}" font-family="Georgia,'Iowan Old Style',serif" stroke="#fffdf8" stroke-width="3.2" paint-order="stroke" stroke-linejoin="round">${esc(text)}</text>`);
  };
  stops.forEach(s=>{
    if(s.lat==null || s.lon==null) return;
    const px=x(s.lon), py=y(s.lat);
    const end=s.role==="start"||s.role==="end";
    const r=end?5.6:4.1;
    discBits.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="#fffdf8" stroke="#c9a227" stroke-width="${end?1.8:1.3}"/>`);
  });
  stops.filter(s=>s.role==="start"||s.role==="end").forEach(s=>{
    if(s.lat==null || s.lon==null) return;
    addLabel(s, x(s.lon), y(s.lat), true);
  });
  stops.filter(s=>s.role==="via").forEach(s=>{
    if(s.lat==null || s.lon==null) return;
    addLabel(s, x(s.lon), y(s.lat), false);
  });
  daySights(d, days).forEach(p=>{
    if(p.lat==null || p.lon==null) return;
    const px=x(p.lon), py=y(p.lat);
    const mne=p.kind==="mne";
    discBits.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.6" fill="${mne?"#97C459":"#6f675e"}" stroke="#fffdf8" stroke-width="0.6"/>`);
    const text=mapSightLabel(p);
    const fs=10;
    const tw=Math.max(24, text.length*fs*0.55);
    const th=fs+2;
    let lx=px+6, ly=py-5;
    if(lx+tw>W-4) lx=Math.max(4, px-tw-6);
    const box={x:lx, y:ly-th, w:tw, h:th};
    if(boxes.some(b=>overlap(b, box))) return;
    boxes.push(box);
    labelBits.push(`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="${fs}" font-style="${mne?"normal":"italic"}" font-weight="500" fill="${mne?"#3d6b1e":"#6f675e"}" font-family="Georgia,'Iowan Old Style',serif" stroke="#fffdf8" stroke-width="2.6" paint-order="stroke" stroke-linejoin="round">${esc(text)}</text>`);
  });
  return `<svg class="print-fig" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
    <rect width="${W}" height="${H}" fill="#fffdf8"/>
    <polyline points="${pts}" fill="none" stroke="#c9a227" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${discBits.join("")}
    ${labelBits.join("")}
  </svg>`;
}
function fillPrintSheet(){
  const ps=printRoot();
  if(mode!=="ride" || !ride || !PLAN || PLAN===false){
    ps.innerHTML=`<p class="print-kicker">${esc(PAPER.country)}</p><h1>${esc(PAPER.title)}</h1>
      <p class="print-meta">Open a trip, then print the tour or a day.</p>`;
    return;
  }
  const t=ride;
  const st=rideStats();
  const days=planDays();
  const rideDays=days.filter(d=>d.mode!=="train");
  const today=selDay?rideDays.find(d=>d.n===selDay):null;
  const ends=travelEnds();
  if(today){
    const stops=dayStops(today, days);
    const vias=stops.filter(s=>s.role==="via");
    const phItems=dayPhotoItems(stops, today);
    const daySegs=segsOnDay(today, days);
    const forkNote=dayForkNote(today, days);
    const cues=dayCues(today, days);
    const cuesPrint=cues.steps.length?`<div class="print-wayhead">${esc(cues.route||"Today")}</div><div class="print-way">${cues.steps.map(s=>`<span>${esc(s.name)}</span>`).join("")}</div>${cues.phrase?`<p class="print-gap">${esc(cues.phrase)}</p>`:""}`:(vias.length?`<div class="print-wayhead">On the way</div><div class="print-way">${vias.map(s=>`<span>${esc(s.name)}</span>`).join("")}</div>`:"");
    const eff=Math.round(today.eff||0);
    ps.innerHTML=`<p class="print-kicker">${esc(PAPER.country)} · ${esc(t.name)}</p>
      <h1>Day ${today.n}: ${esc(today.frm)} → ${esc(today.to)}</h1>
      <div class="print-facts">
        <div><b>${today.km}</b><span>km</span></div>
        <div><b>${eff.toLocaleString()}</b><span>effort</span></div>
        <div><b>${today.shop||0}</b><span>shops</span></div>
        <div><b>${today.stay||0}</b><span>beds</span></div>
      </div>
      ${printProfSvg([today], true)}
      <p class="print-gap">${dayGapLine(today)}</p>
      <div class="print-strip">${daySegs.map(({seg,km})=>`<i style="flex-grow:${Math.max(km,1)};background:${BAND[seg.band]||"#c4b8a8"}"></i>`).join("")}</div>
      ${printDayFig(today)}
      ${cuesPrint}
      <p class="print-sleep">Sleep: ${esc(today.to)} · ${today.stay||0} beds</p>
      ${phItems.length?`<div class="print-photos">${phItems.map(p=>`<img src="${esc(p.src)}" alt="${esc(p.name)}">`).join("")}</div>`:""}
      ${forkNote?`<p class="print-fork">${esc(forkNote)}</p>`:""}`;
    return;
  }
  ps.innerHTML=`<p class="print-kicker">${esc(PAPER.country)}</p>
    <h1>${esc(t.name)}</h1>
    <p class="print-meta">${esc(ends.from)} → ${esc(ends.to)} · ${rideDays.length} days · ${st.km} km · ${st.asc.toLocaleString()} m</p>
    <div class="print-facts">
      <div><b>${rideDays.length}</b><span>days</span></div>
      <div><b>${st.km}</b><span>km</span></div>
      <div><b>${st.asc.toLocaleString()}</b><span>m climbed</span></div>
    </div>
    ${printProfSvg(rideDays, false)}
    <ol class="print-days">${rideDays.map(d=>`<li><span class="n">${d.n}</span><span>${esc(d.frm)} → ${esc(d.to)}</span><span>${d.km} km · ${Math.round(d.climb||d.eff||0).toLocaleString()} m</span></li>`).join("")}</ol>`;
}

function sheet(){
  const head=document.getElementById("head");
  const col=document.getElementById("col");
  const plannerOn=mode==="ride" && PLAN && PLAN!==false && PLAN.id===ride.id;
  document.documentElement.classList.toggle("planner", plannerOn);
  document.body.classList.toggle("planner", plannerOn);
  document.body.classList.toggle("onday", plannerOn && !!selDay);
  document.body.classList.toggle("editing", plannerOn && !selDay && !!editOpen);
  if(mode==="network"){
    col.className="";
    const n=visible().length;
    head.innerHTML=`<a class="back" href="./">‹ Your Bike Route Planners</a>
      <p class="kicker">${PAPER.kicker(TRIPS.length)}</p>
      <h1>${PAPER.title}</h1>
      <p class="lede">${PAPER.lede}</p>
      <div class="chips" id="filters"></div>`;
    filterChips().forEach(([k,lab])=>{
      const b=document.createElement("button");
      const cta=k==="top"||k==="crossing";
      b.className="chip"+(cta?" cta":"")+(k==="top"?" cta-top":"")+(k==="crossing"?" cta-cross":"")+(filter===k?" on":"");
      b.textContent=lab;
      if(k==="top") b.title="The ranked rides from the guides";
      if(k==="crossing") b.title="The country-length crossings";
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
      el.onclick=()=>openRide(t.id);
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
  const gSearch="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p.nameLocal||p.name||lat.toFixed(5)+","+lon.toFixed(5));
  const ph=p.kind==="town"?(placePhotos(p.name)||[])[0]:"";
  el.hidden=false;
  el.innerHTML=
    '<button type="button" class="scx" id="placex" title="close">×</button>'+
    (ph?`<div class="placeph" style="background-image:url('${esc(ph)}')"></div>`:"")+
    "<b>"+esc(title)+"</b>"+
    (other?`<div class="ja">${esc(other)}</div>`:"")+
    (p.sub?`<div class="sub">${esc(p.sub)}</div>`:"")+
    '<div class="links">'+
      `<a target="_blank" rel="noopener" href="${osmMap}">OpenStreetMap pin ↗</a>`+
      (title==="Point on the route"?"":`<a target="_blank" rel="noopener" href="${gSearch}">Google Search ↗</a>`)+
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
function nearestStopHit(x, y, slop){
  let best=null, bd=slop;
  stopHits.forEach(h=>{
    const d=stopHitDist(h, x, y);
    if(d<bd){ bd=d; best=h.stop; }
  });
  return best;
}
function stopHitDist(h, x, y){
  if(h.w && h.h){
    const x0=h.x, x1=h.x+h.w, y1=h.y, y0=h.y-h.h;
    const dx=x<x0?x0-x:x>x1?x-x1:0;
    const dy=y<y0?y0-y:y>y1?y-y1:0;
    return Math.hypot(dx, dy);
  }
  return Math.hypot(h.x-x, h.y-y);
}
function tapMap(e){
  if(mode!=="ride" || !PLAN || PLAN===false) return;
  if(e.target.closest && e.target.closest("#place,#maptools,#maplayers,#mapback,#minimap,.ctx-card,.filmwrap,.daydock,.cuebar,.daybar,.filmtog")) return;
  const pt=svgPt(e.clientX, e.clientY);
  if(!pt) return;
  if(selDay){
    const svg=document.getElementById("map");
    const r=svg.getBoundingClientRect();
    const vb=(svg.getAttribute("viewBox")||VB0).split(/\s+/).map(Number);
    const pinSlop=28*vb[2]/Math.max(r.width,1);
    const stop=nearestStopHit(pt[0], pt[1], pinSlop);
    const fac=nearestPlace(pt[0], pt[1]);
    if(stop && fac && fac.kind && fac.kind!=="town"){
      let dStop=Infinity;
      stopHits.forEach(h=>{
        if(h.stop!==stop) return;
        dStop=Math.min(dStop, stopHitDist(h, pt[0], pt[1]));
      });
      const dFac=Math.hypot(fac.x-pt[0], fac.y-pt[1]);
      if(dFac<=dStop){ showPlaceCard(fac); return; }
    }
    if(stop){ selectStop(stop); return; }
    if(fac && fac.kind && fac.kind!=="town"){ showPlaceCard(fac); return; }
    if(selStop || placeOpen) selectStop(null);
    else hidePlaceCard();
    return;
  }
  const hit=nearestPlace(pt[0], pt[1]);
  if(hit){ showPlaceCard(hit); return; }
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
function mapChrome(el){
  return el && el.closest && el.closest("#place,#maptools,#maplayers,#mapback,#minimap,.ctx-card,.filmwrap,.daydock,.cuebar,.daybar,.filmtog");
}
function readVb(svg){
  return (svg.getAttribute("viewBox")||VB0).split(/\s+/).map(Number);
}
function rideMapOn(){
  return mode==="ride" && PLAN && PLAN!==false;
}

let mapDrag=null;
const mapPtrs=new Map();
let panMoved=false;
let swallowClick=false;
let awaitingTap=false;

function endMapGesture(){
  if(!mapDrag && mapPtrs.size===0) return;
  mapDrag=null;
  mapPtrs.clear();
  document.getElementById("stage").classList.remove("dragging");
  if(panMoved){
    paintRide();
    paintMini();
    scheduleTiles();
  }
}

function pinchMid(){
  if(mapPtrs.size<2) return null;
  const pts=[...mapPtrs.values()];
  const dx=pts[1].x-pts[0].x, dy=pts[1].y-pts[0].y;
  return {
    x:(pts[0].x+pts[1].x)/2,
    y:(pts[0].y+pts[1].y)/2,
    dist:Math.hypot(dx, dy)||1
  };
}

document.getElementById("stage").addEventListener("pointerdown", e=>{
  if(!rideMapOn()) return;
  if(mapChrome(e.target)) return;
  if(e.pointerType==="mouse" && e.button!==0) return;
  mapPtrs.set(e.pointerId, {x:e.clientX, y:e.clientY});
  const svg=document.getElementById("map");
  if(!svg) return;
  if(mapPtrs.size===1){
    panMoved=false;
    awaitingTap=true;
    swallowClick=false;
    mapDrag={x:e.clientX, y:e.clientY, vb:readVb(svg), id:e.pointerId};
    document.getElementById("stage").classList.add("dragging");
    try{ e.currentTarget.setPointerCapture(e.pointerId); }catch(err){}
  } else {
    mapDrag={pinch:pinchMid(), vb:readVb(svg)};
  }
}, {passive:true});

document.getElementById("stage").addEventListener("pointermove", e=>{
  if(!rideMapOn()) return;
  if(!mapPtrs.has(e.pointerId) && !mapDrag) return;
  if(mapPtrs.has(e.pointerId)) mapPtrs.set(e.pointerId, {x:e.clientX, y:e.clientY});
  const svg=document.getElementById("map");
  if(!svg || !mapDrag) return;
  if(mapDrag.pinch && mapPtrs.size>=2){
    const now=pinchMid();
    if(!now) return;
    e.preventDefault();
    const scale=mapDrag.pinch.dist/now.dist;
    const vb=mapDrag.vb;
    const r=svg.getBoundingClientRect();
    const mx=vb[0]+(mapDrag.pinch.x-r.left)/r.width*vb[2];
    const my=vb[1]+(mapDrag.pinch.y-r.top)/r.height*vb[3];
    let w=Math.min(Math.max(vb[2]*scale, 16), W*1.6);
    let h=w*(H/W);
    const nx=mx-(now.x-r.left)/r.width*w;
    const ny=my-(now.y-r.top)/r.height*h;
    setViewBox(svg, nx, ny, w, h);
    panMoved=true;
    return;
  }
  if(!panMode && mapPtrs.size<2) return;
  const dx=e.clientX-mapDrag.x, dy=e.clientY-mapDrag.y;
  if(!panMoved && Math.hypot(dx, dy)<8) return;
  e.preventDefault();
  panMoved=true;
  const r=svg.getBoundingClientRect();
  const vb=mapDrag.vb;
  const x=vb[0]-dx/Math.max(r.width,1)*vb[2];
  const y=vb[1]-dy/Math.max(r.height,1)*vb[3];
  setViewBox(svg, x, y, vb[2], vb[3]);
}, {passive:false});

["pointerup","pointercancel","lostpointercapture"].forEach(ev=>{
  document.getElementById("stage").addEventListener(ev, e=>{
    if(!mapPtrs.has(e.pointerId) && !(mapDrag && mapDrag.id===e.pointerId)) return;
    const last=mapPtrs.size<=1;
    const tap=ev==="pointerup" && !panMoved && last;
    mapPtrs.delete(e.pointerId);
    if(mapPtrs.size===0){
      endMapGesture();
      if(ev!=="lostpointercapture") awaitingTap=false;
    } else if(mapPtrs.size===1){
      const svg=document.getElementById("map");
      const left=[...mapPtrs.entries()][0];
      mapDrag={x:left[1].x, y:left[1].y, vb:svg?readVb(svg):null, id:left[0]};
    }
    if(tap){
      tapMap(e);
      swallowClick=true;
      awaitingTap=false;
    }
  });
});

document.getElementById("stage").addEventListener("pointerup", e=>{
  if(!awaitingTap) return;
  awaitingTap=false;
  if(panMoved || swallowClick) return;
  tapMap(e);
  swallowClick=true;
});

document.getElementById("stage").addEventListener("click", e=>{
  if(!swallowClick) return;
  swallowClick=false;
  e.preventDefault();
  e.stopPropagation();
}, true);

document.getElementById("map").addEventListener("click", e=>{
  if(panMoved || swallowClick){
    panMoved=false;
    swallowClick=false;
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  tapMap(e);
});

document.getElementById("mapback").onclick=goNetwork;
document.getElementById("vehbtn").onclick=()=>{
  const i=VEH_ORDER.indexOf(veh);
  setVeh(VEH_ORDER[(i+1)%VEH_ORDER.length]);
};
document.getElementById("langbtn").onclick=()=>{ lang=lang==="local"?"en":"local"; draw(); };
document.getElementById("fitbtn").onclick=()=>{
  if(ride) goTour();
  else applyView();
};
document.getElementById("zin").onclick=()=>bumpZoom(0.78);
document.getElementById("zout").onclick=()=>bumpZoom(1.22);
const panbtn=document.getElementById("panbtn");
if(panbtn) panbtn.onclick=()=>{
  panMode=!panMode;
  syncMapTools();
};
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
  if(mode==="ride" && PLAN && PLAN!==false){
    if(e.target.closest && e.target.closest("#place,#maptools,#maplayers,#mapback,#minimap,.ctx-card,.filmwrap,.daydock,.cuebar,.filmtog")) return;
    e.preventDefault();
    if(Date.now()<wheelLock) return;
    wheelLock=Date.now()+80;
    bumpZoom(e.deltaY>0?1.16:0.84);
    return;
  }
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
    if(selStop){ e.preventDefault(); selectStop(null); return; }
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
      if(selDay){ if(selDay>1){ vbManual=false; selSeg=null; selStop=null; openRide(ride.id, selDay-1); } }
      else filmStep(-1);
    } else if(e.key==="ArrowRight"){
      e.preventDefault();
      if(selDay){
        const n=planDays().filter(d=>d.mode!=="train").length;
        if(selDay<n){ vbManual=false; selSeg=null; selStop=null; openRide(ride.id, selDay+1); }
      } else filmStep(1);
    }
  }
});
window.addEventListener("hashchange", applyHash);
window.addEventListener("beforeprint", fillPrintSheet);
window.addEventListener("resize", ()=>{
  if(mode==="ride" && PLAN && PLAN!==false && !vbManual) applyView();
  if(document.getElementById("ctxfold")) bindCtxFold();
  syncFilmCollapse();
  bindCtxScrollHint();
  scheduleTiles();
});

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
    if(block.photoAliases) PAPER.photoAliases=Object.assign({}, PAPER.photoAliases||{}, block.photoAliases);
  }
  const foot=document.querySelector("footer");
  if(foot) foot.textContent=PAPER.footer;
  drawBase(land, water, atlas);
  applyHash();
  if(mode==="network") draw();
});

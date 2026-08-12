
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const state = JSON.parse(localStorage.getItem("pawpalState") || '{"pets":[],"activePet":null,"health":[],"events":[]}');
state.products ||= [];
state.placePrefs ||= {};
state.placeMemos ||= {};
state.placeReservations ||= [];
state.savedCoupons ||= [];
state.purchaseHistory ||= [];
state.emergencyProfiles ||= [];
state.lifeRecords ||= [];
state.foodProfiles ||= []; state.meals ||= [];


const DOC_DB_NAME="PawPalDocuments";
const DOC_DB_VERSION=1;
const DOC_STORE="documents";

function openDocDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DOC_DB_NAME,DOC_DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(DOC_STORE)){
        const store=db.createObjectStore(DOC_STORE,{keyPath:"id"});
        store.createIndex("petId","petId",{unique:false});
        store.createIndex("date","date",{unique:false});
      }
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function putDocument(doc){
  const db=await openDocDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(DOC_STORE,"readwrite");
    tx.objectStore(DOC_STORE).put(doc);
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}

async function getDocuments(){
  const db=await openDocDB();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(DOC_STORE,"readonly").objectStore(DOC_STORE).getAll();
    req.onsuccess=()=>{db.close();resolve(req.result||[]);};
    req.onerror=()=>{db.close();reject(req.error);};
  });
}

async function getDocument(id){
  const db=await openDocDB();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(DOC_STORE,"readonly").objectStore(DOC_STORE).get(id);
    req.onsuccess=()=>{db.close();resolve(req.result);};
    req.onerror=()=>{db.close();reject(req.error);};
  });
}

async function removeDocument(id){
  const db=await openDocDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(DOC_STORE,"readwrite");
    tx.objectStore(DOC_STORE).delete(id);
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}

const ALBUM_STORE="album";

function openPawDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open("PawPalMedia",1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(ALBUM_STORE)){
        const store=db.createObjectStore(ALBUM_STORE,{keyPath:"id"});
        store.createIndex("petId","petId",{unique:false});
        store.createIndex("date","date",{unique:false});
      }
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function putAlbumItem(item){
  const db=await openPawDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(ALBUM_STORE,"readwrite");
    tx.objectStore(ALBUM_STORE).put(item);
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}
async function getAlbumItems(){
  const db=await openPawDB();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(ALBUM_STORE,"readonly").objectStore(ALBUM_STORE).getAll();
    req.onsuccess=()=>{db.close();resolve(req.result||[]);};
    req.onerror=()=>{db.close();reject(req.error);};
  });
}
async function removeAlbumItem(id){
  const db=await openPawDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(ALBUM_STORE,"readwrite");
    tx.objectStore(ALBUM_STORE).delete(id);
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}



const samplePlaces = [
  {id:"sakura-vet",recommended:true,coupon:{title:"初回相談 10%OFF",code:"PAWPAL10",detail:"初回利用時に提示してください。"},name:"さくら動物病院",type:"病院",area:"東京都",city:"世田谷区",emoji:"🏥",note:"一般診療・予防接種",hours:"9:00〜12:00 / 16:00〜19:00",phone:"0312345678",address:"東京都世田谷区（サンプル）",url:"https://www.google.com/search?q="+encodeURIComponent("さくら動物病院 東京都")},
  {id:"happy-trim",recommended:true,coupon:{title:"トリミング 500円OFF",code:"PAW500",detail:"5,000円以上のメニューで利用できます。"},name:"ハッピートリミング",type:"トリミング",area:"神奈川県",city:"横浜市",emoji:"✂️",note:"小型犬・猫対応",hours:"10:00〜18:00",phone:"0451234567",address:"神奈川県横浜市（サンプル）",url:"https://www.google.com/search?q="+encodeURIComponent("ハッピートリミング 神奈川県")},
  {id:"sunny-hotel",name:"わんこホテル Sunny",type:"ホテル",area:"静岡県",city:"静岡市",emoji:"🏨",note:"一時預かり・宿泊",hours:"8:00〜20:00",phone:"0541234567",address:"静岡県静岡市（サンプル）",url:"https://www.google.com/search?q="+encodeURIComponent("わんこホテル Sunny 静岡県")},
  {id:"midori-vet",name:"みどり動物クリニック",type:"病院",area:"山梨県",city:"甲府市",emoji:"🏥",note:"犬・猫・小動物",hours:"9:00〜18:00",phone:"0551234567",address:"山梨県甲府市（サンプル）",url:"https://www.google.com/search?q="+encodeURIComponent("みどり動物クリニック 山梨県")},
  {id:"paw-spa",name:"Paw Spa",type:"トリミング",area:"長野県",city:"長野市",emoji:"🫧",note:"シャンプー・カット",hours:"10:00〜18:00",phone:"0261234567",address:"長野県長野市（サンプル）",url:"https://www.google.com/search?q="+encodeURIComponent("Paw Spa 長野県")}
];
let places = [...samplePlaces];
let nearbyPlacesLoaded = false;
let nearbyPlacesLoading = false;
let nearbyUserLocation = null;

function distanceKm(lat1, lon1, lat2, lon2){
  const R=6371, rad=v=>v*Math.PI/180;
  const dLat=rad(lat2-lat1), dLon=rad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function osmPlaceType(tags={}){
  if(tags.amenity==="veterinary") return {type:"病院",emoji:"🏥",note:"動物病院"};
  if(tags.shop==="pet_grooming" || tags.service==="pet_grooming") return {type:"トリミング",emoji:"✂️",note:"トリミング"};
  if(tags.amenity==="animal_boarding" || tags.amenity==="animal_breeding") return {type:"ホテル",emoji:"🏨",note:"ペットホテル・預かり"};
  if(tags.shop==="pet") return {type:"ペットショップ",emoji:"🛍️",note:"ペット用品・ペットショップ"};
  return null;
}

function osmAddress(tags={}){
  return [
    tags["addr:province"]||tags["addr:state"],
    tags["addr:city"]||tags["addr:town"]||tags["addr:village"],
    tags["addr:suburb"],
    tags["addr:street"],
    tags["addr:housenumber"]
  ].filter(Boolean).join(" ");
}

function osmElementToPlace(el){
  const tags=el.tags||{};
  const kind=osmPlaceType(tags);
  if(!kind) return null;
  const lat=Number(el.lat ?? el.center?.lat);
  const lon=Number(el.lon ?? el.center?.lon);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)) return null;
  const d=nearbyUserLocation ? distanceKm(nearbyUserLocation.lat,nearbyUserLocation.lon,lat,lon) : null;
  return {
    id:`osm-${el.type}-${el.id}`,
    name:tags.name||tags["name:ja"]||`${kind.note}（名称未登録）`,
    type:kind.type,
    area:tags["addr:province"]||tags["addr:state"]||"",
    city:tags["addr:city"]||tags["addr:town"]||tags["addr:village"]||"",
    emoji:kind.emoji,
    note:tags.description||kind.note,
    hours:tags.opening_hours||"営業時間未登録",
    phone:tags.phone||tags["contact:phone"]||"",
    address:osmAddress(tags)||"住所情報なし",
    url:tags.website||tags["contact:website"]||"",
    lat,lon,distance:d,
    source:"OpenStreetMap",
    wikidata:tags.wikidata||""
  };
}


const PAWPAL_CUSTOM_PLACES_KEY="pawpal_custom_places_v1";
const PAWPAL_ENRICH_CACHE_KEY="pawpal_place_enrich_cache_v1";

const PAWPAL_PLACE_OVERRIDES_KEY="pawpal_place_overrides_v1";

function getPlaceOverrides(){
  try{return JSON.parse(localStorage.getItem(PAWPAL_PLACE_OVERRIDES_KEY)||"{}")||{};}
  catch(e){return {};}
}
function savePlaceOverrides(o){
  localStorage.setItem(PAWPAL_PLACE_OVERRIDES_KEY,JSON.stringify(o||{}));
}
function placeStableKey(p){
  if(!p)return "";
  if(p.id)return String(p.id);
  return placeDedupeKey(p);
}
function applyPlaceOverrideToOne(p){
  if(!p)return p;
  const o=getPlaceOverrides()[placeStableKey(p)];
  if(!o)return p;
  ["name","type","address","phone","url","hours","note","recommended"].forEach(k=>{
    if(Object.prototype.hasOwnProperty.call(o,k))p[k]=o[k];
  });
  p.pawpalEdited=true;
  return p;
}
function applyAllPlaceOverrides(items=places){
  (items||[]).forEach(applyPlaceOverrideToOne);
  return items;
}
function storePlaceOverride(p,updates){
  const key=placeStableKey(p);
  if(!key)return;
  const all=getPlaceOverrides();
  all[key]={...(all[key]||{}),...updates,updatedAt:new Date().toISOString()};
  savePlaceOverrides(all);
}
function removePlaceOverride(p){
  const key=placeStableKey(p);
  const all=getPlaceOverrides();
  delete all[key];
  savePlaceOverrides(all);
}
function placeTypeEmoji(type){
  return type==="病院"?"🏥":
    type==="トリミング"?"✂️":
    type==="ホテル"?"🏨":
    type==="ペットショップ"?"🛍️":"🏪";
}


function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

function getCustomPlaces(){
  try{return JSON.parse(localStorage.getItem(PAWPAL_CUSTOM_PLACES_KEY)||"[]")||[];}
  catch(e){return [];}
}
function saveCustomPlaces(items){
  localStorage.setItem(PAWPAL_CUSTOM_PLACES_KEY,JSON.stringify(items||[]));
}
function normalizePlaceName(v){
  return String(v||"").toLowerCase()
    .replace(/[　\s]/g,"")
    .replace(/[・･\-‐‑–—ー]/g,"")
    .replace(/株式会社|有限会社|（株）|\(株\)/g,"");
}
function normalizePhone(v){
  return String(v||"").replace(/\D/g,"");
}
function placeDedupeKey(p){
  const phone=normalizePhone(p.phone);
  if(phone.length>=8)return "p:"+phone;
  const name=normalizePlaceName(p.name);
  if(Number.isFinite(p.lat)&&Number.isFinite(p.lon)){
    return `g:${name}:${p.lat.toFixed(3)}:${p.lon.toFixed(3)}`;
  }
  return `n:${name}:${String(p.address||"").replace(/\s/g,"")}`;
}
function mergePlaceData(base,extra){
  if(!extra)return base;
  const missing=v=>!v || /情報なし|未登録/.test(String(v));
  ["address","phone","url","hours","note","area","city"].forEach(k=>{
    if(missing(base[k]) && !missing(extra[k])) base[k]=extra[k];
  });
  if(extra.source && !String(base.source||"").includes(extra.source)){
    base.source=[base.source,extra.source].filter(Boolean).join(" + ");
  }
  return base;
}
function dedupePlaces(items){
  const map=new Map();
  items.forEach(p=>{
    const key=placeDedupeKey(p);
    if(map.has(key)) mergePlaceData(map.get(key),p);
    else map.set(key,{...p});
  });
  return [...map.values()];
}

function enrichCache(){
  try{return JSON.parse(localStorage.getItem(PAWPAL_ENRICH_CACHE_KEY)||"{}")||{};}
  catch(e){return {};}
}
function saveEnrichCache(c){
  try{localStorage.setItem(PAWPAL_ENRICH_CACHE_KEY,JSON.stringify(c));}catch(e){}
}


async function enrichFromWikipedia(items,lat,lon){
  try{
    const url=`https://ja.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=geosearch&ggsprimary=all&ggsnamespace=0&ggsradius=10000&ggslimit=50&ggscoord=${lat}|${lon}&prop=extracts|info&exintro=1&explaintext=1&inprop=url`;
    const res=await fetch(url);
    if(!res.ok)throw new Error("Wikipedia HTTP "+res.status);
    const data=await res.json();
    const pages=Object.values(data?.query?.pages||{});
    if(!pages.length)return items;

    const norm=s=>normalizePlaceName(s);
    items.forEach(p=>{
      const np=norm(p.name);
      if(!np)return;
      const match=pages.find(pg=>{
        const nt=norm(pg.title||"");
        return nt && (nt===np || nt.includes(np) || np.includes(nt));
      });
      if(!match)return;
      if((!p.note || p.note===p.type || /未登録/.test(String(p.note))) && match.extract){
        p.note=String(match.extract).slice(0,240);
      }
      if(!p.wikipediaUrl && match.fullurl)p.wikipediaUrl=match.fullurl;
      if(!String(p.source||"").includes("Wikipedia")){
        p.source=[p.source,"Wikipedia"].filter(Boolean).join(" + ");
      }
    });
  }catch(e){console.warn("Wikipedia補完",e);}
  return items;
}

async function enrichFromWikidata(items){
  const qids=[...new Set(items.map(x=>x.wikidata).filter(x=>/^Q\d+$/.test(x)))].slice(0,40);
  if(!qids.length)return items;
  try{
    const url="https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&props=claims&ids="+encodeURIComponent(qids.join("|"));
    const res=await fetch(url);
    if(!res.ok)throw new Error("Wikidata HTTP "+res.status);
    const data=await res.json();
    const entities=data.entities||{};
    const firstValue=(claims,pid)=>{
      const c=claims?.[pid]?.[0]?.mainsnak?.datavalue?.value;
      if(typeof c==="string")return c;
      if(c&&typeof c==="object") return c.text||c.value||"";
      return "";
    };
    items.forEach(p=>{
      if(!p.wikidata || !entities[p.wikidata])return;
      const claims=entities[p.wikidata].claims||{};
      const extra={
        url:firstValue(claims,"P856"),
        phone:firstValue(claims,"P1329"),
        address:firstValue(claims,"P6375"),
        source:"Wikidata"
      };
      mergePlaceData(p,extra);
    });
  }catch(e){console.warn("Wikidata補完",e);}
  return items;
}

async function enrichMissingAddresses(items){
  const cache=enrichCache();
  const targets=items
    .filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&(!p.address || p.address==="住所情報なし"))
    .sort((a,b)=>(a.distance??9999)-(b.distance??9999))
    .slice(0,8);
  for(const p of targets){
    const key=`${p.lat.toFixed(5)},${p.lon.toFixed(5)}`;
    if(cache[key]){
      mergePlaceData(p,cache[key]);
      continue;
    }
    try{
      const u=`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.lat}&lon=${p.lon}&zoom=18&addressdetails=1&accept-language=ja`;
      const res=await fetch(u,{headers:{"Accept":"application/json"}});
      if(res.ok){
        const d=await res.json();
        const a=d.address||{};
        const extra={
          address:d.display_name||"",
          area:a.province||a.state||"",
          city:a.city||a.town||a.village||a.ward||"",
          source:"Nominatim"
        };
        cache[key]=extra;
        mergePlaceData(p,extra);
        saveEnrichCache(cache);
      }
    }catch(e){console.warn("Nominatim補完",e);}
    await sleep(1100);
  }
  return items;
}

function customPlaceForNearby(p){
  const lat=Number(p.lat), lon=Number(p.lon);
  const x={...p,source:"PawPal独自登録",emoji:p.emoji||(
    p.type==="病院"?"🏥":p.type==="トリミング"?"✂️":p.type==="ホテル"?"🏨":"🛍️"
  )};
  if(Number.isFinite(lat)&&Number.isFinite(lon)){
    x.lat=lat;x.lon=lon;
    x.distance=nearbyUserLocation?distanceKm(nearbyUserLocation.lat,nearbyUserLocation.lon,lat,lon):null;
  }else{
    delete x.lat;delete x.lon;x.distance=null;
  }
  return x;
}

function mergeWithCustomPlaces(items){
  const custom=getCustomPlaces().map(customPlaceForNearby).filter(p=>{
    if(!nearbyUserLocation || !Number.isFinite(p.distance))return true;
    return p.distance<=50;
  });
  const merged=dedupePlaces([...items,...custom]);
  applyAllPlaceOverrides(merged);
  return merged;
}

async function fetchNearbyPlaces(lat,lon){
  const radius=50000;
  const query=`[out:json][timeout:35];
(
  nwr(around:${radius},${lat},${lon})["amenity"="veterinary"];
  nwr(around:${radius},${lat},${lon})["shop"="pet_grooming"];
  nwr(around:${radius},${lat},${lon})["service"="pet_grooming"];
  nwr(around:${radius},${lat},${lon})["amenity"="animal_boarding"];
  nwr(around:${radius},${lat},${lon})["amenity"="animal_breeding"];
  nwr(around:${radius},${lat},${lon})["shop"="pet"];
);
out center tags;`;
  const endpoints=[
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];
  let lastError=null;
  for(const endpoint of endpoints){
    try{
      const res=await fetch(endpoint,{
        method:"POST",
        headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
        body:"data="+encodeURIComponent(query)
      });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      return (data.elements||[]).map(osmElementToPlace).filter(Boolean);
    }catch(e){ lastError=e; }
  }
  throw lastError||new Error("検索に失敗しました");
}

function getBrowserLocation(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation) return reject(new Error("位置情報に対応していません"));
    navigator.geolocation.getCurrentPosition(
      p=>resolve({lat:p.coords.latitude,lon:p.coords.longitude}),
      reject,
      {enableHighAccuracy:true,timeout:12000,maximumAge:60000}
    );
  });
}

async function ensureNearbyPlaces(force=false){
  if(nearbyPlacesLoading || (nearbyPlacesLoaded && !force)) return;
  nearbyPlacesLoading=true;
  const status=$("#nearbyPlaceStatus");
  if(status) status.textContent="📍 現在地を確認しています…";
  try{
    nearbyUserLocation=await getBrowserLocation();
    if(status) status.textContent="🔎 現在地の近くのお店を検索しています…";
    let found=await fetchNearbyPlaces(nearbyUserLocation.lat,nearbyUserLocation.lon);
    found=dedupePlaces(found);
    if(status) status.textContent=`🔎 ${found.length}件を取得。住所・HP情報を補完しています…`;
    found=await enrichFromWikidata(found);
    found=await enrichFromWikipedia(found,nearbyUserLocation.lat,nearbyUserLocation.lon);
    found=await enrichMissingAddresses(found);
    const uniq=mergeWithCloudStores(mergeWithCustomPlaces(found));
    applyAllPlaceOverrides(uniq);
    uniq.sort((a,b)=>(a.distance??9999)-(b.distance??9999));
    if(uniq.length){
      places=uniq;
      applyRecommendedOverrides();
      nearbyPlacesLoaded=true;
      if(status) status.innerHTML=`📍 現在地から50km以内を近い順に表示中：<b>${uniq.length}件</b>`;
    }else{
      places=mergeWithCloudStores(mergeWithCustomPlaces([...samplePlaces]));
      applyRecommendedOverrides();
      if(status) status.textContent="近くのお店が見つからなかったため、サンプルを表示しています。";
    }
    renderPlaces();
  }catch(e){
    console.warn("nearby places",e);
    places=mergeWithCloudStores(mergeWithCustomPlaces([...samplePlaces]));
    applyRecommendedOverrides();
    if(status){
      status.textContent=e?.code===1
        ?"位置情報が許可されていません。Safariで位置情報を許可すると近い順に表示できます。"
        :"現在地検索に失敗したため、サンプルを表示しています。";
    }
    renderPlaces();
  }finally{
    nearbyPlacesLoading=false;
  }
}

const sampleProducts = [
  {jan:"4901234567890",name:"やさしいチキンフード",maker:"Paw Foods",type:"フード"},
  {jan:"4909876543210",name:"歯みがきガム",maker:"Happy Pet",type:"ケア用品"},
  {jan:"4987654321098",name:"肉球ケアクリーム",maker:"Mofu Lab",type:"ケア用品"},
  {jan:"4977777777777",name:"ふわふわ猫じゃらし",maker:"Nyan Works",type:"おもちゃ"}
];
if(!state.products.length){
  state.products = sampleProducts.map((p,i)=>({
    id:Date.now()+i,
    ...p,
    url:"",
    memo:"サンプル商品",
    favorite:false,
    createdAt:Date.now()+i
  }));
  localStorage.setItem("pawpalState",JSON.stringify(state));
}

function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function save(){ localStorage.setItem("pawpalState", JSON.stringify(state)); renderAll(); }
function petEmoji(type){ return type.includes("猫")?"🐱":type.includes("うさぎ")?"🐰":type.includes("鳥")?"🐦":type.includes("小動物")?"🐹":type.includes("犬")?"🐶":"🐾"; }
function activePet(){ return state.pets.find(p=>p.id===state.activePet) || state.pets[0]; }

function go(screen){
  $$(".screen").forEach(x=>x.classList.toggle("active", x.id===screen));
  $$(".nav-btn").forEach(x=>x.classList.toggle("active", x.dataset.screen===screen));
  window.scrollTo({top:0,behavior:"smooth"});
  if(screen==="places") setTimeout(()=>ensureNearbyPlaces(false),0);
}
$$(".nav-btn").forEach(b=>b.onclick=()=>go(b.dataset.screen));
$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));

let editingPetId = null;
let pendingPhoto = "";

function openPetDialog(p=null){
  editingPetId = p ? p.id : null;
  $("#petDialogTitle").textContent = p ? "✏️ プロフィール編集" : "🐾 ペットを登録";
  $("#petName").value = p?.name || "";
  $("#petType").value = p?.type || "🐶 犬";
  $("#petBirthday").value = p?.birthday || "";
  $("#petBreed").value = p?.breed || "";
  $("#petSex").value = p?.sex || "";
  $("#petNote").value = p?.note || "";
  pendingPhoto = p?.photo || "";
  renderPhotoPreview();
  $("#petDialog").showModal();
}

function renderPhotoPreview(){
  const box=$("#petPhotoPreview");
  if(pendingPhoto){
    box.innerHTML=`<img src="${pendingPhoto}" alt="ペット写真">`;
  }else{
    box.textContent=petEmoji($("#petType").value);
  }
}

function resizeImage(file, maxSize=700, quality=.82){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.width,h=img.height;
        if(w>h && w>maxSize){h=Math.round(h*maxSize/w);w=maxSize;}
        else if(h>=w && h>maxSize){w=Math.round(w*maxSize/h);h=maxSize;}
        const canvas=document.createElement("canvas");
        canvas.width=w;canvas.height=h;
        canvas.getContext("2d").drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL("image/jpeg",quality));
      };
      img.onerror=reject;
      img.src=reader.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

$("#addPetBtn").onclick=()=>openPetDialog();
$("#editPetBtn").onclick=()=>{
  const p=activePet();
  if(!p){alert("先にペットを登録してください🐾");return;}
  openPetDialog(p);
};
$("#petType").onchange=renderPhotoPreview;
$("#petPhoto").onchange=async(e)=>{
  const file=e.target.files?.[0];
  if(!file)return;
  try{
    pendingPhoto=await resizeImage(file);
    renderPhotoPreview();
  }catch{
    alert("写真を読み込めませんでした");
  }
};
$("#removePhotoBtn").onclick=()=>{
  pendingPhoto="";
  $("#petPhoto").value="";
  renderPhotoPreview();
};

$("#savePetBtn").onclick=(e)=>{
  e.preventDefault();
  const name=$("#petName").value.trim();
  if(!name) return;
  const data={
    name,
    type:$("#petType").value,
    birthday:$("#petBirthday").value,
    breed:$("#petBreed").value.trim(),
    sex:$("#petSex").value,
    note:$("#petNote").value.trim(),
    photo:pendingPhoto
  };

  if(editingPetId){
    const idx=state.pets.findIndex(p=>p.id===editingPetId);
    if(idx>=0) state.pets[idx]={...state.pets[idx],...data};
  }else{
    const p={id:Date.now(),...data};
    state.pets.push(p);
    state.activePet=p.id;
  }
  save();
  $("#petDialog").close();
  $("#petForm").reset();
  editingPetId=null;
  pendingPhoto="";
};

$("#deletePetBtn").onclick=()=>{
  const p=activePet();
  if(!p){alert("削除するペットがありません");return;}
  if(!confirm(`${p.name}ちゃんのプロフィールを削除しますか？
健康記録もこのペット分は削除されます。`)) return;
  const id=p.id;
  state.pets=state.pets.filter(x=>x.id!==id);
  state.health=state.health.filter(x=>x.petId!==id);
  state.activePet=state.pets[0]?.id || null;
  save();
};


$("#closePetDialogBtn").onclick=()=>{
  try{
    $("#petDialog").close();
  }catch(e){
    $("#petDialog").removeAttribute("open");
  }
  editingPetId=null;
  pendingPhoto="";
  try{$("#petForm").reset();}catch(e){}
};

$("#petDialog").addEventListener("click",(e)=>{
  if(e.target === $("#petDialog")){
    try{$("#petDialog").close();}catch(_){}
  }
});

$("#saveHealthBtn").onclick=()=>{
  const p=activePet(); if(!p){ alert("先にペットを登録してください🐾"); go("pets"); return; }
  state.health.unshift({id:Date.now(),petId:p.id,date:new Date().toISOString().slice(0,10),weight:$("#weightInput").value,condition:$("#conditionInput").value,memo:$("#healthMemo").value.trim()});
  $("#weightInput").value=""; $("#healthMemo").value=""; save();
};

$("#saveEventBtn").onclick=()=>{
  const title=$("#eventTitle").value.trim(),date=$("#eventDate").value;
  if(!title||!date){alert("タイトルと日付を入力してください🌷");return;}
  state.events.push({id:Date.now(),petId:$("#eventPet").value?Number($("#eventPet").value):null,type:$("#eventType").value,title,date,time:$("#eventTime").value||"",repeat:$("#eventRepeat").value||"none",memo:$("#eventMemo").value.trim(),reminder:Number($("#eventReminder").value),done:false});
  state.events.sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")));
  $("#eventTitle").value="";$("#eventTime").value="";$("#eventMemo").value="";$("#eventReminder").value="3";save();
};

function renderPets(){
  const box=$("#petCards"); box.innerHTML="";
  if(!state.pets.length){
    box.innerHTML='<div class="empty">まだ登録がありません。<br>「＋ 追加」から登録してね 🐾</div>';
    $("#petProfileBody").innerHTML='<div class="empty">ペットを登録するとプロフィールが表示されます 💗</div>';
    $("#editPetBtn").style.display="none";
    $("#deletePetBtn").style.display="none";
    return;
  }
  $("#editPetBtn").style.display="";
  $("#deletePetBtn").style.display="";
  state.pets.forEach(p=>{
    const d=document.createElement("button");
    d.className="pet-card"+(p.id===state.activePet?" active":"");
    const visual=p.photo
      ? `<img class="pet-card-photo" src="${p.photo}" alt="${p.name}">`
      : `<span class="pet-card-photo fallback">${petEmoji(p.type)}</span>`;
    d.innerHTML=`${visual}<b>${p.name}</b><small>${p.breed||p.type}</small>`;
    d.onclick=()=>{state.activePet=p.id;save();};
    box.appendChild(d);
  });
  renderPetProfile();
}

function renderPetProfile(){
  const p=activePet();
  if(!p){
    $("#petProfileBody").innerHTML='<div class="empty">ペットを登録するとプロフィールが表示されます 💗</div>';
    return;
  }
  const visual=p.photo
    ? `<img class="profile-photo" src="${p.photo}" alt="${p.name}">`
    : `<div class="profile-photo profile-photo-fallback">${petEmoji(p.type)}</div>`;
  $("#petProfileBody").innerHTML=`
    <div class="profile-hero">
      ${visual}
      <div>
        <div class="profile-name">${p.name}</div>
        <div class="profile-sub">${p.breed||p.type}</div>
      </div>
    </div>
    <div class="profile-info">
      <div class="info-box"><small>種類</small><b>${p.type}</b></div>
      <div class="info-box"><small>性別</small><b>${p.sex||"未設定"}</b></div>
      <div class="info-box"><small>誕生日</small><b>${p.birthday||"未設定"}</b></div>
      <div class="info-box"><small>健康記録</small><b>${state.health.filter(x=>x.petId===p.id).length}件</b></div>
    </div>
    ${p.note?`<div class="profile-note">💬 ${p.note}</div>`:""}
  `;
}

function renderHealth(){
  const p=activePet();
  const arr=state.health.filter(x=>!p || x.petId===p.id);

  const html=arr.length
    ? arr.map(x=>`<div class="item">
        <div>
          <b>${x.date} ・ ${x.condition}</b>
          <div class="meta">${x.weight?`体重 ${x.weight}kg ・ `:""}${x.memo||"メモなし"}</div>
        </div>
        <button class="health-delete-btn" onclick="deleteHealth(${x.id})">削除</button>
      </div>`).join("")
    : '<div class="empty">健康記録はまだありません 🩺</div>';

  $("#healthList").innerHTML=html;

  $("#recentHealth").innerHTML=arr.slice(0,2).map(x=>`
    <div class="item">
      <div><b>${x.condition}</b><div class="meta">${x.date}${x.weight?` ・ ${x.weight}kg`:""}</div></div>
      <span>🌿</span>
    </div>`).join("") || '<div class="empty">まだ記録がありません</div>';

  renderWeightChart(arr);
}

function renderWeightChart(arr){
  const canvas=$("#weightChart");
  const empty=$("#chartEmpty");
  const summary=$("#weightSummary");
  if(!canvas) return;

  const data=arr
    .filter(x=>x.weight && !Number.isNaN(Number(x.weight)))
    .map(x=>({date:x.date,weight:Number(x.weight),id:x.id}))
    .sort((a,b)=>a.date.localeCompare(b.date) || a.id-b.id)
    .slice(-12);

  const ctx=canvas.getContext("2d");
  const ratio=Math.max(1,window.devicePixelRatio||1);
  const cssW=canvas.clientWidth || 420;
  const cssH=220;
  canvas.width=Math.round(cssW*ratio);
  canvas.height=Math.round(cssH*ratio);
  ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.clearRect(0,0,cssW,cssH);

  if(data.length<2){
    empty.style.display="flex";
    summary.textContent=data.length===1?`${data[0].weight}kg`:"記録なし";
    return;
  }
  empty.style.display="none";

  const weights=data.map(d=>d.weight);
  const min=Math.min(...weights), max=Math.max(...weights);
  const pad=Math.max(.2,(max-min)*.25);
  const low=Math.max(0,min-pad), high=max+pad;

  const left=38,right=12,top=16,bottom=34;
  const plotW=cssW-left-right, plotH=cssH-top-bottom;
  const x=i=>left+(plotW*(i/(data.length-1)));
  const y=v=>top+plotH-(plotH*((v-low)/(high-low || 1)));

  ctx.lineWidth=1;
  ctx.strokeStyle="rgba(150,120,145,.18)";
  ctx.fillStyle="#8c7988";
  ctx.font="11px -apple-system, BlinkMacSystemFont, sans-serif";

  for(let i=0;i<4;i++){
    const gy=top+(plotH*i/3);
    ctx.beginPath(); ctx.moveTo(left,gy); ctx.lineTo(cssW-right,gy); ctx.stroke();
    const val=high-(high-low)*i/3;
    ctx.fillText(val.toFixed(1),3,gy+4);
  }

  ctx.strokeStyle="rgba(220,90,145,.75)";
  ctx.lineWidth=3;
  ctx.beginPath();
  data.forEach((d,i)=>{
    const px=x(i),py=y(d.weight);
    if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  });
  ctx.stroke();

  data.forEach((d,i)=>{
    const px=x(i),py=y(d.weight);
    ctx.beginPath();
    ctx.fillStyle="#fff";
    ctx.arc(px,py,5,0,Math.PI*2);
    ctx.fill();
    ctx.lineWidth=3;
    ctx.strokeStyle="rgba(220,90,145,.9)";
    ctx.stroke();

    if(i===0 || i===data.length-1){
      ctx.fillStyle="#7f6b7d";
      ctx.font="10px -apple-system, BlinkMacSystemFont, sans-serif";
      const label=d.date.slice(5).replace("-","/");
      ctx.fillText(label,Math.max(2,Math.min(cssW-38,px-14)),cssH-10);
    }
  });

  const first=data[0].weight,last=data[data.length-1].weight;
  const diff=last-first;
  const arrow=diff>0.05?"↗":diff<-0.05?"↘":"→";
  summary.textContent=`${last.toFixed(1)}kg ${arrow} ${diff>=0?"+":""}${diff.toFixed(1)}kg`;
}

let calendarCursor=new Date(),selectedCalendarDate="",futureOnly=false;
function evEmoji(t){return t?.includes("ワクチン")?"💉":t?.includes("お薬")?"💊":t?.includes("病院")?"🏥":t?.includes("トリミング")?"✂️":t?.includes("記念日")?"🎂":"📌"}
function evPet(e){return e.petId?(state.pets.find(p=>p.id===e.petId)?.name||"ペット"):"共通"}
function renderCalendar(){
 const g=$("#calendarGrid");if(!g)return;const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth();$("#calendarTitle").textContent=`${y}年 ${m+1}月`;
 const start=new Date(y,m,1-new Date(y,m,1).getDay()),today=new Date().toISOString().slice(0,10);g.innerHTML="";
 for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;const evs=state.events.filter(e=>e.date===ds),b=document.createElement("button");b.className="calendar-day"+(d.getMonth()!==m?" other":"")+(ds===today?" today":"")+(ds===selectedCalendarDate?" selected":"");b.innerHTML=`<span class="day-number">${d.getDate()}</span><div class="day-dots">${evs.slice(0,4).map(e=>`<span>${evEmoji(e.type)}</span>`).join("")}</div>`;b.onclick=()=>{selectedCalendarDate=ds;$("#eventDate").value=ds;renderEvents()};g.appendChild(b)}
}
function renderEventPetOptions(){const s=$("#eventPet");if(!s)return;const cur=s.value;s.innerHTML='<option value="">共通</option>'+state.pets.map(p=>`<option value="${p.id}">${petEmoji(p.type)} ${p.name}</option>`).join("");if([...s.options].some(o=>o.value===cur))s.value=cur;else if(activePet())s.value=activePet().id}
function renderMedList(){const today=new Date().toISOString().slice(0,10);let a=state.events.filter(e=>e.type?.includes("お薬")||e.type?.includes("ワクチン"));if(futureOnly)a=a.filter(e=>e.date>=today);$("#medList").innerHTML=a.length?a.map(e=>`<div class="med-card"><div class="med-card-top"><div><b>${evEmoji(e.type)} ${e.title}</b><div class="meta">${e.date}${e.time?` ${e.time}`:""} ・ ${evPet(e)}</div>${e.memo?`<div class="meta">📝 ${e.memo}</div>`:""}</div><button class="done-btn ${e.done?"done":""}" onclick="toggleEventDone(${e.id})">${e.done?"済み":"完了"}</button></div></div>`).join(""):'<div class="empty">薬・ワクチンの予定はまだありません 💊</div>'}

function daysUntil(dateStr){
  const now=new Date(); now.setHours(0,0,0,0);
  const target=new Date(dateStr+"T00:00:00");
  return Math.round((target-now)/86400000);
}
function renderReminderCenter(){
  const box=$("#reminderList"), status=$("#notificationStatus");
  if(!box || !status) return;

  let permission="unsupported";
  if("Notification" in window) permission=Notification.permission;
  status.textContent = permission==="granted"
    ? "ブラウザ通知：許可済み ✅"
    : permission==="denied"
      ? "ブラウザ通知：拒否されています"
      : permission==="default"
        ? "ブラウザ通知：未許可"
        : "この環境ではブラウザ通知に対応していません";

  const due=state.events
    .filter(e=>!e.done && Number(e.reminder ?? 3) >= 0)
    .map(e=>({...e,days:daysUntil(e.date),rem:Number(e.reminder ?? 3)}))
    .filter(e=>e.days>=0 && e.days<=e.rem)
    .sort((a,b)=>a.days-b.days);

  box.innerHTML=due.length?due.map(e=>{
    const when=e.days===0?"今日":`${e.days}日後`;
    return `<div class="reminder-card ${e.days===0?"urgent":""}">
      <div><span class="reminder-pill">${when}</span></div>
      <b>${evEmoji(e.type)} ${e.title}</b>
      <div class="meta">${e.date}${e.time?` ${e.time}`:""} ・ ${evPet(e)}</div>
      ${e.memo?`<div class="meta">📝 ${e.memo}</div>`:""}
    </div>`;
  }).join(""):'<div class="empty">今のところ通知する予定はありません 🌷</div>';

  if(permission==="granted"){
    due.forEach(e=>{
      const key=`pawpalNotified:${e.id}:${e.date}:${e.days}`;
      if(!localStorage.getItem(key)){
        try{
          new Notification(`PawPal ${e.days===0?"今日の予定":`${e.days}日後の予定`}`,{
            body:`${e.title} ・ ${evPet(e)}`,
            icon:""
          });
          localStorage.setItem(key,"1");
        }catch(_){}
      }
    });
  }
}

async function requestNotificationPermission(){
  if(!("Notification" in window)){
    alert("このブラウザでは通知機能に対応していません。アプリ内リマインダーは使えます。");
    return;
  }
  try{
    const p=await Notification.requestPermission();
    renderReminderCenter();
    if(p==="granted") alert("通知を許可しました 🔔");
  }catch{
    alert("通知許可を開けませんでした。アプリ内リマインダーは使えます。");
  }
}

function renderEvents(){renderEventPetOptions();renderCalendar();renderMedList();renderReminderCenter();let a=[...state.events];if(selectedCalendarDate)a=a.filter(e=>e.date===selectedCalendarDate);$("#eventList").innerHTML=a.length?a.map(e=>`<div class="item"><div><b>${evEmoji(e.type)} ${e.title}</b><div class="meta">${e.date}${e.time?` ${e.time}`:""} ・ ${evPet(e)}${e.done?" ・ ✅済み":""}</div></div><button class="text-btn" onclick="deleteEvent(${e.id})">削除</button></div>`).join(""):'<div class="empty">予定はまだありません 📅</div>';const t=new Date().toISOString().slice(0,10),todays=state.events.filter(e=>e.date===t);$("#todayList").innerHTML=todays.length?todays.map(e=>`<div class="item"><div><b>${evEmoji(e.type)} ${e.title}</b><div class="meta">${e.time||"今日"} ・ ${evPet(e)}</div></div><span>${e.done?"✅":"✨"}</span></div>`).join(""):'<div class="empty">今日はゆっくりできそうです ☕️</div>'}
window.deleteEvent=id=>{state.events=state.events.filter(e=>e.id!==id);save()};window.toggleEventDone=id=>{const e=state.events.find(x=>x.id===id);if(e){e.done=!e.done;save()}};
$("#prevMonthBtn").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);selectedCalendarDate="";renderEvents()};
$("#nextMonthBtn").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);selectedCalendarDate="";renderEvents()};
$("#showAllEventsBtn").onclick=()=>{selectedCalendarDate="";renderEvents()};
$("#showDueOnlyBtn").onclick=()=>{futureOnly=!futureOnly;$("#showDueOnlyBtn").textContent=futureOnly?"すべて":"今後だけ";renderMedList()};

window.deleteHealth=(id)=>{
  state.health=state.health.filter(x=>x.id!==id);
  save();
};

$("#clearHealthBtn").onclick=()=>{
  const p=activePet();
  if(!p){alert("ペットを登録してください🐾");return;}
  const count=state.health.filter(x=>x.petId===p.id).length;
  if(!count){alert("削除する健康記録がありません");return;}
  if(!confirm(`${p.name}ちゃんの健康記録 ${count}件をすべて削除しますか？`)) return;
  state.health=state.health.filter(x=>x.petId!==p.id);
  save();
};


let activePlaceFilters=new Set();
let currentPlaceId=null;

function placePref(id){
  state.placePrefs[id] ||= {favorite:false,visited:false};
  return state.placePrefs[id];
}


const PAWPAL_RECOMMENDED_KEY="pawpal_recommended_overrides_v1";

function getRecommendedOverrides(){
  try{return JSON.parse(localStorage.getItem(PAWPAL_RECOMMENDED_KEY)||"{}")||{};}
  catch(e){return {};}
}
function applyRecommendedOverrides(){
  const o=getRecommendedOverrides();
  places.forEach(p=>{
    if(Object.prototype.hasOwnProperty.call(o,p.id)) p.recommended=!!o[p.id];
  });
}
function setPlaceRecommended(id,value){
  const o=getRecommendedOverrides();
  o[id]=!!value;
  localStorage.setItem(PAWPAL_RECOMMENDED_KEY,JSON.stringify(o));
  const p=places.find(x=>x.id===id);
  if(p)p.recommended=!!value;
  renderPlaces();
  renderAdminRecommendedList();
  if(currentPlaceId===id){
    const banner=$("#placeRecommendedBanner");
    if(banner)banner.hidden=!(p&&p.recommended);
  }
  const msg=$("#adminSaveStatus");
  if(msg){
    msg.textContent=value ? "⭐ おすすめ店舗に設定しました" : "おすすめを解除しました";
    clearTimeout(window.__adminStatusTimer);
    window.__adminStatusTimer=setTimeout(()=>{if(msg)msg.textContent="";},1400);
  }
}

function renderCustomPlaceList(){
  const box=$("#customPlaceList");
  if(!box)return;
  const items=getCustomPlaces();
  box.innerHTML=items.length?items.map(p=>`
    <div class="admin-store-row">
      <div class="admin-store-info">
        <strong>${p.emoji||"🏪"} ${escapeHtml(p.name)}</strong>
        <span>${escapeHtml(p.type||"")} ・ ${escapeHtml(p.address||"住所未登録")}</span>
      </div>
      <button type="button" class="soft-btn" data-edit-custom="${p.id}">編集</button>
    </div>
  `).join(""):'<div class="empty">独自登録店舗はまだありません</div>';
  box.querySelectorAll("[data-edit-custom]").forEach(btn=>{
    btn.onclick=()=>openCustomPlaceForm(btn.dataset.editCustom);
  });
}

function openCustomPlaceForm(id=""){
  const items=getCustomPlaces();
  const p=items.find(x=>x.id===id)||null;
  $("#customPlaceModalTitle").textContent=p?"独自店舗を編集":"独自店舗を追加";
  $("#customPlaceId").value=p?.id||"";
  $("#customPlaceName").value=p?.name||"";
  $("#customPlaceType").value=p?.type||"病院";
  $("#customPlaceAddress").value=p?.address||"";
  $("#customPlacePhone").value=p?.phone||"";
  $("#customPlaceUrl").value=p?.url||"";
  $("#customPlaceHours").value=p?.hours||"";
  $("#customPlaceNote").value=p?.note||"";
  $("#customPlaceLat").value=Number.isFinite(Number(p?.lat))?p.lat:"";
  $("#customPlaceLon").value=Number.isFinite(Number(p?.lon))?p.lon:"";
  $("#deleteCustomPlaceBtn").hidden=!p;
  const m=$("#customPlaceModal");
  if(m){m.classList.add("open");m.setAttribute("aria-hidden","false");}
}
function closeCustomPlaceForm(){
  const m=$("#customPlaceModal");
  if(m){m.classList.remove("open");m.setAttribute("aria-hidden","true");}
}
function refreshPlacesWithCustom(){
  places=mergeWithCustomPlaces(places.filter(p=>p.source!=="PawPal独自登録"));
  applyRecommendedOverrides();
  places.sort((a,b)=>(a.distance??9999)-(b.distance??9999));
  renderPlaces();
  renderAdminRecommendedList();
  renderCustomPlaceList();
}
function saveCustomPlaceForm(){
  const name=$("#customPlaceName").value.trim();
  if(!name){alert("店名を入力してください");return;}
  const id=$("#customPlaceId").value||("custom-"+Date.now());
  const type=$("#customPlaceType").value;
  const emoji=type==="病院"?"🏥":type==="トリミング"?"✂️":type==="ホテル"?"🏨":"🛍️";
  const latVal=$("#customPlaceLat").value.trim(), lonVal=$("#customPlaceLon").value.trim();
  const item={
    id,name,type,emoji,
    address:$("#customPlaceAddress").value.trim()||"住所情報なし",
    phone:$("#customPlacePhone").value.trim(),
    url:$("#customPlaceUrl").value.trim(),
    hours:$("#customPlaceHours").value.trim()||"営業時間未登録",
    note:$("#customPlaceNote").value.trim()||type,
    lat:latVal===""?null:Number(latVal),
    lon:lonVal===""?null:Number(lonVal),
    area:"",city:""
  };
  let items=getCustomPlaces();
  const i=items.findIndex(x=>x.id===id);
  if(i>=0)items[i]=item; else items.push(item);
  saveCustomPlaces(items);
  closeCustomPlaceForm();
  refreshPlacesWithCustom();
}
function deleteCustomPlaceForm(){
  const id=$("#customPlaceId").value;
  if(!id)return;
  if(!confirm("この独自店舗を削除しますか？"))return;
  saveCustomPlaces(getCustomPlaces().filter(x=>x.id!==id));
  closeCustomPlaceForm();
  refreshPlacesWithCustom();
}


function adminPlaceHaystack(p){
  return [p.name,p.address,p.area,p.city,p.type,p.phone].filter(Boolean).join(" ").toLowerCase();
}
function renderAdminAllPlaces(){
  const box=$("#adminAllPlacesList");
  if(!box)return;
  const q=($("#adminPlaceSearch")?.value||"").trim().toLowerCase();
  const arr=[...places]
    .filter(p=>!q || adminPlaceHaystack(p).includes(q))
    .sort((a,b)=>(a.distance??9999)-(b.distance??9999));

  box.innerHTML=arr.length?arr.map(p=>`
    <div class="admin-store-row">
      <div class="admin-store-info">
        <strong>${p.emoji||placeTypeEmoji(p.type)} ${escapeHtml(p.name||"名称未登録")}</strong>
        <span>${escapeHtml(p.type||"")} ・ ${escapeHtml(p.address||p.area||"住所未登録")}</span>
        <span>${Number.isFinite(p.distance)?`約 ${p.distance.toFixed(1)} km ・ `:""}${p.cloudStoreId?"☁️ Supabase ・ ":""}${escapeHtml(p.source||"PawPal")}${p.isPublished===false?" ・ 🚫非公開":""}${p.pawpalEdited?" ・ ✏️修正済み":""}</span>
      </div>
      <button type="button" class="soft-btn" data-admin-edit-place="${escapeHtml(placeStableKey(p))}">編集</button>
    </div>
  `).join(""):'<div class="empty">該当する店舗はありません</div>';

  box.querySelectorAll("[data-admin-edit-place]").forEach(btn=>{
    btn.onclick=()=>openAdminEditPlace(btn.dataset.adminEditPlace);
  });
}
function findPlaceByStableKey(key){
  return places.find(p=>placeStableKey(p)===key);
}
function adminCloudStatus(text,type=""){
  const e=$("#adminCloudEditStatus");
  if(!e)return;
  e.className="cloud-message"+(type?` ${type}`:"");
  e.textContent=text||"";
}
function openAdminEditPlace(key){
  const p=findPlaceByStableKey(key);
  if(!p)return;
  $("#adminEditPlaceKey").value=key;
  $("#adminEditPlaceName").value=p.name||"";
  $("#adminEditPlaceType").value=["病院","トリミング","ホテル","ペットショップ","その他"].includes(p.type)?p.type:"その他";
  $("#adminEditPlacePrefecture").value=p.prefecture||p.area||"";
  $("#adminEditPlaceAddress").value=p.address||"";
  $("#adminEditPlacePhone").value=p.phone||"";
  $("#adminEditPlaceUrl").value=p.url||p.website||"";
  $("#adminEditPlaceHours").value=p.hours||"";
  $("#adminEditPlaceNote").value=p.note||"";
  $("#adminEditPlaceReservationUrl").value=p.reservationUrl||"";
  $("#adminEditPlaceCoupon").value=p.couponText||p.coupon?.detail||"";
  $("#adminEditPlaceRecommended").checked=!!p.recommended;
  $("#adminEditPlacePublished").checked=p.isPublished!==false;
  $("#adminEditPlaceSource").textContent=p.cloudStoreId
    ?`☁️ Supabase店舗マスタ ・ ${p.source||"取得元不明"}`
    :`取得元：${p.source||"不明"}`;
  $("#adminEditOriginalInfo").innerHTML=`
    <b>${p.cloudStoreId?"Supabase店舗":"外部取得情報"}の識別</b><br>
    ID：${escapeHtml(String(p.externalId||p.id||"なし"))}<br>
    ${Number.isFinite(p.lat)&&Number.isFinite(p.lon)?`位置：${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}<br>`:""}
    ${p.wikidata?`Wikidata：${escapeHtml(p.wikidata)}<br>`:""}
    ${p.wikipediaUrl?`Wikipedia：<a href="${escapeHtml(p.wikipediaUrl)}" target="_blank" rel="noopener">開く</a>`:""}
  `;
  const saveBtn=$("#saveAdminEditPlaceBtn");
  const resetBtn=$("#resetAdminEditPlaceBtn");
  const deleteBtn=$("#deleteCloudStoreBtn");
  if(p.cloudStoreId){
    if(saveBtn)saveBtn.textContent="☁️ Supabaseへ保存";
    if(resetBtn)resetBtn.hidden=true;
    if(deleteBtn)deleteBtn.hidden=false;
    adminCloudStatus("運営管理者ログイン中のみSupabaseへ保存・削除できます。");
  }else{
    if(saveBtn)saveBtn.textContent="💾 PawPal側に保存";
    if(resetBtn)resetBtn.hidden=false;
    if(deleteBtn)deleteBtn.hidden=true;
    adminCloudStatus("外部取得店舗はこの端末の上書き情報として保存します。");
  }
  const m=$("#adminEditPlaceModal");
  if(m){m.classList.add("open");m.setAttribute("aria-hidden","false");}
}
function closeAdminEditPlace(){
  const m=$("#adminEditPlaceModal");
  if(m){m.classList.remove("open");m.setAttribute("aria-hidden","true");}
}
function adminEditValues(p){
  return {
    name:$("#adminEditPlaceName").value.trim()||p.name,
    type:$("#adminEditPlaceType").value,
    prefecture:$("#adminEditPlacePrefecture").value.trim(),
    address:$("#adminEditPlaceAddress").value.trim(),
    phone:$("#adminEditPlacePhone").value.trim(),
    url:$("#adminEditPlaceUrl").value.trim(),
    hours:$("#adminEditPlaceHours").value.trim(),
    note:$("#adminEditPlaceNote").value.trim()||$("#adminEditPlaceType").value,
    reservationUrl:$("#adminEditPlaceReservationUrl").value.trim(),
    couponText:$("#adminEditPlaceCoupon").value.trim(),
    recommended:$("#adminEditPlaceRecommended").checked,
    isPublished:$("#adminEditPlacePublished").checked
  };
}
async function requireStoreAdminSession(){
  const client=await ensureStoreClient();
  const {data:{session},error}=await client.auth.getSession();
  if(error)throw error;
  if(!session)throw new Error("ADMIN_LOGIN_REQUIRED");
  return {client,session};
}
async function saveCloudEditedPlace(p,updates){
  const {client}=await requireStoreAdminSession();
  const payload={
    name:updates.name,
    primary_type:updates.type,
    prefecture:updates.prefecture,
    address:updates.address,
    website:updates.url,
    phone:updates.phone,
    business_hours:updates.hours,
    is_recommended:updates.recommended,
    coupon_text:updates.couponText,
    reservation_url:updates.reservationUrl,
    is_published:updates.isPublished,
    updated_at:new Date().toISOString()
  };
  const {error}=await client.from("pawpal_stores").update(payload).eq("id",p.cloudStoreId);
  if(error)throw error;
  adminCloudStatus("☁️ Supabaseへ保存しました。","success");
  await syncStoreMaster();
}
async function saveAdminEditedPlace(){
  const key=$("#adminEditPlaceKey").value;
  const p=findPlaceByStableKey(key);
  if(!p)return;
  const updates=adminEditValues(p);
  if(p.cloudStoreId){
    try{
      adminCloudStatus("保存中…");
      await saveCloudEditedPlace(p,updates);
      closeAdminEditPlace();
      alert("店舗情報をSupabaseへ保存しました。");
    }catch(e){
      console.error(e);
      if(String(e?.message||e)==="ADMIN_LOGIN_REQUIRED"){
        adminCloudStatus("管理者ログインが必要です。","error");
        alert("先にPawPal運営管理者としてログインしてください。");
      }else{
        adminCloudStatus("保存に失敗しました。","error");
        alert("Supabaseへの保存に失敗しました。");
      }
    }
    return;
  }
  const localUpdates={
    name:updates.name,type:updates.type,address:updates.address||"住所情報なし",
    phone:updates.phone,url:updates.url,hours:updates.hours||"営業時間未登録",
    note:updates.note,recommended:updates.recommended
  };
  storePlaceOverride(p,localUpdates);
  Object.assign(p,localUpdates,{pawpalEdited:true,emoji:placeTypeEmoji(localUpdates.type)});
  closeAdminEditPlace();
  renderPlaces();
  renderAdminRecommendedList();
  renderAdminAllPlaces();
  const s=$("#adminSaveStatus");
  if(s)s.textContent="✏️ 店舗情報をPawPal側に保存しました";
}
async function deleteCloudStore(){
  const key=$("#adminEditPlaceKey").value;
  const p=findPlaceByStableKey(key);
  if(!p?.cloudStoreId)return;
  if(!confirm(`「${p.name}」をSupabase店舗マスタから削除しますか？\nこの操作は元に戻せません。`))return;
  try{
    const {client}=await requireStoreAdminSession();
    adminCloudStatus("削除中…");
    const {error}=await client.from("pawpal_stores").delete().eq("id",p.cloudStoreId);
    if(error)throw error;
    closeAdminEditPlace();
    await syncStoreMaster();
    alert("店舗をSupabaseから削除しました。");
  }catch(e){
    console.error(e);
    if(String(e?.message||e)==="ADMIN_LOGIN_REQUIRED")alert("先に運営管理者としてログインしてください。");
    else alert("店舗の削除に失敗しました。");
  }
}
function resetAdminEditedPlace(){
  const key=$("#adminEditPlaceKey").value;
  const p=findPlaceByStableKey(key);
  if(!p || p.cloudStoreId)return;
  if(!confirm("この店舗のPawPal側の修正を解除しますか？"))return;
  removePlaceOverride(p);
  closeAdminEditPlace();
  const s=$("#adminSaveStatus");
  if(s)s.textContent="↩️ PawPal側の修正を解除しました。再検索すると外部情報に戻ります";
  ensureNearbyPlaces(true);
}

function renderAdminRecommendedList(){
  const box=$("#adminRecommendedList");
  if(!box)return;
  box.innerHTML=places.map(p=>`
    <div class="admin-store-row">
      <div class="admin-store-info">
        <strong>${p.emoji||"🏪"} ${p.name}</strong>
        <span>${p.area||""}${p.city?"・"+p.city:""} ・ ${p.type||""}</span>
      </div>
      <label class="admin-switch">
        <input type="checkbox" data-admin-rec="${p.id}" ${p.recommended?"checked":""}>
        <span class="admin-slider"></span>
      </label>
    </div>`).join("");
  box.querySelectorAll("[data-admin-rec]").forEach(el=>{
    el.addEventListener("change",()=>setPlaceRecommended(el.dataset.adminRec,el.checked));
  });
}
function openPawpalAdmin(){
  renderAdminRecommendedList();
  renderCustomPlaceList();
  renderAdminAllPlaces();
  const m=$("#pawpalAdminModal");
  if(!m)return;
  m.classList.add("open");
  m.setAttribute("aria-hidden","false");
}
function closePawpalAdmin(){
  const m=$("#pawpalAdminModal");
  if(!m)return;
  m.classList.remove("open");
  m.setAttribute("aria-hidden","true");
}
applyRecommendedOverrides();

function renderPlaces(){
  const q=($("#placeSearch")?.value||"").trim().toLowerCase();
  const arr=places.filter(x=>{
    const pref=placePref(x.id);
    const selected=[...activePlaceFilters];
    const selectedTypes=selected.filter(f=>["病院","トリミング","ホテル","ペットショップ"].includes(f));
    const wantFavorite=activePlaceFilters.has("お気に入り");
    const wantRecommended=activePlaceFilters.has("おすすめ");

    // 種類同士は OR、状態（お気に入り・おすすめ）は AND 条件
    const typeMatch=selectedTypes.length===0 || selectedTypes.includes(x.type);
    const favoriteMatch=!wantFavorite || !!pref.favorite;
    const recommendedMatch=!wantRecommended || !!x.recommended;
    const matchFilter=typeMatch && favoriteMatch && recommendedMatch;
    const text=`${x.name}${x.area}${x.city||""}${x.type}${x.note}`.toLowerCase();
    return matchFilter && (!q || text.includes(q));
  });

  $("#placeList").innerHTML=arr.length?arr.map(x=>{
    const pref=placePref(x.id);
    return `<div class="place-card ${x.recommended?"recommended":""}">
      <div class="place-card-row">
        <div class="place-card-main">
          <div class="place-card-emoji">${x.emoji}</div>
          <div>
            <div class="place-card-name">${escapeHtml(x.name)}</div>
            <div class="place-card-meta">${escapeHtml(x.area||x.city||"地域未登録")} ・ ${escapeHtml(x.note)}</div>
            ${Number.isFinite(x.distance)?`<div class="place-distance">📏 約 ${x.distance.toFixed(1)} km</div>`:""}
            <div class="place-card-badges">
              <span class="place-badge">${escapeHtml(x.type)}</span>
              ${x.recommended?'<span class="place-badge recommended">⭐ おすすめ</span>':""}
              ${pref.favorite?'<span class="place-badge favorite">❤️ お気に入り</span>':""}
              ${pref.visited?'<span class="place-badge visited">✅ 行った</span>':""}
            </div>
          </div>
        </div>
        <button class="place-open-btn" type="button" data-place-id="${x.id}" aria-label="${escapeHtml(x.name)}を開く">›</button>
      </div>
    </div>`;
  }).join(""):'<div class="empty">見つかりませんでした</div>';

  document.querySelectorAll(".place-open-btn").forEach(btn=>{
    btn.onclick=()=>openPlaceDetail(btn.dataset.placeId);
  });

  renderPlaceMemos();
}

function renderPlaceMemos(){
  const entries=Object.entries(state.placeMemos||{}).filter(([,memo])=>String(memo||"").trim());
  $("#placeMemoCount").textContent=`${entries.length}件`;
  $("#placeMemoList").innerHTML=entries.length?entries.map(([id,memo])=>{
    const p=places.find(x=>x.id===id);
    if(!p)return "";
    return `<div class="item">
      <div><b>${p.emoji} ${escapeHtml(p.name)}</b><div class="meta">${escapeHtml(memo)}</div></div>
      <button class="text-btn" onclick="openPlaceDetail('${id}')">開く</button>
    </div>`;
  }).join(""):'<div class="empty">お店メモはまだありません</div>';
}

function openPlaceDetail(id){
  const p=places.find(x=>x.id===id);
  if(!p)return;
  currentPlaceId=id;
  const pref=placePref(id);

  $("#placeDetailEmoji").textContent=p.emoji;
  $("#placeDetailName").textContent=p.name;
  $("#placeDetailMeta").textContent=`${p.area} ${p.city||""} ・ ${p.type}`;
  const homepageHtml=p.url
    ? `<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">${escapeHtml(p.url)}</a>`
    : "ホームページ情報なし";

  $("#placeDetailBody").innerHTML=`
    <b>${escapeHtml(p.note||p.type)}</b><br>
    📍 住所：${escapeHtml(p.address||"住所情報なし")}<br>
    🌐 ホームページ：${homepageHtml}<br>
    🕒 営業時間：${escapeHtml(p.hours||"営業時間未登録")}
    ${Number.isFinite(p.distance)?`<br>📏 現在地から約 ${p.distance.toFixed(1)} km`:""}
    ${p.source?`<div class="place-source">データ: OpenStreetMap contributors</div>`:""}
  `;

  $("#placePhoneBtn").href=p.phone?`tel:${p.phone}`:"#";
  $("#placePhoneBtn").style.display=p.phone?"":"none";
  $("#placeMapBtn").href=(Number.isFinite(p.lat)&&Number.isFinite(p.lon))
    ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name+" "+p.area+" "+(p.city||""))}`;
  $("#placeWebBtn").href=p.url||"#";
  $("#placeWebBtn").style.display=p.url?"":"none";

  $("#placeFavoriteBtn").textContent=pref.favorite?"💔 お気に入り解除":"❤️ お気に入り";
  $("#placeVisitedBtn").textContent=pref.visited?"↩️ 行ったを解除":"✅ 行った";
  $("#placeMemoInput").value=state.placeMemos[id]||"";
  $("#placeRecommendedBanner").hidden=!p.recommended;
  $("#placeCouponBtn").style.display=p.coupon?"":"none";


  $("#placeDetailModal").classList.add("open");
  $("#placeDetailModal").setAttribute("aria-hidden","false");
}

function closePlaceDetail(){
  $("#placeDetailModal").classList.remove("open");
  $("#placeDetailModal").setAttribute("aria-hidden","true");
  currentPlaceId=null;
}

window.openPlaceDetail=openPlaceDetail;

$("#placeSearch").oninput=renderPlaces;
$("#searchNearbyPlacesBtn").onclick=()=>ensureNearbyPlaces(true);
function syncPlaceFilterChips(){
  document.querySelectorAll(".place-filter").forEach(c=>{
    const f=c.dataset.filter;
    const on=f==="すべて" ? activePlaceFilters.size===0 : activePlaceFilters.has(f);
    c.classList.toggle("active",on);
    c.setAttribute("aria-pressed",on?"true":"false");
  });
}

document.querySelectorAll(".place-filter").forEach(c=>{
  c.onclick=()=>{
    const f=c.dataset.filter;

    if(f==="すべて"){
      activePlaceFilters.clear();
    }else if(activePlaceFilters.has(f)){
      activePlaceFilters.delete(f);
    }else{
      activePlaceFilters.add(f);
    }

    syncPlaceFilterChips();
    renderPlaces();
  };
});
syncPlaceFilterChips();

$("#placeFavoriteBtn").onclick=()=>{
  if(!currentPlaceId)return;
  const pref=placePref(currentPlaceId);
  pref.favorite=!pref.favorite;
  save();
  openPlaceDetail(currentPlaceId);
};

$("#placeVisitedBtn").onclick=()=>{
  if(!currentPlaceId)return;
  const pref=placePref(currentPlaceId);
  pref.visited=!pref.visited;
  save();
  openPlaceDetail(currentPlaceId);
};

$("#savePlaceMemoBtn").onclick=()=>{
  if(!currentPlaceId)return;
  const memo=$("#placeMemoInput").value.trim();
  if(memo)state.placeMemos[currentPlaceId]=memo;
  else delete state.placeMemos[currentPlaceId];
  save();
  $("#savePlaceMemoBtn").textContent="✅ 保存しました";
  setTimeout(()=>$("#savePlaceMemoBtn").textContent="💾 メモを保存",900);
};


function openReservation(){
  if(!currentPlaceId)return;
  const p=places.find(x=>x.id===currentPlaceId);if(!p)return;
  $("#reservationPlaceName").textContent=p.name;
  $("#reservationDate").value="";
  $("#reservationTime").value="";
  $("#reservationNote").value="";
  const rm=$("#reservationModal"); if(!rm)return; rm.classList.add("open"); rm.setAttribute("aria-hidden","false");
}
function closeReservation(){
  const rm=$("#reservationModal"); if(!rm)return; rm.classList.remove("open"); rm.setAttribute("aria-hidden","true");
}
function openCoupon(){
  if(!currentPlaceId)return;
  const p=places.find(x=>x.id===currentPlaceId);if(!p||!p.coupon)return;
  $("#couponPlaceName").textContent=p.name;
  $("#couponBody").innerHTML=`
    <div class="coupon-title">${escapeHtml(p.coupon.title)}</div>
    <div>${escapeHtml(p.coupon.detail||"")}</div>
    <div class="coupon-code">${escapeHtml(p.coupon.code)}</div>
    <div class="meta">店頭提示を想定したサンプルクーポンです。</div>
  `;
  const cm=$("#couponModal"); if(!cm)return; cm.classList.add("open"); cm.setAttribute("aria-hidden","false");
}
function closeCoupon(){
  const cm=$("#couponModal"); if(!cm)return; cm.classList.remove("open"); cm.setAttribute("aria-hidden","true");
}

bindClick("#placeReserveBtn",openReservation);
bindClick("#placeCouponBtn",openCoupon);

if($("#saveReservationBtn")) $("#saveReservationBtn").onclick=()=>{
  if(!currentPlaceId)return;
  const p=places.find(x=>x.id===currentPlaceId);if(!p)return;
  const date=$("#reservationDate").value;
  const time=$("#reservationTime").value;
  const note=$("#reservationNote").value.trim();
  if(!date){
    $("#saveReservationBtn").textContent="⚠️ 希望日を選んでください";
    setTimeout(()=>$("#saveReservationBtn").textContent="📅 予約希望を保存",1200);
    return;
  }
  state.placeReservations.push({
    id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())),
    placeId:p.id,placeName:p.name,date,time,note,
    createdAt:new Date().toISOString(),status:"下書き"
  });
  save();
  $("#saveReservationBtn").textContent="✅ 保存しました";
  setTimeout(()=>{closeReservation();$("#saveReservationBtn").textContent="📅 予約希望を保存";},900);
};

if($("#useCouponBtn")) $("#useCouponBtn").onclick=()=>{
  if(!currentPlaceId)return;
  const p=places.find(x=>x.id===currentPlaceId);if(!p||!p.coupon)return;
  const exists=state.savedCoupons.some(x=>x.placeId===p.id&&x.code===p.coupon.code);
  if(!exists){
    state.savedCoupons.push({
      placeId:p.id,placeName:p.name,title:p.coupon.title,
      code:p.coupon.code,savedAt:new Date().toISOString()
    });
    save();
  }
  $("#useCouponBtn").textContent="✅ 保存しました";
  setTimeout(()=>$("#useCouponBtn").textContent="🎟️ クーポンを保存",900);
};

bindClick("#closeReservationBtn",closeReservation);
bindClick("#closeReservationBottomBtn",closeReservation);
bindEvent("#reservationModal","click",e=>{if(e.target.id==="reservationModal")closeReservation();});

bindClick("#closeCouponBtn",closeCoupon);
bindClick("#closeCouponBottomBtn",closeCoupon);
bindEvent("#couponModal","click",e=>{if(e.target.id==="couponModal")closeCoupon();});

bindClick("#closePlaceDetailBtn",closePlaceDetail);
bindClick("#closePlaceDetailBottomBtn",closePlaceDetail);
bindEvent("#placeDetailModal","click",e=>{if(e.target.id==="placeDetailModal")closePlaceDetail();});



let editingProductId=null;
let favoriteOnly=false;

function normalizeJan(v){
  return String(v||"").replace(/\D/g,"").slice(0,14);
}
function getProduct(id){
  return state.products.find(p=>p.id===id);
}
function lastPurchaseForProduct(id){
  return state.purchaseHistory
    .filter(x=>x.productId===id)
    .sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||b.id-a.id)[0];
}
function resetProductForm(){
  editingProductId=null;
  $("#productFormTitle").textContent="＋ 商品を登録";
  $("#cancelProductEditBtn").style.display="none";
  $("#saveProductBtn").textContent="💾 商品を保存";
  $("#productJan").value="";
  $("#productName").value="";
  $("#productMaker").value="";
  $("#productType").value="フード";
  $("#productUrl").value="";
  $("#productMemo").value="";
  $("#productFavorite").checked=false;
}
function loadProductForEdit(id){
  const p=getProduct(id);if(!p)return;
  editingProductId=id;
  $("#productFormTitle").textContent="✏️ 商品を編集";
  $("#cancelProductEditBtn").style.display="";
  $("#saveProductBtn").textContent="💾 変更を保存";
  $("#productJan").value=p.jan||"";
  $("#productName").value=p.name||"";
  $("#productMaker").value=p.maker||"";
  $("#productType").value=p.type||"その他";
  $("#productUrl").value=p.url||"";
  $("#productMemo").value=p.memo||"";
  $("#productFavorite").checked=!!p.favorite;
  go("products");
  window.scrollTo({top:280,behavior:"smooth"});
}
$("#cancelProductEditBtn").onclick=resetProductForm;

$("#productJan").oninput=e=>e.target.value=normalizeJan(e.target.value);
$("#janInput").oninput=e=>e.target.value=normalizeJan(e.target.value);

$("#saveProductBtn").onclick=()=>{
  const jan=normalizeJan($("#productJan").value);
  const name=$("#productName").value.trim();
  const maker=$("#productMaker").value.trim();
  if(!jan||jan.length<8){alert("JANコードを8〜14桁で入力してください");return;}
  if(!name){alert("商品名を入力してください");return;}

  const duplicate=state.products.find(p=>p.jan===jan&&p.id!==editingProductId);
  if(duplicate){
    alert(`このJANコードは「${duplicate.name}」で登録済みです。`);
    return;
  }

  const data={
    jan,
    name,
    maker,
    type:$("#productType").value,
    url:$("#productUrl").value.trim(),
    memo:$("#productMemo").value.trim(),
    favorite:$("#productFavorite").checked
  };

  if(editingProductId){
    const idx=state.products.findIndex(p=>p.id===editingProductId);
    if(idx>=0)state.products[idx]={...state.products[idx],...data,updatedAt:Date.now()};
  }else{
    state.products.unshift({id:Date.now(),...data,createdAt:Date.now()});
  }
  resetProductForm();
  save();
};

window.editProduct=id=>loadProductForEdit(id);

window.deleteProduct=id=>{
  const p=getProduct(id);if(!p)return;
  if(!confirm(`「${p.name}」を削除しますか？\n購入履歴も一緒に削除します。`))return;
  state.products=state.products.filter(x=>x.id!==id);
  state.purchaseHistory=state.purchaseHistory.filter(x=>x.productId!==id);
  if(editingProductId===id)resetProductForm();
  save();
};

window.toggleProductFavorite=id=>{
  const p=getProduct(id);if(!p)return;
  p.favorite=!p.favorite;
  save();
};

window.showPurchaseForm=id=>{
  const el=document.querySelector(`[data-purchase-form="${id}"]`);
  if(!el)return;
  el.style.display=el.style.display==="grid"?"none":"grid";
};

window.savePurchase=id=>{
  const p=getProduct(id);if(!p)return;
  const date=document.querySelector(`[data-buy-date="${id}"]`)?.value||new Date().toISOString().slice(0,10);
  const price=Number(document.querySelector(`[data-buy-price="${id}"]`)?.value)||0;
  const qty=Math.max(1,Number(document.querySelector(`[data-buy-qty="${id}"]`)?.value)||1);
  const shop=document.querySelector(`[data-buy-shop="${id}"]`)?.value.trim()||"";
  const memo=document.querySelector(`[data-buy-memo="${id}"]`)?.value.trim()||"";
  state.purchaseHistory.unshift({
    id:Date.now(),
    productId:id,
    productName:p.name,
    jan:p.jan,
    date,
    price,
    qty,
    shop,
    memo
  });
  save();
};

window.deletePurchase=id=>{
  if(!confirm("この購入履歴を削除しますか？"))return;
  state.purchaseHistory=state.purchaseHistory.filter(x=>x.id!==id);
  save();
};

$("#favoriteOnlyBtn").onclick=()=>{
  favoriteOnly=!favoriteOnly;
  $("#favoriteOnlyBtn").textContent=favoriteOnly?"すべて表示":"❤️ お気に入りだけ";
  renderProducts();
};
$("#productSearch").oninput=renderProducts;
$("#productSort").onchange=renderProducts;

function renderProducts(){
  const q=($("#productSearch")?.value||"").trim().toLowerCase();
  let arr=[...state.products].filter(p=>{
    const text=`${p.name||""}${p.maker||""}${p.type||""}${p.jan||""}${p.memo||""}`.toLowerCase();
    return (!q||text.includes(q))&&(!favoriteOnly||p.favorite);
  });

  const sort=$("#productSort")?.value||"new";
  if(sort==="name")arr.sort((a,b)=>(a.name||"").localeCompare(b.name||"","ja"));
  else if(sort==="purchase")arr.sort((a,b)=>{
    const ad=lastPurchaseForProduct(a.id)?.date||"";
    const bd=lastPurchaseForProduct(b.id)?.date||"";
    return bd.localeCompare(ad)||(b.createdAt||0)-(a.createdAt||0);
  });
  else arr.sort((a,b)=>(b.createdAt||b.id||0)-(a.createdAt||a.id||0));

  $("#productCountBadge").textContent=`${state.products.length}商品`;

  $("#productList").innerHTML=arr.length?arr.map(p=>{
    const last=lastPurchaseForProduct(p.id);
    return `<div class="product-card ${p.favorite?"favorite":""}">
      <div class="product-card-top">
        <div>
          <div class="product-name">${p.favorite?"❤️ ":""}🛍️ ${escapeHtml(p.name)}</div>
          <div class="product-meta">${escapeHtml(p.maker||"メーカー未設定")} ・ ${escapeHtml(p.type||"その他")}<br>JAN: ${escapeHtml(p.jan||"未設定")}${last?`<br>最終購入: ${escapeHtml(last.date)}${last.price?` ・ ¥${Number(last.price).toLocaleString("ja-JP")}`:""}`:""}</div>
          ${p.memo?`<div class="product-meta">📝 ${escapeHtml(p.memo)}</div>`:""}
          ${p.url?`<a class="product-url" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">🔗 メーカー商品ページを開く</a>`:""}
        </div>
      </div>
      <div class="product-actions">
        <button class="product-action favorite" onclick="toggleProductFavorite(${p.id})">${p.favorite?"💔 お気に入り解除":"❤️ お気に入り"}</button>
        <button class="product-action" onclick="editProduct(${p.id})">✏️ 編集</button>
        <button class="product-action buy" onclick="showPurchaseForm(${p.id})">🧾 購入を記録</button>
        <button class="product-action delete" onclick="deleteProduct(${p.id})">🗑️ 削除</button>
      </div>
      <div class="purchase-form" data-purchase-form="${p.id}" style="display:none">
        <input data-buy-date="${p.id}" type="date" value="${new Date().toISOString().slice(0,10)}">
        <input data-buy-price="${p.id}" type="number" inputmode="numeric" placeholder="価格（円）">
        <input data-buy-qty="${p.id}" type="number" min="1" value="1" placeholder="個数">
        <input data-buy-shop="${p.id}" placeholder="購入店">
        <input class="full" data-buy-memo="${p.id}" placeholder="購入メモ">
        <button class="primary full" onclick="savePurchase(${p.id})">✅ 購入履歴に追加</button>
      </div>
    </div>`;
  }).join(""):'<div class="empty">条件に合う商品がありません</div>';

  renderPurchaseHistory();
}

function renderPurchaseHistory(){
  const rows=[...state.purchaseHistory].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||b.id-a.id);
  $("#purchaseCountBadge").textContent=`${rows.length}件`;
  $("#purchaseHistoryList").innerHTML=rows.length?rows.map(x=>`
    <div class="item">
      <div class="purchase-row">
        <div>
          <b>${escapeHtml(x.productName||"商品")}</b>
          <div class="meta">${escapeHtml(x.date||"")} ・ ${x.qty||1}個${x.shop?` ・ ${escapeHtml(x.shop)}`:""}<br>JAN: ${escapeHtml(x.jan||"")}${x.memo?`<br>📝 ${escapeHtml(x.memo)}`:""}</div>
        </div>
        <div>
          <div class="purchase-total">${x.price?`¥${(Number(x.price)*(Number(x.qty)||1)).toLocaleString("ja-JP")}`:""}</div>
          <button class="text-btn" onclick="deletePurchase(${x.id})">削除</button>
        </div>
      </div>
    </div>`).join(""):'<div class="empty">購入履歴はまだありません 🧾</div>';
}

$("#janSearchBtn").onclick=()=>{
  const jan=normalizeJan($("#janInput").value);
  if(!jan){
    $("#janResult").innerHTML="<b>JANコードを入力してください</b>";
    return;
  }
  const p=state.products.find(x=>x.jan===jan);
  if(p){
    $("#janResult").innerHTML=`<b>✅ ${escapeHtml(p.name)}</b><br>${escapeHtml(p.maker||"メーカー未設定")} ・ ${escapeHtml(p.type||"その他")}<br><small>JAN: ${escapeHtml(p.jan)}</small><br><button class="product-action" onclick="editProduct(${p.id})">商品を開く・編集</button>`;
  }else{
    $("#janResult").innerHTML=`<b>未登録の商品です</b><br>JAN: ${escapeHtml(jan)}<br><small>下の商品登録フォームにJANコードを入れました。</small>`;
    $("#productJan").value=jan;
    $("#productName").focus();
  }
};



let barcodeStream=null;
let barcodeScanTimer=null;
let barcodeScanning=false;
let lastBarcodeValue="";
let barcodeBusy=false;

const EAN_L={
  "0001101":"0","0011001":"1","0010011":"2","0111101":"3","0100011":"4",
  "0110001":"5","0101111":"6","0111011":"7","0110111":"8","0001011":"9"
};
const EAN_G={
  "0100111":"0","0110011":"1","0011011":"2","0100001":"3","0011101":"4",
  "0111001":"5","0000101":"6","0010001":"7","0001001":"8","0010111":"9"
};
const EAN_R={
  "1110010":"0","1100110":"1","1101100":"2","1000010":"3","1011100":"4",
  "1001110":"5","1010000":"6","1000100":"7","1001000":"8","1110100":"9"
};
const EAN13_PARITY={
  "LLLLLL":"0","LLGLGG":"1","LLGGLG":"2","LLGGGL":"3","LGLLGG":"4",
  "LGGLLG":"5","LGGGLL":"6","LGLGLG":"7","LGLGGL":"8","LGGLGL":"9"
};

function setBarcodeStatus(message,type=""){
  const el=$("#barcodeStatus");
  if(!el)return;
  el.textContent=message;
  el.className=`barcode-status ${type}`.trim();
}

function stopBarcodeCamera(){
  barcodeScanning=false;
  barcodeBusy=false;
  if(barcodeScanTimer){
    clearTimeout(barcodeScanTimer);
    barcodeScanTimer=null;
  }
  if(barcodeStream){
    barcodeStream.getTracks().forEach(t=>t.stop());
    barcodeStream=null;
  }
  const video=$("#barcodeVideo");
  if(video){
    try{video.pause()}catch(e){}
    video.srcObject=null;
  }
  const modal=$("#barcodeScannerModal");
  if(modal){
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  }
}

function checksumEAN(code){
  if(!/^\d+$/.test(code))return false;
  const d=[...code].map(Number);
  const check=d.pop();
  let sum=0;
  for(let i=0;i<d.length;i++){
    const fromRight=d.length-i;
    sum+=d[i]*((fromRight%2===1)?3:1);
  }
  return ((10-(sum%10))%10)===check;
}

function nearestPattern(bits,map,maxError=1){
  let best=null,bestErr=99;
  for(const [pat,digit] of Object.entries(map)){
    let err=0;
    for(let i=0;i<7;i++)if(bits[i]!==pat[i])err++;
    if(err<bestErr){bestErr=err;best=digit}
  }
  return bestErr<=maxError?{digit:best,error:bestErr}:null;
}

function decodeEAN13Bits(bits){
  if(bits.length!==95)return null;
  if(bits.slice(0,3)!=="101"||bits.slice(45,50)!=="01010"||bits.slice(92)!=="101")return null;
  let left="",parity="",errors=0;
  for(let i=0;i<6;i++){
    const chunk=bits.slice(3+i*7,10+i*7);
    const l=nearestPattern(chunk,EAN_L,1);
    const g=nearestPattern(chunk,EAN_G,1);
    if(!l&&!g)return null;
    if(l&&(!g||l.error<=g.error)){left+=l.digit;parity+="L";errors+=l.error}
    else{left+=g.digit;parity+="G";errors+=g.error}
  }
  const first=EAN13_PARITY[parity];
  if(first===undefined)return null;
  let right="";
  for(let i=0;i<6;i++){
    const chunk=bits.slice(50+i*7,57+i*7);
    const r=nearestPattern(chunk,EAN_R,1);
    if(!r)return null;
    right+=r.digit; errors+=r.error;
  }
  const code=first+left+right;
  if(!checksumEAN(code))return null;
  return {code,errors};
}

function decodeEAN8Bits(bits){
  if(bits.length!==67)return null;
  if(bits.slice(0,3)!=="101"||bits.slice(31,36)!=="01010"||bits.slice(64)!=="101")return null;
  let code="",errors=0;
  for(let i=0;i<4;i++){
    const chunk=bits.slice(3+i*7,10+i*7);
    const l=nearestPattern(chunk,EAN_L,1);
    if(!l)return null;
    code+=l.digit;errors+=l.error;
  }
  for(let i=0;i<4;i++){
    const chunk=bits.slice(36+i*7,43+i*7);
    const r=nearestPattern(chunk,EAN_R,1);
    if(!r)return null;
    code+=r.digit;errors+=r.error;
  }
  if(!checksumEAN(code))return null;
  return {code,errors};
}

function lineToBinary(data,w,y){
  const gray=new Uint8Array(w);
  let min=255,max=0,sum=0;
  for(let x=0;x<w;x++){
    const i=(y*w+x)*4;
    const g=(data[i]*30+data[i+1]*59+data[i+2]*11)/100;
    gray[x]=g;
    if(g<min)min=g;if(g>max)max=g;sum+=g;
  }
  if(max-min<38)return null;

  const threshold=(min+max)/2;
  let s="";
  for(let x=0;x<w;x++)s+=gray[x]<threshold?"1":"0";
  return s;
}

function runsFromBinary(binary){
  const runs=[];
  let start=0,c=binary[0];
  for(let i=1;i<=binary.length;i++){
    if(i===binary.length||binary[i]!==c){
      runs.push({c,start,end:i-1,len:i-start});
      start=i;c=binary[i];
    }
  }
  return runs;
}

function majoritySample(binary,start,end,moduleCount){
  let bits="";
  const width=end-start+1;
  for(let m=0;m<moduleCount;m++){
    const a=start+(m/moduleCount)*width;
    const b=start+((m+1)/moduleCount)*width;
    const ia=Math.max(0,Math.floor(a));
    const ib=Math.min(binary.length-1,Math.ceil(b)-1);
    let ones=0,total=0;
    for(let x=ia;x<=ib;x++){ones+=binary[x]==="1"?1:0;total++}
    bits+=ones>=total/2?"1":"0";
  }
  return bits;
}

function candidateScore(runSlice,modules){
  const total=runSlice.reduce((a,r)=>a+r.len,0);
  const unit=total/modules;
  if(unit<1.2)return 999;
  let score=0;
  for(const r of runSlice){
    const n=Math.max(1,Math.min(4,Math.round(r.len/unit)));
    score+=Math.abs(r.len/unit-n);
  }
  return score/runSlice.length;
}

function decodeBinaryLine(binary){
  const runs=runsFromBinary(binary);
  let best=null;

  const tryFormat=(runCount,modules,decoder)=>{
    for(let i=0;i+runCount<=runs.length;i++){
      const slice=runs.slice(i,i+runCount);
      if(slice[0].c!=="1"||slice[runCount-1].c!=="1")continue;

      // Guard bars should be narrow-ish.
      const total=slice.reduce((a,r)=>a+r.len,0);
      const unit=total/modules;
      if(unit<1.2||unit>20)continue;
      if(slice[0].len>unit*2.2||slice[1].len>unit*2.2||slice[2].len>unit*2.2)continue;

      const geom=candidateScore(slice,modules);
      if(geom>0.95)continue;

      const start=slice[0].start,end=slice[runCount-1].end;
      const bits=majoritySample(binary,start,end,modules);
      const decoded=decoder(bits);
      if(decoded){
        const score=geom+decoded.errors*0.25;
        if(!best||score<best.score)best={...decoded,score};
      }
    }
  };

  tryFormat(59,95,decodeEAN13Bits);
  tryFormat(43,67,decodeEAN8Bits);
  return best;
}

function decodeImageDataEAN(imageData){
  const {data,width:w,height:h}=imageData;
  const ys=[
    .40,.44,.48,.50,.52,.56,.60,
    .34,.66
  ].map(v=>Math.max(1,Math.min(h-2,Math.round(h*v))));

  let best=null;
  for(const y of ys){
    const binary=lineToBinary(data,w,y);
    if(!binary)continue;
    const a=decodeBinaryLine(binary);
    const b=decodeBinaryLine(binary.split("").reverse().join(""));
    for(const r of [a,b]){
      if(r&&(!best||r.score<best.score))best=r;
    }
  }
  return best;
}

function useScannedJan(rawValue){
  const jan=normalizeJan(rawValue);
  if(jan.length<8)return false;
  lastBarcodeValue=jan;
  $("#janInput").value=jan;

  const product=state.products.find(p=>p.jan===jan);
  if(product){
    $("#janResult").innerHTML=`<b>✅ ${escapeHtml(product.name)}</b><br>${escapeHtml(product.maker||"メーカー未設定")} ・ ${escapeHtml(product.type||"その他")}<br><small>JAN: ${escapeHtml(product.jan)}</small><br><button class="product-action" onclick="editProduct(${product.id})">商品を開く・編集</button>`;
    setBarcodeStatus(`読み取り成功：${jan}`,"success");
  }else{
    $("#janResult").innerHTML=`<b>未登録の商品です</b><br>JAN: ${escapeHtml(jan)}<br><small>商品登録フォームにJANコードを自動入力しました。</small>`;
    $("#productJan").value=jan;
    setBarcodeStatus(`読み取り成功：${jan}`,"success");
  }

  if(navigator.vibrate)navigator.vibrate(80);
  setTimeout(()=>{
    stopBarcodeCamera();
    if(!product)setTimeout(()=>$("#productName")?.focus(),150);
  },550);
  return true;
}

function frameToCanvas(video){
  const canvas=$("#barcodeCanvas");
  const maxW=960;
  const srcW=video.videoWidth||1280,srcH=video.videoHeight||720;
  const scale=Math.min(1,maxW/srcW);
  canvas.width=Math.max(320,Math.round(srcW*scale));
  canvas.height=Math.max(240,Math.round(srcH*scale));
  const ctx=canvas.getContext("2d",{willReadFrequently:true});
  ctx.drawImage(video,0,0,canvas.width,canvas.height);
  return {canvas,ctx};
}

async function scanBarcodeFrame(){
  if(!barcodeScanning||barcodeBusy)return;
  barcodeBusy=true;
  try{
    const video=$("#barcodeVideo");
    if(video.readyState>=2&&video.videoWidth){
      const {canvas,ctx}=frameToCanvas(video);
      const img=ctx.getImageData(0,0,canvas.width,canvas.height);
      const result=decodeImageDataEAN(img);
      if(result&&useScannedJan(result.code))return;
    }
  }catch(err){
    console.warn("local barcode scan",err);
  }finally{
    barcodeBusy=false;
  }
  if(barcodeScanning)barcodeScanTimer=setTimeout(scanBarcodeFrame,140);
}

async function openBarcodeCamera(){
  const modal=$("#barcodeScannerModal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  setBarcodeStatus("カメラを準備しています…");

  if(!navigator.mediaDevices?.getUserMedia){
    setBarcodeStatus("このブラウザではカメラを利用できません。「写真から読み取る」かJAN手入力を使ってください。","error");
    return;
  }

  try{
    barcodeStream=await navigator.mediaDevices.getUserMedia({
      video:{
        facingMode:{ideal:"environment"},
        width:{ideal:1920},
        height:{ideal:1080}
      },
      audio:false
    });

    const video=$("#barcodeVideo");
    video.srcObject=barcodeStream;
    await video.play();

    barcodeScanning=true;
    setBarcodeStatus("バーコードを枠の中央に合わせてください");
    scanBarcodeFrame();
  }catch(err){
    console.error(err);
    let msg="カメラを開始できませんでした。";
    if(err?.name==="NotAllowedError")msg="カメラの使用が許可されていません。Safariのカメラ許可をONにしてください。";
    else if(err?.name==="NotFoundError")msg="利用できるカメラが見つかりませんでした。";
    else if(err?.name==="NotReadableError")msg="カメラを他のアプリが使用している可能性があります。";
    setBarcodeStatus(msg,"error");
  }
}

async function decodePhotoFile(file){
  if(!file)return;
  setBarcodeStatus("写真を解析しています…");
  try{
    const bitmap=await createImageBitmap(file);
    const canvas=$("#barcodeCanvas");
    const maxW=1600;
    const scale=Math.min(1,maxW/bitmap.width);
    canvas.width=Math.max(320,Math.round(bitmap.width*scale));
    canvas.height=Math.max(240,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const img=ctx.getImageData(0,0,canvas.width,canvas.height);
    const result=decodeImageDataEAN(img);
    if(result)useScannedJan(result.code);
    else setBarcodeStatus("この写真からJAN/EANを読み取れませんでした。バーコードを大きく・正面から撮って試してください。","error");
    if(bitmap.close)bitmap.close();
  }catch(err){
    console.error(err);
    setBarcodeStatus("写真の読み込みに失敗しました。別の写真で試してください。","error");
  }
}

$("#openBarcodeCameraBtn").onclick=openBarcodeCamera;

function closeBarcodeScannerEvent(e){
  if(e){
    e.preventDefault();
    e.stopPropagation();
  }
  stopBarcodeCamera();
  return false;
}

const topCloseBtn=$("#closeBarcodeCameraBtn");
if(topCloseBtn){
  topCloseBtn.onclick=closeBarcodeScannerEvent;
  topCloseBtn.addEventListener("touchend",closeBarcodeScannerEvent,{passive:false});
  topCloseBtn.addEventListener("pointerup",closeBarcodeScannerEvent);
}

const bottomCloseBtn=$("#closeBarcodeCameraBottomBtn");
if(bottomCloseBtn){
  bottomCloseBtn.onclick=closeBarcodeScannerEvent;
  bottomCloseBtn.addEventListener("touchend",closeBarcodeScannerEvent,{passive:false});
}

const barcodePhotoInput=$("#barcodePhotoInput");
if(barcodePhotoInput){
  barcodePhotoInput.onchange=e=>{
    const file=e.target.files?.[0];
    if(file)decodePhotoFile(file);
    e.target.value="";
  };
}

const barcodeModal=$("#barcodeScannerModal");
if(barcodeModal){
  barcodeModal.addEventListener("click",e=>{
    if(e.target===barcodeModal){
      e.preventDefault();
      stopBarcodeCamera();
    }
  });
  barcodeModal.addEventListener("touchend",e=>{
    if(e.target===barcodeModal){
      e.preventDefault();
      stopBarcodeCamera();
    }
  },{passive:false});
}

document.addEventListener("visibilitychange",()=>{
  if(document.hidden&&barcodeStream)stopBarcodeCamera();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&$("#barcodeScannerModal")?.classList.contains("open")){
    stopBarcodeCamera();
  }
});

$("#themeBtn").onclick=()=>document.body.classList.toggle("alt");

$("#notificationPermissionBtn").onclick=requestNotificationPermission;


function renderDocPetOptions(){
  const s=$("#docPet");
  if(!s)return;
  const cur=s.value;
  s.innerHTML=state.pets.length
    ? state.pets.map(p=>`<option value="${p.id}">${petEmoji(p.type)} ${p.name}</option>`).join("")
    : '<option value="">ペットを先に登録してください</option>';
  if([...s.options].some(o=>o.value===cur))s.value=cur;
  else if(activePet())s.value=String(activePet().id);
}

$("#docFile").onchange=()=>{
  const f=$("#docFile").files?.[0];
  $("#docFileName").textContent=f?`${f.name} ・ ${(f.size/1024/1024).toFixed(2)}MB`:"ファイル未選択";
};

$("#saveDocBtn").onclick=async()=>{
  const p=activePet();
  if(!state.pets.length){alert("先にペットを登録してください🐾");go("pets");return;}
  const petId=Number($("#docPet").value);
  const title=$("#docTitle").value.trim();
  const file=$("#docFile").files?.[0];
  if(!petId || !title || !file){
    alert("ペット・タイトル・ファイルを選んでください📄");
    return;
  }
  if(file.size > 15*1024*1024){
    alert("1ファイル15MB以下にしてください。");
    return;
  }
  const btn=$("#saveDocBtn");
  btn.disabled=true;
  btn.textContent="保存中…";
  try{
    await putDocument({
      id:Date.now(),
      petId,
      type:$("#docType").value,
      title,
      date:$("#docDate").value || new Date().toISOString().slice(0,10),
      memo:$("#docMemo").value.trim(),
      fileName:file.name,
      mime:file.type || "application/octet-stream",
      size:file.size,
      blob:file
    });
    $("#docTitle").value="";
    $("#docMemo").value="";
    $("#docFile").value="";
    $("#docFileName").textContent="ファイル未選択";
    await renderDocuments();
    alert("書類を保存しました 📄✨");
  }catch(e){
    console.error(e);
    alert("保存できませんでした。端末の空き容量を確認してください。");
  }finally{
    btn.disabled=false;
    btn.textContent="📎 書類を保存";
  }
};

$("#docFilter").onchange=()=>renderDocuments();

async function renderDocuments(){
  renderDocPetOptions();
  const box=$("#docList");
  if(!box)return;
  if(!state.pets.length){
    box.innerHTML='<div class="empty">ペットを登録すると書類を保存できます 📄</div>';
    return;
  }
  box.innerHTML='<div class="empty">読み込み中…</div>';
  try{
    const all=await getDocuments();
    const petId=activePet()?.id;
    const filter=$("#docFilter")?.value || "all";
    let docs=all.filter(d=>d.petId===petId);
    if(filter!=="all") docs=docs.filter(d=>d.type.includes(filter));
    docs.sort((a,b)=>(b.date||"").localeCompare(a.date||"") || b.id-a.id);

    if(!docs.length){
      box.innerHTML='<div class="empty">このペットの書類はまだありません 📄</div>';
      return;
    }

    box.innerHTML="";
    for(const d of docs){
      const card=document.createElement("div");
      card.className="doc-card";
      let thumb=`<div class="doc-thumb">${d.mime?.startsWith("image/")?"🖼️":"📄"}</div>`;
      if(d.mime?.startsWith("image/") && d.blob){
        const url=URL.createObjectURL(d.blob);
        thumb=`<div class="doc-thumb"><img src="${url}" alt=""></div>`;
        setTimeout(()=>URL.revokeObjectURL(url),60000);
      }
      card.innerHTML=`${thumb}<div>
        <b>${d.type} ${d.title}</b>
        <div class="doc-meta">${d.date||"日付なし"} ・ ${(d.size/1024/1024).toFixed(2)}MB</div>
        ${d.memo?`<div class="doc-meta">📝 ${d.memo}</div>`:""}
        <div class="doc-actions">
          <button class="doc-action" data-open="${d.id}">開く</button>
          <button class="doc-action delete" data-delete="${d.id}">削除</button>
        </div>
      </div>`;
      box.appendChild(card);
    }

    box.querySelectorAll("[data-open]").forEach(b=>b.onclick=async()=>{
      const d=await getDocument(Number(b.dataset.open));
      if(!d?.blob)return;
      const url=URL.createObjectURL(d.blob);
      window.open(url,"_blank");
      setTimeout(()=>URL.revokeObjectURL(url),120000);
    });

    box.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{
      const id=Number(b.dataset.delete);
      const d=await getDocument(id);
      if(!confirm(`${d?.title||"この書類"}を削除しますか？`))return;
      await removeDocument(id);
      await renderDocuments();
    });
  }catch(e){
    console.error(e);
    box.innerHTML='<div class="empty">書類を読み込めませんでした</div>';
  }
}



let pendingAlbumPhoto="";

function renderAlbumPetOptions(){
  const s=$("#albumPet");
  if(!s)return;
  const cur=s.value;
  s.innerHTML=state.pets.length
    ? state.pets.map(p=>`<option value="${p.id}">${petEmoji(p.type)} ${p.name}</option>`).join("")
    : '<option value="">ペットを先に登録してください</option>';
  if([...s.options].some(o=>o.value===cur))s.value=cur;
  else if(activePet())s.value=String(activePet().id);
}

function renderAlbumPreview(){
  const box=$("#albumPreview");
  if(!box)return;
  if(pendingAlbumPhoto){
    box.innerHTML=`<img src="${pendingAlbumPhoto}" alt="アルバム写真">`;
  }else{
    box.textContent="📷";
  }
}

$("#albumFile").onchange=async(e)=>{
  const file=e.target.files?.[0];
  if(!file)return;
  try{
    pendingAlbumPhoto=await resizeImage(file,1000,.82);
    renderAlbumPreview();
  }catch{
    alert("写真を読み込めませんでした");
  }
};

$("#saveAlbumBtn").onclick=async()=>{
  if(!state.pets.length){
    alert("先にペットを登録してください🐾");
    go("pets");
    return;
  }
  const petId=Number($("#albumPet").value);
  if(!petId || !pendingAlbumPhoto){
    alert("ペットと写真を選んでください📸");
    return;
  }
  const btn=$("#saveAlbumBtn");
  btn.disabled=true;
  btn.textContent="保存中…";
  try{
    const blob=await (await fetch(pendingAlbumPhoto)).blob();
    const item={
      id:Date.now(),
      petId,
      date:$("#albumDate").value || new Date().toISOString().slice(0,10),
      weight:$("#albumWeight").value || "",
      memo:$("#albumMemo").value.trim(),
      blob
    };
    await putAlbumItem(item);

    // Also add weight into health history if entered
    if(item.weight){
      state.health.unshift({
        id:Date.now()+1,
        petId,
        date:item.date,
        weight:item.weight,
        condition:"ふつう",
        memo:item.memo ? `アルバム: ${item.memo}` : "アルバムから記録"
      });
      localStorage.setItem("pawpalState",JSON.stringify(state));
    }

    $("#albumFile").value="";
    $("#albumWeight").value="";
    $("#albumMemo").value="";
    pendingAlbumPhoto="";
    renderAlbumPreview();
    await renderAlbum();
    renderHealth();
    alert("アルバムに保存しました 📸✨");
  }catch(e){
    console.error(e);
    alert("保存できませんでした。端末の空き容量を確認してください。");
  }finally{
    btn.disabled=false;
    btn.textContent="💖 アルバムに保存";
  }
};

$("#albumSort").onchange=()=>renderAlbum();

async function renderAlbum(){
  renderAlbumPetOptions();
  const box=$("#albumList");
  if(!box)return;
  if(!state.pets.length){
    box.innerHTML='<div class="empty">ペットを登録すると成長アルバムを使えます 📸</div>';
    return;
  }
  box.innerHTML='<div class="empty">読み込み中…</div>';
  try{
    const petId=activePet()?.id;
    let items=(await getAlbumItems()).filter(x=>x.petId===petId);
    const sort=$("#albumSort")?.value || "new";
    items.sort((a,b)=>sort==="old" ? (a.date||"").localeCompare(b.date||"") : (b.date||"").localeCompare(a.date||""));

    if(!items.length){
      box.innerHTML='<div class="empty">まだアルバム写真がありません 📷</div>';
      return;
    }

    box.innerHTML="";
    for(const item of items){
      const url=URL.createObjectURL(item.blob);
      const card=document.createElement("div");
      card.className="album-card";
      card.innerHTML=`
        <img src="${url}" alt="成長記録">
        <div class="album-card-body">
          <div class="album-card-date">${item.date||"日付なし"}</div>
          ${item.weight?`<span class="album-card-weight">⚖️ ${item.weight}kg</span>`:""}
          ${item.memo?`<div class="album-card-note">${item.memo}</div>`:""}
          <button class="album-delete" data-id="${item.id}">削除</button>
        </div>`;
      box.appendChild(card);
      setTimeout(()=>URL.revokeObjectURL(url),120000);
    }

    box.querySelectorAll(".album-delete").forEach(btn=>btn.onclick=async()=>{
      if(!confirm("このアルバム写真を削除しますか？"))return;
      await removeAlbumItem(Number(btn.dataset.id));
      await renderAlbum();
    });
  }catch(e){
    console.error(e);
    box.innerHTML='<div class="empty">アルバムを読み込めませんでした</div>';
  }
}



function currentFoodPetId(){
  const sel=$("#foodPet");
  return sel?.value ? Number(sel.value) : (activePet()?.id || null);
}

function renderFoodPetOptions(){
  const s=$("#foodPet");
  if(!s)return;
  const cur=s.value;
  s.innerHTML=state.pets.length
    ? state.pets.map(p=>`<option value="${p.id}">${petEmoji(p.type)} ${p.name}</option>`).join("")
    : '<option value="">ペットを先に登録してください</option>';
  if([...s.options].some(o=>o.value===cur))s.value=cur;
  else if(activePet())s.value=String(activePet().id);
}

function getFoodProfile(petId){
  return state.foodProfiles.find(x=>x.petId===petId);
}

function loadFoodProfileForm(){
  const petId=currentFoodPetId();
  const f=getFoodProfile(petId);
  $("#foodName").value=f?.name||"";
  $("#foodMaker").value=f?.maker||"";
  $("#foodDailyTarget").value=f?.dailyTarget||"";
  $("#foodStock").value=f?.stock??"";
  $("#foodBuyDate").value=f?.buyDate||"";
  $("#foodNote").value=f?.note||"";
}

$("#foodPet").onchange=()=>{
  loadFoodProfileForm();
  renderFood();
};

$("#saveFoodProfileBtn").onclick=()=>{
  if(!state.pets.length){alert("先にペットを登録してください🐾");go("pets");return;}
  const petId=currentFoodPetId();
  const name=$("#foodName").value.trim();
  if(!name){alert("フード名を入力してください🍚");return;}
  const profile={
    petId,
    name,
    maker:$("#foodMaker").value.trim(),
    dailyTarget:Number($("#foodDailyTarget").value)||0,
    stock:Number($("#foodStock").value)||0,
    initialStock:Number($("#foodStock").value)||0,
    buyDate:$("#foodBuyDate").value||"",
    note:$("#foodNote").value.trim()
  };
  const idx=state.foodProfiles.findIndex(x=>x.petId===petId);
  if(idx>=0) state.foodProfiles[idx]={...state.foodProfiles[idx],...profile};
  else state.foodProfiles.push(profile);
  save();
  alert("フード情報を保存しました 🍽️");
};

$("#saveMealBtn").onclick=()=>{
  if(!state.pets.length){alert("先にペットを登録してください🐾");go("pets");return;}
  const petId=currentFoodPetId();
  const amount=Number($("#mealAmount").value);
  if(!amount){alert("食べた量を入力してください🥣");return;}
  state.meals.unshift({
    id:Date.now(),
    petId,
    date:new Date().toISOString().slice(0,10),
    time:new Date().toTimeString().slice(0,5),
    type:$("#mealType").value,
    appetite:$("#mealAppetite").value,
    amount,
    memo:$("#mealMemo").value.trim()
  });
  $("#mealAmount").value="";
  $("#mealMemo").value="";
  save();
};

$("#consumeStockBtn").onclick=()=>{
  const petId=currentFoodPetId();
  const f=getFoodProfile(petId);
  if(!f){alert("先にフード情報を保存してください🍚");return;}
  const today=new Date().toISOString().slice(0,10);
  const consumed=state.meals.filter(m=>m.petId===petId && m.date===today).reduce((s,m)=>s+Number(m.amount||0),0);
  if(consumed<=0){alert("今日の食事記録がありません");return;}
  f.stock=Math.max(0,Number(f.stock||0)-consumed);
  save();
};

$("#clearMealsBtn").onclick=()=>{
  const petId=currentFoodPetId();
  const count=state.meals.filter(m=>m.petId===petId).length;
  if(!count){alert("削除する食事履歴がありません");return;}
  if(!confirm(`このペットの食事履歴 ${count}件を削除しますか？`))return;
  state.meals=state.meals.filter(m=>m.petId!==petId);
  save();
};

function renderFood(){
  renderFoodPetOptions();
  const petId=currentFoodPetId();
  if(!petId)return;
  const f=getFoodProfile(petId);
  const today=new Date().toISOString().slice(0,10);
  const todayMeals=state.meals.filter(m=>m.petId===petId && m.date===today);
  const total=todayMeals.reduce((s,m)=>s+Number(m.amount||0),0);
  $("#todayFoodSummary").textContent=`${total}g / ${Number(f?.dailyTarget||0)}g`;

  const stockBox=$("#foodStockCard");
  if(!f){
    stockBox.innerHTML='<div class="empty">フード情報を保存すると在庫が表示されます 🍚</div>';
  }else{
    const target=Number(f.dailyTarget||0);
    const stock=Number(f.stock||0);
    const days=target>0?Math.floor(stock/target):0;
    const base=Math.max(stock,Number(f.initialStock||stock),1);
    const pct=Math.max(0,Math.min(100,(stock/base)*100));
    stockBox.innerHTML=`<div class="food-stock-card">
      <div class="food-stock-name">🍚 ${f.name}</div>
      <div class="food-stock-meta">${f.maker||"メーカー未設定"}<br>1日目安 ${target||0}g ・ 残り ${stock}g</div>
      <div class="stock-meter"><div class="stock-meter-bar" style="width:${pct}%"></div></div>
      <div class="food-stock-meta">目安あと ${days}日分${f.buyDate?` ・ 購入予定 ${f.buyDate}`:""}</div>
      ${days<=3?'<div class="stock-alert">⚠️ フードの残量が少なくなっています</div>':""}
      ${f.note?`<div class="food-stock-meta">📝 ${f.note}</div>`:""}
    </div>`;
  }

  const meals=[...state.meals].filter(m=>m.petId===petId);
  $("#mealList").innerHTML=meals.length?meals.map(m=>`<div class="item">
    <div>
      <b>${m.type} <span class="meal-item-amount">${m.amount}g</span></b>
      <div class="meta">${m.date} ${m.time} ・ ${m.appetite}${m.memo?` ・ ${m.memo}`:""}</div>
    </div>
    <button class="text-btn" onclick="deleteMeal(${m.id})">削除</button>
  </div>`).join(""):'<div class="empty">食事記録はまだありません 🥣</div>';
}

window.deleteMeal=id=>{
  state.meals=state.meals.filter(m=>m.id!==id);
  save();
};



function currentLifePetId(){const s=$("#lifePet");return s?.value?Number(s.value):(activePet()?.id||null)}
function renderLifePetOptions(){const s=$("#lifePet");if(!s)return;const cur=s.value;s.innerHTML=state.pets.length?state.pets.map(p=>`<option value="${p.id}">${petEmoji(p.type)} ${p.name}</option>`).join(""):'<option value="">ペットを先に登録してください</option>';if([...s.options].some(o=>o.value===cur))s.value=cur;else if(activePet())s.value=String(activePet().id)}
$("#lifePet").onchange=()=>renderLife();
$("#saveLifeBtn").onclick=()=>{if(!state.pets.length){alert("先にペットを登録してください🐾");go("pets");return;}const petId=currentLifePetId(),date=$("#lifeDate").value||new Date().toISOString().slice(0,10);const r={id:Date.now(),petId,date,walkMinutes:Number($("#walkMinutes").value)||0,walkDistance:Number($("#walkDistance").value)||0,water:Number($("#waterAmount").value)||0,sleep:Number($("#sleepHours").value)||0,pee:Number($("#peeCount").value)||0,poop:$("#poopStatus").value,mood:$("#lifeMood").value,memo:$("#lifeMemo").value.trim()};const idx=state.lifeRecords.findIndex(x=>x.petId===petId&&x.date===date);if(idx>=0)state.lifeRecords[idx]={...state.lifeRecords[idx],...r,id:state.lifeRecords[idx].id};else state.lifeRecords.unshift(r);$("#lifeMemo").value="";save();};
$("#clearLifeBtn").onclick=()=>{const petId=currentLifePetId(),count=state.lifeRecords.filter(x=>x.petId===petId).length;if(!count){alert("削除する生活記録がありません");return;}if(!confirm(`このペットの生活記録 ${count}件をすべて削除しますか？`))return;state.lifeRecords=state.lifeRecords.filter(x=>x.petId!==petId);save();};
window.deleteLifeRecord=id=>{state.lifeRecords=state.lifeRecords.filter(x=>x.id!==id);save();};
function renderLife(){renderLifePetOptions();const petId=currentLifePetId();if(!petId)return;const today=new Date().toISOString().slice(0,10),r=state.lifeRecords.find(x=>x.petId===petId&&x.date===today),summary=$("#lifeSummary"),score=$("#lifeScore");if(!r){score.textContent="記録なし";summary.innerHTML='<div class="empty">今日の記録を入れると、ここにまとめが表示されます 🌿</div>';}else{let p=0;if(r.walkMinutes>0)p++;if(r.water>0)p++;if(r.sleep>0)p++;if(r.pee>0)p++;if(["とても元気","元気","ふつう"].includes(r.mood))p++;score.textContent=`${p}/5`;const w=[];if(r.water===0)w.push("飲水量が未記録");if(r.pee===0)w.push("おしっこ0回");if(["下痢気味","気になる"].includes(r.poop))w.push(`うんち：${r.poop}`);if(["少し元気がない","心配"].includes(r.mood))w.push(`元気：${r.mood}`);summary.innerHTML=`<div class="life-summary-box"><small>🚶 散歩</small><b>${r.walkMinutes}分</b><div>${r.walkDistance}km</div></div><div class="life-summary-box"><small>💧 飲水</small><b>${r.water}ml</b></div><div class="life-summary-box"><small>😴 睡眠</small><b>${r.sleep}時間</b></div><div class="life-summary-box"><small>🚽 排泄</small><b>${r.pee}回</b><div>${r.poop}</div></div>${w.length?`<div class="life-warning">⚠️ ${w.join(" ・ ")}</div>`:""}`;}const a=[...state.lifeRecords].filter(x=>x.petId===petId).sort((a,b)=>b.date.localeCompare(a.date));$("#lifeList").innerHTML=a.length?a.map(r=>`<div class="item"><div><b>${r.date} ・ ${r.mood}</b><div class="life-record-tags"><span class="life-tag">🚶 ${r.walkMinutes}分</span><span class="life-tag">📏 ${r.walkDistance}km</span><span class="life-tag">💧 ${r.water}ml</span><span class="life-tag">😴 ${r.sleep}h</span><span class="life-tag">🚽 ${r.pee}回 / ${r.poop}</span></div>${r.memo?`<div class="meta">📝 ${r.memo}</div>`:""}</div><button class="text-btn" onclick="deleteLifeRecord(${r.id})">削除</button></div>`).join(""):'<div class="empty">生活記録はまだありません 🌿</div>';}


function currentEmergencyPetId(){const s=$("#emergencyPet");return s?.value?Number(s.value):(activePet()?.id||null)}
function renderEmergencyPetOptions(){const s=$("#emergencyPet");if(!s)return;const cur=s.value;s.innerHTML=state.pets.length?state.pets.map(p=>`<option value="${p.id}">${petEmoji(p.type)} ${p.name}</option>`).join(""):'<option value="">ペットを先に登録してください</option>';if([...s.options].some(o=>o.value===cur))s.value=cur;else if(activePet())s.value=String(activePet().id)}
function calcPetAge(birthday){if(!birthday)return"年齢未設定";const b=new Date(birthday+"T00:00:00"),n=new Date();let y=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))y--;return`${Math.max(0,y)}歳`}
function latestWeightForPet(petId){const a=state.health.filter(x=>x.petId===petId&&x.weight).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);return a[0]?.weight||""}
function getEmergencyProfile(petId){return state.emergencyProfiles.find(x=>x.petId===petId)}

function loadEmergencyForm(){
  renderEmergencyPetOptions();const petId=currentEmergencyPetId(),e=getEmergencyProfile(petId);
  $("#emergencyBlood").value=e?.blood||"";$("#emergencyChip").value=e?.chip||"";$("#emergencyAllergy").value=e?.allergy||"";$("#emergencyCondition").value=e?.condition||"";$("#emergencyMedicine").value=e?.medicine||"";$("#emergencyHospital").value=e?.hospital||"";$("#emergencyHospitalPhone").value=e?.hospitalPhone||"";$("#emergencyOwnerPhone").value=e?.ownerPhone||"";$("#emergencyNote").value=e?.note||"";
}
$("#emergencyPet").onchange=()=>{loadEmergencyForm();renderEmergency();};
$("#saveEmergencyBtn").onclick=()=>{
  if(!state.pets.length){alert("先にペットを登録してください🐾");go("pets");return;}
  const petId=currentEmergencyPetId(),data={petId,blood:$("#emergencyBlood").value.trim(),chip:$("#emergencyChip").value.trim(),allergy:$("#emergencyAllergy").value.trim(),condition:$("#emergencyCondition").value.trim(),medicine:$("#emergencyMedicine").value.trim(),hospital:$("#emergencyHospital").value.trim(),hospitalPhone:$("#emergencyHospitalPhone").value.trim(),ownerPhone:$("#emergencyOwnerPhone").value.trim(),note:$("#emergencyNote").value.trim()};
  const idx=state.emergencyProfiles.findIndex(x=>x.petId===petId);if(idx>=0)state.emergencyProfiles[idx]={...state.emergencyProfiles[idx],...data};else state.emergencyProfiles.push(data);save();alert("緊急情報を保存しました 🆘");
};
function renderEmergency(){
  renderEmergencyPetOptions();const petId=currentEmergencyPetId(),p=state.pets.find(x=>x.id===petId);
  if(!p){$("#emergencyHero").innerHTML='<div class="empty">ペットを登録してください</div>';$("#emergencyDisplay").innerHTML='<div class="empty">緊急情報はまだありません</div>';return;}
  const e=getEmergencyProfile(petId)||{},weight=latestWeightForPet(petId),visual=p.photo?`<img class="emergency-hero-photo" src="${p.photo}" alt="${p.name}">`:`<div class="emergency-hero-photo">${petEmoji(p.type)}</div>`;
  $("#emergencyHero").innerHTML=`${visual}<div><div class="emergency-hero-name">${p.name}</div><div class="emergency-hero-meta">${p.breed||p.type} ・ ${calcPetAge(p.birthday)}${weight?` ・ ${weight}kg`:""}</div></div>`;
  const phoneLink=n=>n?`<a class="phone-link" href="tel:${n.replace(/[^0-9+]/g,"")}">📞 ${n}</a>`:"未設定";
  $("#emergencyDisplay").innerHTML=`<div class="em-box"><small>ペット</small><b>${p.name} / ${p.breed||p.type}</b><div>${calcPetAge(p.birthday)}${weight?` ・ ${weight}kg`:""}</div></div><div class="em-box critical"><small>アレルギー</small><b>${e.allergy||"未設定"}</b></div><div class="em-box critical"><small>持病・既往歴</small><b>${e.condition||"未設定"}</b></div><div class="em-box critical"><small>現在の薬</small><b>${e.medicine||"未設定"}</b></div><div class="em-box"><small>血液型</small><b>${e.blood||"未設定"}</b></div><div class="em-box"><small>マイクロチップ</small><b>${e.chip||"未設定"}</b></div><div class="em-box"><small>かかりつけ病院</small><b>${e.hospital||"未設定"}</b><div>${phoneLink(e.hospitalPhone)}</div></div><div class="em-box"><small>飼い主連絡先</small><div>${phoneLink(e.ownerPhone)}</div></div><div class="em-box"><small>その他の注意事項</small><b>${e.note||"未設定"}</b></div>`;
}
$("#toggleEmergencyViewBtn").onclick=()=>{const card=document.querySelector(".emergency-display-card"),on=card.classList.toggle("emergency-fullscreen");$("#toggleEmergencyViewBtn").textContent=on?"閉じる":"全画面表示";if(on)window.scrollTo({top:0})};



function askAssistant(){
  const q=$("#assistantQuestion").value.trim()||"summary";
  answerAssistant(q);
}

function currentAssistantPetId(){
  const s=$("#assistantPet");
  return s?.value ? Number(s.value) : (activePet()?.id||null);
}
function renderAssistantPetOptions(){
  const s=$("#assistantPet");
  if(!s)return;
  const cur=s.value;
  s.innerHTML=state.pets.length
    ? state.pets.map(p=>`<option value="${p.id}">${petEmoji(p.type)} ${p.name}</option>`).join("")
    : '<option value="">ペットを先に登録してください</option>';
  if([...s.options].some(o=>o.value===cur))s.value=cur;
  else if(activePet())s.value=String(activePet().id);
}
function assistantPetName(){
  const id=currentAssistantPetId();
  return state.pets.find(p=>p.id===id)?.name || "この子";
}
function assistantWeights(petId){
  return state.health
    .filter(x=>x.petId===petId && x.weight)
    .map(x=>({date:x.date,weight:Number(x.weight)}))
    .filter(x=>!Number.isNaN(x.weight))
    .sort((a,b)=>a.date.localeCompare(b.date))
    .slice(-8);
}
function assistantMeals(petId){
  return (state.meals||[]).filter(x=>x.petId===petId).sort((a,b)=>(b.date+(b.time||"")).localeCompare(a.date+(a.time||"")));
}
function assistantLife(petId){
  return (state.lifeRecords||[]).filter(x=>x.petId===petId).sort((a,b)=>b.date.localeCompare(a.date));
}
function assistantEvents(petId){
  const today=new Date().toISOString().slice(0,10);
  return state.events.filter(e=>(!e.petId||e.petId===petId)&&e.date>=today&&!e.done).sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")));
}
function weightSummaryText(petId){
  const w=assistantWeights(petId);
  if(!w.length)return "体重記録はまだありません。";
  if(w.length===1)return `最新体重は ${w[0].weight.toFixed(1)}kg です。`;
  const first=w[0],last=w[w.length-1],diff=last.weight-first.weight;
  const dir=diff>0.05?"増加":diff<-0.05?"減少":"ほぼ横ばい";
  return `最新体重は ${last.weight.toFixed(1)}kg。直近${w.length}件では ${Math.abs(diff).toFixed(1)}kg ${dir}しています。`;
}
function foodSummaryText(petId){
  const today=new Date().toISOString().slice(0,10);
  const meals=assistantMeals(petId).filter(m=>m.date===today);
  const f=(state.foodProfiles||[]).find(x=>x.petId===petId);
  const total=meals.reduce((s,m)=>s+Number(m.amount||0),0);
  if(!meals.length && !f)return "食事記録はまだありません。";
  const target=Number(f?.dailyTarget||0);
  let t=`今日は ${total}g 記録されています。`;
  if(target>0)t+=` 1日の目安 ${target}g に対して ${Math.round(total/target*100)}% です。`;
  if(meals.some(m=>["少しだけ","食べなかった"].includes(m.appetite)))t+=" 食欲が少ない記録があります。";
  return t;
}
function lifeSummaryText(petId){
  const r=assistantLife(petId)[0];
  if(!r)return "生活記録はまだありません。";
  return `${r.date}の記録では、散歩${r.walkMinutes||0}分・飲水${r.water||0}ml・睡眠${r.sleep||0}時間・元気は「${r.mood||"未設定"}」です。`;
}
function scheduleSummaryText(petId){
  const ev=assistantEvents(petId).slice(0,3);
  if(!ev.length)return "今後の予定は登録されていません。";
  return "次の予定は " + ev.map(e=>`${e.date}${e.time?` ${e.time}`:""}「${e.title}」`).join("、") + " です。";
}
function buildAssistantInsights(petId){
  const out=[];
  const w=assistantWeights(petId);
  if(w.length>=2){
    const diff=w[w.length-1].weight-w[0].weight;
    if(Math.abs(diff)>=0.5)out.push({type:"warn",text:`⚖️ 直近の体重が ${Math.abs(diff).toFixed(1)}kg ${diff>0?"増え":"減っ"}ています。記録期間や体格も確認してください。`});
    else out.push({type:"good",text:"⚖️ 直近の体重は大きな変化がありません。"});
  }
  const life=assistantLife(petId)[0];
  if(life){
    if(["心配","少し元気がない"].includes(life.mood))out.push({type:"warn",text:`🌿 最新の生活記録で「${life.mood}」になっています。`});
    if(["下痢気味","気になる"].includes(life.poop))out.push({type:"warn",text:`🚽 最新のうんち記録が「${life.poop}」です。`});
  }
  const meals=assistantMeals(petId).slice(0,5);
  if(meals.some(m=>["少しだけ","食べなかった"].includes(m.appetite)))out.push({type:"warn",text:"🍚 最近の食事に、食欲が少ない記録があります。"});
  const ev=assistantEvents(petId)[0];
  if(ev){
    const days=Math.ceil((new Date(ev.date+"T00:00:00")-new Date(new Date().toISOString().slice(0,10)+"T00:00:00"))/86400000);
    if(days<=7)out.push({type:"good",text:`📅 ${days===0?"今日":days+"日後"}に「${ev.title}」の予定があります。`});
  }
  if(!out.length)out.push({type:"good",text:"✨ 今の記録からは、特に強く目立つ変化はありません。"});
  return out;
}
function answerAssistant(kindOrQuestion){
  const petId=currentAssistantPetId();
  const name=assistantPetName();
  const q=(kindOrQuestion||"").toLowerCase();
  let body="";
  if(q==="weight"||q.includes("体重")){
    body=`<div class="ai-bullet">⚖️ ${weightSummaryText(petId)}</div>`;
  }else if(q==="food"||q.includes("食事")||q.includes("フード")){
    body=`<div class="ai-bullet">🍚 ${foodSummaryText(petId)}</div>`;
  }else if(q==="schedule"||q.includes("予定")||q.includes("薬")||q.includes("ワクチン")){
    body=`<div class="ai-bullet">📅 ${scheduleSummaryText(petId)}</div>`;
  }else if(q==="care"||q.includes("気をつけ")||q.includes("注意")){
    body=buildAssistantInsights(petId).map(i=>`<div class="ai-bullet">${i.text}</div>`).join("");
  }else{
    body=`
      <div class="ai-bullet">⚖️ ${weightSummaryText(petId)}</div>
      <div class="ai-bullet">🍚 ${foodSummaryText(petId)}</div>
      <div class="ai-bullet">🌿 ${lifeSummaryText(petId)}</div>
      <div class="ai-bullet">📅 ${scheduleSummaryText(petId)}</div>`;
  }
  $("#assistantAnswer").innerHTML=`
    <div class="ai-message">
      <h4>🤖 ${name}ちゃんのまとめ</h4>
      ${body}
      <div class="ai-disclaimer">これはPawPalに保存された記録の整理です。診断や治療判断はできません。気になる症状がある場合は動物病院に相談してください。</div>
    </div>`;
  renderAssistantInsights();
}
function renderAssistantInsights(){
  renderAssistantPetOptions();
  const box=$("#assistantInsights");if(!box)return;
  const petId=currentAssistantPetId();
  if(!petId){box.innerHTML='<div class="empty">ペットを登録してください</div>';return;}
  const arr=buildAssistantInsights(petId);
  box.innerHTML=arr.map(i=>`<div class="ai-insight ${i.type}">${i.text}</div>`).join("");
}
$("#assistantPet").onchange=()=>{renderAssistantInsights();$("#assistantAnswer").innerHTML='<div class="empty">質問を選ぶか入力すると、記録からまとめます 🤖</div>';};
$$(".ai-chip").forEach(b=>b.onclick=()=>{$("#assistantQuestion").value=b.textContent;answerAssistant(b.dataset.aiq);});
$("#askAssistantBtn").onclick=askAssistant;
$("#clearAssistantBtn").onclick=()=>{$("#assistantQuestion").value="";$("#assistantAnswer").innerHTML='<div class="empty">質問を選ぶか入力すると、記録からまとめます 🤖</div>';};



const CLOUD_SETTINGS_KEY="pawpalCloudSettings";
const AUTH_SESSION_KEY="pawpalAuthSession";

function getCloudSettings(){
  try{return JSON.parse(localStorage.getItem(CLOUD_SETTINGS_KEY)||"{}")}catch{return{}}
}
function setCloudSettings(v){localStorage.setItem(CLOUD_SETTINGS_KEY,JSON.stringify(v))}
function getAuthSession(){
  try{return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY)||"null")}catch{return null}
}
function setAuthSession(v){
  if(v)localStorage.setItem(AUTH_SESSION_KEY,JSON.stringify(v));
  else localStorage.removeItem(AUTH_SESSION_KEY);
}
function cloudMessage(text,type=""){
  const el=$("#cloudMessage");if(!el)return;
  el.className="cloud-message"+(type?` ${type}`:"");el.textContent=text;
}
function authMessage(text,type=""){
  const el=$("#authMessage");if(!el)return;
  el.className="cloud-message"+(type?` ${type}`:"");el.textContent=text;
}
function familyMessage(text,type=""){
  const el=$("#familyMessage");if(!el)return;
  el.className="cloud-message"+(type?` ${type}`:"");el.textContent=text;
}
function normalizeSupabaseUrl(raw){
  let u=(raw||"").trim();
  if(!u)return "";
  u=u.replace(/\/+$/,"");
  u=u.replace(/\/rest\/v1$/i,"");
  u=u.replace(/\/auth\/v1$/i,"");
  u=u.replace(/\/functions\/v1$/i,"");
  return u;
}
function supabaseBase(){
  const s=getCloudSettings();
  const url=normalizeSupabaseUrl(s.url);
  if(!url||!s.anonKey)throw new Error("SupabaseのProject URLとAnon Keyを保存してください");
  if(url!==s.url)setCloudSettings({...s,url});
  return {...s,url};
}
async function authFetch(path,options={}){
  const s=supabaseBase();
  const headers={"apikey":s.anonKey,"Content-Type":"application/json",...(options.headers||{})};
  const res=await fetch(`${s.url}/auth/v1/${path}`,{...options,headers});
  const txt=await res.text();
  let data=null;try{data=txt?JSON.parse(txt):null}catch{data=txt}
  if(!res.ok)throw new Error(data?.msg||data?.message||`HTTP ${res.status}`);
  return data;
}
async function restFetch(path,options={}){
  const s=supabaseBase(),session=getAuthSession();
  if(!session?.access_token)throw new Error("ログインしてください");
  const headers={
    "apikey":s.anonKey,
    "Authorization":`Bearer ${session.access_token}`,
    "Content-Type":"application/json",
    ...(options.headers||{})
  };
  const res=await fetch(`${s.url}/rest/v1/${path}`,{...options,headers});
  const txt=await res.text();
  let data=null;try{data=txt?JSON.parse(txt):null}catch{data=txt}
  if(res.status===401){
    throw new Error("認証に失敗しました。いったんログアウトして、もう一度ログインしてください");
  }
  if(!res.ok)throw new Error(data?.message||data?.hint||data?.details||`HTTP ${res.status}`);
  return data;
}
async function refreshSessionIfNeeded(){
  const session=getAuthSession();
  if(!session?.refresh_token)return session;
  const expiresAt=Number(session.expires_at||0)*1000;
  if(expiresAt && expiresAt-Date.now()>60000)return session;
  try{
    const data=await authFetch(`token?grant_type=refresh_token`,{
      method:"POST",body:JSON.stringify({refresh_token:session.refresh_token})
    });
    const next={...data,expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in||3600)};
    setAuthSession(next);return next;
  }catch(e){
    console.warn("session refresh failed",e);
    return session;
  }
}
function renderCloudSettings(){
  const s=getCloudSettings(),session=getAuthSession();
  if($("#supabaseUrl"))$("#supabaseUrl").value=s.url||"";
  if($("#supabaseAnonKey"))$("#supabaseAnonKey").value=s.anonKey||"";
  if($("#lastSyncText"))$("#lastSyncText").textContent=s.lastSync?`最終 ${s.lastSync}`:"未同期";
  if($("#cloudStatusBadge"))$("#cloudStatusBadge").textContent=(s.url&&s.anonKey)?"設定済み":"未接続";

  const logged=!!session?.access_token;
  $("#authLoggedOut").style.display=logged?"none":"block";
  $("#authLoggedIn").style.display=logged?"block":"none";
  $("#authStatusBadge").textContent=logged?"ログイン中":"未ログイン";
  $("#authEmailDisplay").textContent=session?.user?.email||"";
  if($("#familyStatusBadge"))$("#familyStatusBadge").textContent=s.familyId?"参加中":"未参加";
  if($("#currentFamilyBox"))$("#currentFamilyBox").style.display=s.familyId?"block":"none";
  if($("#currentFamilyName"))$("#currentFamilyName").textContent=s.familyName||"";
}
$("#saveCloudSettingsBtn").onclick=()=>{
  const url=normalizeSupabaseUrl($("#supabaseUrl").value),anonKey=$("#supabaseAnonKey").value.trim();
  if(!url||!anonKey){alert("Project URLとAnon Keyを入力してください");return}
  const s=getCloudSettings();setCloudSettings({...s,url,anonKey});renderCloudSettings();cloudMessage(`Supabase接続設定を保存しました：${url}`,"ok");
};
$("#signupBtn").onclick=async()=>{
  const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
  if(!email||password.length<6){alert("メールアドレスと6文字以上のパスワードを入力してください");return}
  try{
    const data=await authFetch("signup",{method:"POST",body:JSON.stringify({email,password})});
    if(data?.access_token){
      setAuthSession({...data,expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in||3600)});
      authMessage("新規登録してログインしました ✨","ok");
    }else{
      authMessage("登録しました。Supabaseの設定によっては確認メールを開いてからログインしてください。","ok");
    }
    renderCloudSettings();
  }catch(e){authMessage(`登録できませんでした：${e.message}`,"error")}
};
$("#loginBtn").onclick=async()=>{
  const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
  if(!email||!password){alert("メールアドレスとパスワードを入力してください");return}
  try{
    const data=await authFetch("token?grant_type=password",{method:"POST",body:JSON.stringify({email,password})});
    setAuthSession({...data,expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in||3600)});
    authMessage("ログインしました 🔑","ok");renderCloudSettings();await loadCurrentFamily();
  }catch(e){authMessage(`ログインできませんでした：${e.message}`,"error")}
};
$("#logoutBtn").onclick=async()=>{
  try{
    const s=supabaseBase(),session=getAuthSession();
    if(session?.access_token){
      await fetch(`${s.url}/auth/v1/logout`,{method:"POST",headers:{"apikey":s.anonKey,"Authorization":`Bearer ${session.access_token}`}});
    }
  }catch(_){}
  setAuthSession(null);
  const s=getCloudSettings();setCloudSettings({...s,familyId:null,familyName:null});
  renderCloudSettings();authMessage("ログアウトしました。");
};

$("#familyCreateTab").onclick=()=>{
  $("#familyCreateTab").classList.add("active");$("#familyJoinTab").classList.remove("active");
  $("#familyCreatePanel").style.display="block";$("#familyJoinPanel").style.display="none";
};
$("#familyJoinTab").onclick=()=>{
  $("#familyJoinTab").classList.add("active");$("#familyCreateTab").classList.remove("active");
  $("#familyCreatePanel").style.display="none";$("#familyJoinPanel").style.display="block";
};

$("#createFamilyBtn").onclick=async()=>{
  const name=$("#familyName").value.trim(),code=$("#familyCreateCode").value.trim();
  if(!name||code.length<8){alert("家族名と8文字以上の共有コードを入力してください");return}
  try{
    await refreshSessionIfNeeded();
    const rows=await restFetch("rpc/create_pawpal_family",{method:"POST",body:JSON.stringify({p_name:name,p_code:code})});
    const row=Array.isArray(rows)?rows[0]:rows;
    const s=getCloudSettings();setCloudSettings({...s,familyId:row?.family_id,familyName:row?.family_name||name});
    renderCloudSettings();familyMessage("家族スペースを作成しました 🏠","ok");await loadCurrentFamily();
  }catch(e){familyMessage(`作成できませんでした：${e.message}`,"error")}
};

$("#joinFamilyBtn").onclick=async()=>{
  const code=$("#familyJoinCode").value.trim();
  if(code.length<8){alert("共有コードを入力してください");return}
  try{
    await refreshSessionIfNeeded();
    const rows=await restFetch("rpc/join_pawpal_family",{method:"POST",body:JSON.stringify({p_code:code})});
    const row=Array.isArray(rows)?rows[0]:rows;
    const s=getCloudSettings();setCloudSettings({...s,familyId:row?.family_id,familyName:row?.family_name||"家族スペース"});
    renderCloudSettings();familyMessage("家族スペースに参加しました 🤝","ok");await loadCurrentFamily();
  }catch(e){familyMessage(`参加できませんでした：${e.message}`,"error")}
};

async function loadCurrentFamily(){
  const s=getCloudSettings(),session=getAuthSession();
  if(!s.familyId||!session?.access_token)return;
  try{
    const rows=await restFetch(`pawpal_family_members?family_id=eq.${encodeURIComponent(s.familyId)}&select=user_id,role,created_at`,{method:"GET"});
    $("#familyMembersText").textContent=`メンバー ${rows?.length||1}人`;
  }catch(_){}
}
async function buildBackupPayload(){
  let docsMeta=[],albumMeta=[];
  try{docsMeta=(await getDocuments()).map(d=>({id:d.id,petId:d.petId,type:d.type,title:d.title,date:d.date,memo:d.memo,fileName:d.fileName,mime:d.mime,size:d.size}))}catch(_){}
  try{albumMeta=(await getAlbumItems()).map(a=>({id:a.id,petId:a.petId,date:a.date,weight:a.weight,memo:a.memo}))}catch(_){}
  return {version:13,exportedAt:new Date().toISOString(),pawpalState:state,documentMetadata:docsMeta,albumMetadata:albumMeta};
}
$("#cloudBackupBtn").onclick=async()=>{
  const btn=$("#cloudBackupBtn");btn.disabled=true;btn.textContent="バックアップ中…";
  try{
    await refreshSessionIfNeeded();
    const s=getCloudSettings();if(!s.familyId)throw new Error("家族スペースに参加してください");
    const payload=await buildBackupPayload();
    await restFetch("pawpal_backups?on_conflict=family_id",{
      method:"POST",
      headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},
      body:JSON.stringify({family_id:s.familyId,payload,updated_at:new Date().toISOString()})
    });
    const now=new Date().toLocaleString("ja-JP");setCloudSettings({...s,lastSync:now});renderCloudSettings();cloudMessage("クラウドへのバックアップが完了しました ☁️","ok");
  }catch(e){cloudMessage(`バックアップできませんでした：${e.message}`,"error")}
  finally{btn.disabled=false;btn.textContent="⬆️ クラウドへバックアップ"}
};
$("#cloudRestoreBtn").onclick=async()=>{
  if(!confirm("クラウドのデータでこの端末のPawPalデータを置き換えますか？"))return;
  const btn=$("#cloudRestoreBtn");btn.disabled=true;btn.textContent="復元中…";
  try{
    await refreshSessionIfNeeded();
    const s=getCloudSettings();if(!s.familyId)throw new Error("家族スペースに参加してください");
    const rows=await restFetch(`pawpal_backups?family_id=eq.${encodeURIComponent(s.familyId)}&select=payload,updated_at&limit=1`,{method:"GET"});
    if(!rows?.length)throw new Error("バックアップが見つかりません");
    const payload=rows[0].payload;if(!payload?.pawpalState)throw new Error("バックアップ形式が不正です");
    localStorage.setItem("pawpalState",JSON.stringify(payload.pawpalState));
    setCloudSettings({...s,lastSync:new Date().toLocaleString("ja-JP")});
    cloudMessage("復元しました。画面を再読み込みします。","ok");setTimeout(()=>location.reload(),700);
  }catch(e){cloudMessage(`復元できませんでした：${e.message}`,"error")}
  finally{btn.disabled=false;btn.textContent="⬇️ クラウドから復元"}
};

$("#exportBackupBtn").onclick=async()=>{
  try{
    const payload=await buildBackupPayload(),blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=`PawPal_backup_${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }catch{alert("バックアップを書き出せませんでした")}
};
$("#importBackupFile").onchange=async(e)=>{
  const file=e.target.files?.[0];if(!file)return;
  if(!confirm("このバックアップで現在の端末データを置き換えますか？")){e.target.value="";return}
  try{
    const payload=JSON.parse(await file.text());if(!payload?.pawpalState)throw new Error("invalid");
    localStorage.setItem("pawpalState",JSON.stringify(payload.pawpalState));alert("バックアップを読み込みました。再読み込みします。");location.reload();
  }catch{alert("PawPalのバックアップファイルではありません")}
};

function renderAll(){
  const p=activePet();
  if(p && !state.activePet) state.activePet=p.id;
  $("#helloPet").textContent=p?`${p.name}ちゃん、今日も元気？ ${petEmoji(p.type)}`:"ペットを登録しよう 🐶";
  renderPets(); renderHealth(); renderEvents(); renderPlaces(); renderProducts(); renderDocuments(); renderAlbum(); renderFood(); renderLife(); renderEmergency(); renderAssistantInsights(); renderCloudSettings();
}
renderAll();

if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }

window.addEventListener("resize",()=>{ try{ renderHealth(); }catch(e){} });

try{if($("#docDate")&&!$("#docDate").value)$("#docDate").value=new Date().toISOString().slice(0,10);}catch(e){}

try{if($("#albumDate")&&!$("#albumDate").value)$("#albumDate").value=new Date().toISOString().slice(0,10);}catch(e){}
try{if($("#lifeDate")&&!$("#lifeDate").value)$("#lifeDate").value=new Date().toISOString().slice(0,10);}catch(e){}
try{loadEmergencyForm();}catch(e){}

try{refreshSessionIfNeeded().then(()=>{renderCloudSettings();loadCurrentFamily();});}catch(e){}


function bindClick(selector, handler){
  const el=$(selector);
  if(el) el.onclick=handler;
}
function bindEvent(selector, eventName, handler){
  const el=$(selector);
  if(el) el.addEventListener(eventName, handler);
}


bindClick("#pawpalAdminBtn",openPawpalAdmin);
bindClick("#closePawpalAdminBtn",closePawpalAdmin);
bindClick("#closePawpalAdminBottomBtn",closePawpalAdmin);
bindEvent("#pawpalAdminModal","click",e=>{if(e.target.id==="pawpalAdminModal")closePawpalAdmin();});


bindClick("#openCustomPlaceFormBtn",()=>openCustomPlaceForm(""));
bindClick("#closeCustomPlaceBtn",closeCustomPlaceForm);
bindClick("#closeCustomPlaceBottomBtn",closeCustomPlaceForm);
bindClick("#saveCustomPlaceBtn",saveCustomPlaceForm);
bindClick("#deleteCustomPlaceBtn",deleteCustomPlaceForm);
bindEvent("#customPlaceModal","click",e=>{if(e.target.id==="customPlaceModal")closeCustomPlaceForm();});


bindEvent("#adminPlaceSearch","input",renderAdminAllPlaces);
bindClick("#closeAdminEditPlaceBtn",closeAdminEditPlace);
bindClick("#closeAdminEditPlaceBottomBtn",closeAdminEditPlace);
bindClick("#saveAdminEditPlaceBtn",saveAdminEditedPlace);
bindClick("#resetAdminEditPlaceBtn",resetAdminEditedPlace);
bindEvent("#adminEditPlaceModal","click",e=>{if(e.target.id==="adminEditPlaceModal")closeAdminEditPlace();});

/* PawPal v20.0 Supabase Store Master */
const STORE_CLOUD_CFG_KEY="pawpal_store_cloud_v20";
let storeCloudClient=null;
function storeCfg(){try{return JSON.parse(localStorage.getItem(STORE_CLOUD_CFG_KEY)||"{}")}catch(e){return {}}}
function storeBadge(t){const e=document.getElementById("storeMasterBadge");if(e)e.textContent=t}
function initStoreCloud(){
 const c=storeCfg(),u=document.getElementById("storeSupabaseUrl"),k=document.getElementById("storeSupabaseKey");
 if(u&&!u.value)u.value=c.url||""; if(k&&!k.value)k.value=c.key||"";
 if(!c.url||!c.key||!window.supabase){storeBadge("未接続");return null}
 try{storeCloudClient=window.supabase.createClient(c.url,c.key);storeBadge("設定済み");return storeCloudClient}catch(e){storeBadge("設定エラー");return null}
}
function cloudStore(r){return {
  id:r.external_id||r.id,
  externalId:r.external_id||"",
  name:r.name,
  type:r.primary_type,
  prefecture:r.prefecture||"",
  area:r.prefecture||"",
  city:"",
  address:r.address||"",
  website:r.website||"",
  url:r.website||"",
  phone:r.phone||"",
  hours:r.business_hours||"",
  note:r.primary_type||"",
  lat:r.latitude==null?null:Number(r.latitude),
  lon:r.longitude==null?null:Number(r.longitude),
  recommended:!!r.is_recommended,
  couponText:r.coupon_text||"",
  coupon:r.coupon_text?{title:r.coupon_text,code:"PAWPAL",detail:r.coupon_text}:null,
  reservationUrl:r.reservation_url||"",
  source:r.source_name||"PawPal店舗マスタ",
  isPublished:r.is_published!==false,
  cloudStoreId:r.id,
  emoji:placeTypeEmoji(r.primary_type)
}}

function getCloudStoreCache(){
  try{
    const raw=window.pawpalCloudStores || JSON.parse(localStorage.getItem("pawpal_store_master_cache_v20")||"[]");
    return Array.isArray(raw)?raw:[];
  }catch(e){return []}
}
function cloudStoreForNearby(p){
  const x={...p,emoji:p.emoji||placeTypeEmoji(p.type)};
  if(Number.isFinite(x.lat)&&Number.isFinite(x.lon)&&nearbyUserLocation){
    x.distance=distanceKm(nearbyUserLocation.lat,nearbyUserLocation.lon,x.lat,x.lon);
  }else{
    x.distance=null;
  }
  return x;
}
function mergeWithCloudStores(items){
  const cloud=getCloudStoreCache()
    .filter(p=>p.isPublished!==false)
    .map(cloudStoreForNearby)
    .filter(p=>!nearbyUserLocation || !Number.isFinite(p.distance) || p.distance<=50);
  return dedupePlaces([...(items||[]),...cloud]);
}
function refreshPlacesWithCloud(){
  places=mergeWithCloudStores(places.filter(p=>!p.cloudStoreId));
  applyAllPlaceOverrides(places);
  places.sort((a,b)=>(a.distance??9999)-(b.distance??9999));
  if(typeof applyRecommendedOverrides==="function")applyRecommendedOverrides();
  if(typeof renderPlaces==="function")renderPlaces();
  if(typeof renderAdminAllPlaces==="function")renderAdminAllPlaces();
}

async function syncStoreMaster(){
 if(!storeCloudClient&&!initStoreCloud()){alert("Supabase接続設定を先に保存してください。");return}
 storeBadge("同期中…");
 const {data,error}=await storeCloudClient.from("pawpal_stores").select("*").eq("is_published",true).order("name");
 if(error){console.error(error);storeBadge("同期失敗");alert("店舗マスタの同期に失敗しました。SQLと接続設定を確認してください。");return}
 const rows=(data||[]).map(cloudStore);
 localStorage.setItem("pawpal_store_master_cache_v20",JSON.stringify(rows));
 window.pawpalCloudStores=rows;
 storeBadge("同期済み "+rows.length+"件");
 refreshPlacesWithCloud();
}
document.addEventListener("DOMContentLoaded",()=>{
 initStoreCloud();
 window.pawpalCloudStores=getCloudStoreCache();
 setTimeout(()=>{ if(getCloudStoreCache().length) refreshPlacesWithCloud(); },80);
 document.getElementById("saveStoreCloudBtn")?.addEventListener("click",()=>{
  const url=document.getElementById("storeSupabaseUrl")?.value.trim(),key=document.getElementById("storeSupabaseKey")?.value.trim();
  if(!url||!key){alert("Project URL と Anon Key を入力してください。");return}
  localStorage.setItem(STORE_CLOUD_CFG_KEY,JSON.stringify({url,key}));initStoreCloud();alert("接続情報を保存しました。");
 });
 document.getElementById("syncStoreCloudBtn")?.addEventListener("click",syncStoreMaster);
});


/* ===== PawPal v20.1 静岡県 実店舗取り込み ===== */
let shizuokaImportRows=[];

function escImport(s=""){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
}
function importStatus(t){
  const e=document.getElementById("shizuokaImportStatus");
  if(e)e.textContent=t;
}
function classifyOsmTags(tags={}){
  const amenity=tags.amenity||"";
  const shop=tags.shop||"";
  const office=tags.office||"";
  const tourism=tags.tourism||"";
  const craft=tags.craft||"";
  const name=(tags.name||"").toLowerCase();

  if(amenity==="veterinary") return "病院";
  if(shop==="pet" || shop==="pet_grooming" || name.includes("ペットショップ")) return "ペットショップ";
  if(shop==="pet_grooming" || craft==="pet_groomer" || name.includes("トリミング") || name.includes("グルーミング")) return "トリミング";
  if(tourism==="hotel" && (name.includes("ペット") || name.includes("ドッグ") || name.includes("わん"))) return "ホテル";
  if(tags["animal_boarding"] || office==="pet_sitting" || name.includes("ペットホテル")) return "ホテル";
  return "";
}
function osmAddress(tags={}){
  const p=[];
  if(tags["addr:province"])p.push(tags["addr:province"]);
  if(tags["addr:city"])p.push(tags["addr:city"]);
  if(tags["addr:suburb"])p.push(tags["addr:suburb"]);
  if(tags["addr:quarter"])p.push(tags["addr:quarter"]);
  if(tags["addr:street"])p.push(tags["addr:street"]);
  if(tags["addr:housenumber"])p.push(tags["addr:housenumber"]);
  return p.join("");
}
function osmWebsite(tags={}){
  return tags.website || tags["contact:website"] || tags.url || "";
}
function osmPhone(tags={}){
  return tags.phone || tags["contact:phone"] || "";
}
function osmHours(tags={}){
  return tags.opening_hours || "";
}
function osmName(tags={}){
  return tags["name:ja"] || tags.name || "";
}
function osmToCandidate(el){
  const tags=el.tags||{};
  const type=classifyOsmTags(tags);
  if(!type)return null;
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if(lat==null || lon==null)return null;
  const name=osmName(tags);
  if(!name)return null;
  return {
    external_id:`osm-${el.type}-${el.id}`,
    name,
    primary_type:type,
    prefecture:"静岡県",
    address:osmAddress(tags),
    website:osmWebsite(tags),
    phone:osmPhone(tags),
    business_hours:osmHours(tags),
    latitude:Number(lat),
    longitude:Number(lon),
    is_recommended:false,
    coupon_text:"",
    reservation_url:"",
    source_name:"OpenStreetMap / Overpass",
    is_published:true,
    checked:true
  };
}
function dedupeCandidates(rows){
  const m=new Map();
  for(const r of rows){
    const key=(r.name+"|"+r.latitude.toFixed(5)+"|"+r.longitude.toFixed(5)).toLowerCase();
    if(!m.has(key))m.set(key,r);
  }
  return [...m.values()];
}
function renderShizuokaImportList(){
  const host=document.getElementById("shizuokaImportList");
  if(!host)return;
  if(!shizuokaImportRows.length){
    host.innerHTML='<div class="store-import-empty">店舗候補はまだありません</div>';
    return;
  }
  host.innerHTML=shizuokaImportRows.map((r,i)=>`
    <label class="store-import-item">
      <input type="checkbox" data-import-index="${i}" ${r.checked!==false?"checked":""}>
      <div>
        <strong>${escImport(r.name)}</strong>
        <div class="store-import-meta">${escImport(r.primary_type)} ・ ${escImport(r.address||"住所情報なし")}</div>
        <div class="store-import-meta">📞 ${escImport(r.phone||"未登録")}　🌐 ${escImport(r.website||"未登録")}</div>
      </div>
    </label>
  `).join("");
  host.querySelectorAll('input[data-import-index]').forEach(cb=>{
    cb.addEventListener("change",()=>{
      const i=Number(cb.dataset.importIndex);
      if(shizuokaImportRows[i])shizuokaImportRows[i].checked=cb.checked;
    });
  });
}
async function fetchShizuokaCandidates(){
  importStatus("取得中…");
  const q=`[out:json][timeout:40];
area["name"="静岡県"]["boundary"="administrative"]->.a;
(
  nwr["amenity"="veterinary"](area.a);
  nwr["shop"="pet"](area.a);
  nwr["shop"="pet_grooming"](area.a);
  nwr["craft"="pet_groomer"](area.a);
  nwr["animal_boarding"](area.a);
  nwr["office"="pet_sitting"](area.a);
);
out center tags;`;
  const endpoints=[
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];
  let lastErr=null;
  for(const ep of endpoints){
    try{
      const res=await fetch(ep,{
        method:"POST",
        headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
        body:"data="+encodeURIComponent(q)
      });
      if(!res.ok)throw new Error("HTTP "+res.status);
      const data=await res.json();
      shizuokaImportRows=dedupeCandidates((data.elements||[]).map(osmToCandidate).filter(Boolean))
        .sort((a,b)=>a.primary_type.localeCompare(b.primary_type,"ja")||a.name.localeCompare(b.name,"ja"));
      renderShizuokaImportList();
      importStatus(`候補 ${shizuokaImportRows.length}件`);
      return;
    }catch(e){lastErr=e;}
  }
  console.warn(lastErr);
  importStatus("取得失敗");
  alert("静岡県の店舗候補取得に失敗しました。時間をおいてもう一度お試しください。");
}
async function ensureStoreClient(){
  if(typeof initStoreCloud==="function"){
    const c=storeCloudClient || initStoreCloud();
    if(c)return c;
  }
  if(typeof initStoreCloudClient==="function"){
    const c=storeCloudClient || initStoreCloudClient();
    if(c)return c;
  }
  throw new Error("Supabase未接続");
}
async function saveCheckedShizuokaStores(){
  const rows=shizuokaImportRows.filter(r=>r.checked!==false);
  if(!rows.length){alert("保存する店舗を選択してください。");return;}
  try{
    const client=await ensureStoreClient();
    const {data:{session}}=await client.auth.getSession();
    if(!session){
      alert("先に「PawPal運営管理者ログイン」からログインしてください。");
      return;
    }
    importStatus(`保存中… ${rows.length}件`);
    const payload=rows.map(r=>({
      external_id:r.external_id,
      name:r.name,
      primary_type:r.primary_type,
      prefecture:r.prefecture,
      address:r.address,
      website:r.website,
      phone:r.phone,
      business_hours:r.business_hours,
      latitude:r.latitude,
      longitude:r.longitude,
      is_recommended:false,
      coupon_text:"",
      reservation_url:"",
      source_name:r.source_name,
      is_published:true,
      updated_at:new Date().toISOString()
    }));
    const {error}=await client.from("pawpal_stores").upsert(payload,{onConflict:"external_id"});
    if(error)throw error;
    importStatus(`Supabaseへ保存済み ${rows.length}件`);
    alert(`${rows.length}件を店舗マスタへ保存しました。`);
    if(typeof syncStoreMaster==="function")await syncStoreMaster();
  }catch(e){
    console.error(e);
    importStatus("保存失敗");
    const msg=e?.message||String(e||"");
    if(/row-level security|permission|403|401/i.test(msg)){
      alert("保存が拒否されました。運営管理者アカウントでログインしているか確認してください。");
    }else{
      alert("Supabaseへの保存に失敗しました。\n"+msg);
    }
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("fetchShizuokaStoresBtn")?.addEventListener("click",fetchShizuokaCandidates);
  document.getElementById("saveCheckedStoresBtn")?.addEventListener("click",saveCheckedShizuokaStores);
  renderShizuokaImportList();
});
/* ===== /PawPal v20.1 静岡県 実店舗取り込み ===== */


/* ===== PawPal v20.2 店舗運営管理者ログイン ===== */
function storeAdminAuthMessage(text,type=""){
  const e=document.getElementById("storeAdminAuthMessage");
  if(!e)return;
  e.className="cloud-message"+(type?` ${type}`:"");
  e.textContent=text;
}
function setStoreAdminAuthUI(user){
  const badge=document.getElementById("storeAdminAuthBadge");
  const out=document.getElementById("storeAdminLoggedOut");
  const inn=document.getElementById("storeAdminLoggedIn");
  const email=document.getElementById("storeAdminEmailDisplay");
  const saveBtn=document.getElementById("saveCheckedStoresBtn");
  if(user){
    if(badge)badge.textContent="ログイン済み";
    if(out)out.style.display="none";
    if(inn)inn.style.display="";
    if(email)email.textContent=user.email||"管理者";
    if(saveBtn){saveBtn.disabled=false;saveBtn.title="";}
    storeAdminAuthMessage("管理者としてログインしています。店舗マスタへ保存できます。","success");
  }else{
    if(badge)badge.textContent="未ログイン";
    if(out)out.style.display="";
    if(inn)inn.style.display="none";
    if(email)email.textContent="";
    if(saveBtn){saveBtn.disabled=true;saveBtn.title="管理者ログインが必要です";}
    storeAdminAuthMessage("店舗の追加・編集・削除には管理者ログインが必要です。");
  }
}
async function refreshStoreAdminAuth(){
  try{
    const client=await ensureStoreClient();
    const {data:{session},error}=await client.auth.getSession();
    if(error)throw error;
    setStoreAdminAuthUI(session?.user||null);
  }catch(e){
    setStoreAdminAuthUI(null);
  }
}
async function loginStoreAdmin(){
  const email=document.getElementById("storeAdminEmail")?.value.trim();
  const password=document.getElementById("storeAdminPassword")?.value||"";
  if(!email||!password){
    alert("管理者メールアドレスとパスワードを入力してください。");
    return;
  }
  try{
    const client=await ensureStoreClient();
    storeAdminAuthMessage("ログイン中…");
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error)throw error;
    document.getElementById("storeAdminPassword").value="";
    setStoreAdminAuthUI(data.user||data.session?.user||null);
    alert("PawPal運営管理者としてログインしました。");
  }catch(e){
    console.error(e);
    setStoreAdminAuthUI(null);
    storeAdminAuthMessage("ログインできませんでした。メールアドレスまたはパスワードを確認してください。","error");
    alert("管理者ログインに失敗しました。");
  }
}
async function logoutStoreAdmin(){
  try{
    const client=await ensureStoreClient();
    await client.auth.signOut();
  }catch(e){console.warn(e);}
  setStoreAdminAuthUI(null);
  alert("管理者ログアウトしました。");
}
document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("storeAdminLoginBtn")?.addEventListener("click",loginStoreAdmin);
  document.getElementById("storeAdminLogoutBtn")?.addEventListener("click",logoutStoreAdmin);
  setTimeout(refreshStoreAdminAuth,150);
});
/* ===== /PawPal v20.2 店舗運営管理者ログイン ===== */

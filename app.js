
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const state = JSON.parse(localStorage.getItem("pawpalState") || '{"pets":[],"activePet":null,"health":[],"events":[]}');
state.products ||= [];
state.placePrefs ||= {};
state.placeMemos ||= {};
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



const places = [
  {id:"sakura-vet",name:"さくら動物病院",type:"病院",area:"東京都",city:"世田谷区",emoji:"🏥",note:"一般診療・予防接種",hours:"9:00〜12:00 / 16:00〜19:00",phone:"0312345678",address:"東京都世田谷区（サンプル）",url:"https://www.google.com/search?q="+encodeURIComponent("さくら動物病院 東京都")},
  {id:"happy-trim",name:"ハッピートリミング",type:"トリミング",area:"神奈川県",city:"横浜市",emoji:"✂️",note:"小型犬・猫対応",hours:"10:00〜18:00",phone:"0451234567",address:"神奈川県横浜市（サンプル）",url:"https://www.google.com/search?q="+encodeURIComponent("ハッピートリミング 神奈川県")},
  {id:"sunny-hotel",name:"わんこホテル Sunny",type:"ホテル",area:"静岡県",city:"静岡市",emoji:"🏨",note:"一時預かり・宿泊",hours:"8:00〜20:00",phone:"0541234567",address:"静岡県静岡市（サンプル）",url:"https://www.google.com/search?q="+encodeURIComponent("わんこホテル Sunny 静岡県")},
  {id:"midori-vet",name:"みどり動物クリニック",type:"病院",area:"山梨県",city:"甲府市",emoji:"🏥",note:"犬・猫・小動物",hours:"9:00〜18:00",phone:"0551234567",address:"山梨県甲府市（サンプル）",url:"https://www.google.com/search?q="+encodeURIComponent("みどり動物クリニック 山梨県")},
  {id:"paw-spa",name:"Paw Spa",type:"トリミング",area:"長野県",city:"長野市",emoji:"🫧",note:"シャンプー・カット",hours:"10:00〜18:00",phone:"0261234567",address:"長野県長野市（サンプル）",url:"https://www.google.com/search?q="+encodeURIComponent("Paw Spa 長野県")}
];

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


let placeFilter="すべて";
let currentPlaceId=null;

function placePref(id){
  state.placePrefs[id] ||= {favorite:false,visited:false};
  return state.placePrefs[id];
}

function renderPlaces(){
  const q=($("#placeSearch")?.value||"").trim().toLowerCase();
  const arr=places.filter(x=>{
    const pref=placePref(x.id);
    const matchFilter=
      placeFilter==="すべて" ||
      (placeFilter==="お気に入り" && pref.favorite) ||
      x.type===placeFilter;
    const text=`${x.name}${x.area}${x.city||""}${x.type}${x.note}`.toLowerCase();
    return matchFilter && (!q || text.includes(q));
  });

  $("#placeList").innerHTML=arr.length?arr.map(x=>{
    const pref=placePref(x.id);
    return `<div class="place-card">
      <div class="place-card-row">
        <div class="place-card-main">
          <div class="place-card-emoji">${x.emoji}</div>
          <div>
            <div class="place-card-name">${escapeHtml(x.name)}</div>
            <div class="place-card-meta">${escapeHtml(x.area)} ・ ${escapeHtml(x.note)}</div>
            <div class="place-card-badges">
              <span class="place-badge">${escapeHtml(x.type)}</span>
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
  $("#placeDetailBody").innerHTML=`
    <b>${escapeHtml(p.note)}</b><br>
    📍 ${escapeHtml(p.address||p.area)}<br>
    🕒 ${escapeHtml(p.hours||"営業時間未登録")}
  `;

  $("#placePhoneBtn").href=p.phone?`tel:${p.phone}`:"#";
  $("#placePhoneBtn").style.display=p.phone?"":"none";
  $("#placeMapBtn").href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name+" "+p.area+" "+(p.city||""))}`;
  $("#placeWebBtn").href=p.url||"#";
  $("#placeWebBtn").style.display=p.url?"":"none";

  $("#placeFavoriteBtn").textContent=pref.favorite?"💔 お気に入り解除":"❤️ お気に入り";
  $("#placeVisitedBtn").textContent=pref.visited?"↩️ 行ったを解除":"✅ 行った";
  $("#placeMemoInput").value=state.placeMemos[id]||"";

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
$("#searchNearbyPlacesBtn").onclick=()=>{
  const q=($("#placeSearch")?.value||"").trim();
  const kind=placeFilter!=="すべて"&&placeFilter!=="お気に入り"?placeFilter:"ペット";
  const term=q?`${q} ${kind}`:`${kind} 動物病院 トリミング ペットホテル`;
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(term)}`,"_blank","noopener");
};
document.querySelectorAll(".place-filter").forEach(c=>{
  c.onclick=()=>{
    document.querySelectorAll(".place-filter").forEach(x=>x.classList.remove("active"));
    c.classList.add("active");
    placeFilter=c.dataset.filter;
    renderPlaces();
  };
});

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

$("#closePlaceDetailBtn").onclick=closePlaceDetail;
$("#closePlaceDetailBottomBtn").onclick=closePlaceDetail;
$("#placeDetailModal").addEventListener("click",e=>{
  if(e.target.id==="placeDetailModal")closePlaceDetail();
});



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


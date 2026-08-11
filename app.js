
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const state = JSON.parse(localStorage.getItem("pawpalState") || '{"pets":[],"activePet":null,"health":[],"events":[]}');

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
  {name:"さくら動物病院", type:"病院", area:"東京都", emoji:"🏥", note:"一般診療・予防接種"},
  {name:"ハッピートリミング", type:"トリミング", area:"神奈川県", emoji:"✂️", note:"小型犬・猫対応"},
  {name:"わんこホテル Sunny", type:"ホテル", area:"静岡県", emoji:"🏨", note:"一時預かり・宿泊"},
  {name:"みどり動物クリニック", type:"病院", area:"山梨県", emoji:"🏥", note:"犬・猫・小動物"},
  {name:"Paw Spa", type:"トリミング", area:"長野県", emoji:"🫧", note:"シャンプー・カット"}
];

const products = [
  {jan:"4901234567890", name:"やさしいチキンフード", maker:"Paw Foods", type:"フード"},
  {jan:"4909876543210", name:"歯みがきガム", maker:"Happy Pet", type:"ケア"},
  {jan:"4987654321098", name:"肉球ケアクリーム", maker:"Mofu Lab", type:"ケア"},
  {jan:"4977777777777", name:"ふわふわ猫じゃらし", maker:"Nyan Works", type:"おもちゃ"}
];

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
function renderPlaces(){
  const q=$("#placeSearch").value.toLowerCase();
  const arr=places.filter(x=>(placeFilter==="すべて"||x.type===placeFilter)&&(`${x.name}${x.area}${x.type}`.toLowerCase().includes(q)));
  $("#placeList").innerHTML=arr.map(x=>`<div class="item"><div><b>${x.emoji} ${x.name}</b><div class="meta">${x.area} ・ ${x.note}</div></div><span>›</span></div>`).join("") || '<div class="empty">見つかりませんでした</div>';
}
$("#placeSearch").oninput=renderPlaces;
$$(".chip").forEach(c=>c.onclick=()=>{$$(".chip").forEach(x=>x.classList.remove("active"));c.classList.add("active");placeFilter=c.dataset.filter;renderPlaces();});

function renderProducts(){
  const q=$("#productSearch").value.toLowerCase();
  const arr=products.filter(x=>`${x.name}${x.maker}${x.type}`.toLowerCase().includes(q));
  $("#productList").innerHTML=arr.map(x=>`<div class="item"><div><b>🛍️ ${x.name}</b><div class="meta">${x.maker} ・ ${x.type}</div></div><span>›</span></div>`).join("") || '<div class="empty">商品が見つかりません</div>';
}
$("#productSearch").oninput=renderProducts;
$("#janSearchBtn").onclick=()=>{
  const jan=$("#janInput").value.trim();
  const p=products.find(x=>x.jan===jan);
  $("#janResult").innerHTML=p?`<b>✅ ${p.name}</b><br>${p.maker} ・ ${p.type}<br><small>JAN: ${p.jan}</small>`:`<b>未登録の商品です</b><br>JAN: ${jan||"未入力"}<br><small>今後、メーカー商品ページ検索と連携できます。</small>`;
};

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


function renderAll(){
  const p=activePet();
  if(p && !state.activePet) state.activePet=p.id;
  $("#helloPet").textContent=p?`${p.name}ちゃん、今日も元気？ ${petEmoji(p.type)}`:"ペットを登録しよう 🐶";
  renderPets(); renderHealth(); renderEvents(); renderPlaces(); renderProducts(); renderDocuments(); renderAlbum();
}
renderAll();

if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }

window.addEventListener("resize",()=>{ try{ renderHealth(); }catch(e){} });

try{if($("#docDate")&&!$("#docDate").value)$("#docDate").value=new Date().toISOString().slice(0,10);}catch(e){}

try{if($("#albumDate")&&!$("#albumDate").value)$("#albumDate").value=new Date().toISOString().slice(0,10);}catch(e){}

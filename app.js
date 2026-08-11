
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const state = JSON.parse(localStorage.getItem("pawpalState") || '{"pets":[],"activePet":null,"health":[],"events":[]}');

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

$("#saveHealthBtn").onclick=()=>{
  const p=activePet(); if(!p){ alert("先にペットを登録してください🐾"); go("pets"); return; }
  state.health.unshift({id:Date.now(),petId:p.id,date:new Date().toISOString().slice(0,10),weight:$("#weightInput").value,condition:$("#conditionInput").value,memo:$("#healthMemo").value.trim()});
  $("#weightInput").value=""; $("#healthMemo").value=""; save();
};

$("#saveEventBtn").onclick=()=>{
  const title=$("#eventTitle").value.trim(), date=$("#eventDate").value;
  if(!title || !date){ alert("タイトルと日付を入力してください🌷"); return; }
  state.events.push({id:Date.now(),type:$("#eventType").value,title,date});
  state.events.sort((a,b)=>a.date.localeCompare(b.date)); $("#eventTitle").value=""; $("#eventDate").value=""; save();
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

function renderEvents(){
  const today=new Date().toISOString().slice(0,10);
  const html=state.events.length?state.events.map(x=>`<div class="item"><div><b>${x.type} ${x.title}</b><div class="meta">${x.date}</div></div><button class="text-btn" onclick="deleteEvent(${x.id})">削除</button></div>`).join(""):'<div class="empty">予定はまだありません 📅</div>';
  $("#eventList").innerHTML=html;
  const todays=state.events.filter(x=>x.date===today);
  $("#todayList").innerHTML=todays.length?todays.map(x=>`<div class="item"><div><b>${x.type} ${x.title}</b><div class="meta">今日</div></div><span>✨</span></div>`).join(""):'<div class="empty">今日はゆっくりできそうです ☕️</div>';
}
window.deleteEvent=(id)=>{state.events=state.events.filter(x=>x.id!==id);save();};

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

function renderAll(){
  const p=activePet();
  if(p && !state.activePet) state.activePet=p.id;
  $("#helloPet").textContent=p?`${p.name}ちゃん、今日も元気？ ${petEmoji(p.type)}`:"ペットを登録しよう 🐶";
  renderPets(); renderHealth(); renderEvents(); renderPlaces(); renderProducts();
}
renderAll();

if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }

window.addEventListener("resize",()=>{ try{ renderHealth(); }catch(e){} });

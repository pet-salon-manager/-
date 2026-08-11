
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

$("#addPetBtn").onclick=()=>$("#petDialog").showModal();
$("#savePetBtn").onclick=(e)=>{
  e.preventDefault();
  const name=$("#petName").value.trim();
  if(!name) return;
  const p={id:Date.now(),name,type:$("#petType").value,birthday:$("#petBirthday").value,breed:$("#petBreed").value.trim()};
  state.pets.push(p); state.activePet=p.id; save(); $("#petDialog").close(); $("#petForm").reset();
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
  if(!state.pets.length){ box.innerHTML='<div class="empty">まだ登録がありません。<br>「＋ 追加」から登録してね 🐾</div>'; return; }
  state.pets.forEach(p=>{
    const d=document.createElement("button");
    d.className="pet-card"+(p.id===state.activePet?" active":"");
    d.innerHTML=`<span class="big">${petEmoji(p.type)}</span><b>${p.name}</b><small>${p.breed||p.type}</small>`;
    d.onclick=()=>{state.activePet=p.id;save();};
    box.appendChild(d);
  });
}

function renderHealth(){
  const p=activePet();
  const arr=state.health.filter(x=>!p || x.petId===p.id);
  const html=arr.length?arr.map(x=>`<div class="item"><div><b>${x.date} ・ ${x.condition}</b><div class="meta">${x.weight?`体重 ${x.weight}kg ・ `:""}${x.memo||"メモなし"}</div></div><span class="emoji">💗</span></div>`).join(""):'<div class="empty">健康記録はまだありません 🩺</div>';
  $("#healthList").innerHTML=html; $("#recentHealth").innerHTML=arr.slice(0,2).map(x=>`<div class="item"><div><b>${x.condition}</b><div class="meta">${x.date}${x.weight?` ・ ${x.weight}kg`:""}</div></div><span>🌿</span></div>`).join("") || '<div class="empty">まだ記録がありません</div>';
}

function renderEvents(){
  const today=new Date().toISOString().slice(0,10);
  const html=state.events.length?state.events.map(x=>`<div class="item"><div><b>${x.type} ${x.title}</b><div class="meta">${x.date}</div></div><button class="text-btn" onclick="deleteEvent(${x.id})">削除</button></div>`).join(""):'<div class="empty">予定はまだありません 📅</div>';
  $("#eventList").innerHTML=html;
  const todays=state.events.filter(x=>x.date===today);
  $("#todayList").innerHTML=todays.length?todays.map(x=>`<div class="item"><div><b>${x.type} ${x.title}</b><div class="meta">今日</div></div><span>✨</span></div>`).join(""):'<div class="empty">今日はゆっくりできそうです ☕️</div>';
}
window.deleteEvent=(id)=>{state.events=state.events.filter(x=>x.id!==id);save();};

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

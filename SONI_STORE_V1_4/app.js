(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const OWNER = "SoniOfficial";
  const REPO = "soni-store";
  const STORAGE = { apps: "soniStore14Apps", fav: "soniStoreFav", ratings: "soniStoreRatings", reviews: "soniStoreReviews", recent: "soniStoreRecent" };
  const fallbackApps = [
    {id:"soni-words",name:"SONI WORDS",category:"Education",version:"1.0",size:"—",developer:"SoniOfficial",description:"Барномаи омӯзиши луғат ва калимаҳо.",downloadUrl:"",icon:"assets/logo.svg",screenshots:[],featured:true,updated:"2026-11-12"},
    {id:"soni-english-world",name:"SONI ENGLISH WORLD",category:"Education",version:"1.0",size:"—",developer:"SoniOfficial",description:"Ҷаҳони омӯзиши забони англисӣ.",downloadUrl:"",icon:"assets/logo.svg",screenshots:[],featured:true,updated:"2026-11-12"},
    {id:"soni-tools",name:"SONI TOOLS",category:"Tools",version:"1.0",size:"—",developer:"SoniOfficial",description:"Маҷмӯи абзорҳои муфид барои телефон.",downloadUrl:"",icon:"assets/logo.svg",screenshots:[],featured:false,updated:"2026-11-12"}
  ];
  let apps = loadApps(), activeCategory = "Ҳама", selectedRating = 5, activeDetailId = null;
  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function read(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { toast("Хотираи браузер дастрас нест."); } }
  function loadApps() { const saved = read(STORAGE.apps, null); return Array.isArray(saved) ? saved : fallbackApps.map(a=>({...a})); }
  function toast(message) { const el=$("toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600); }
  function getFavs(){return read(STORAGE.fav,[])}
  function getRatings(){return read(STORAGE.ratings,{})}
  function getReviews(){return read(STORAGE.reviews,{})}
  function avgRating(id){const values=getRatings()[id]||[];return values.length?values.reduce((a,b)=>a+b,0)/values.length:0}
  function iconMarkup(app){const src=app.icon||"assets/logo.svg";return `<div class="app-icon">${src?`<img src="${safe(src)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='✦'">`:"✦"}</div>`}
  function renderCategories(){
    const cats=["Ҳама",...new Set(apps.map(a=>a.category).filter(Boolean))];
    $("categoryRow").innerHTML=cats.map(c=>`<button class="category-btn ${c===activeCategory?"active":""}" data-category="${safe(c)}">${safe(c)}</button>`).join("");
  }
  function visibleApps(){
    const q=$("searchInput").value.trim().toLowerCase(), sort=$("sortSelect").value;
    let list=apps.filter(a=>(activeCategory==="Ҳама"||a.category===activeCategory)&&[a.name,a.description,a.category,a.developer].join(" ").toLowerCase().includes(q));
    if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
    if(sort==="rating")list.sort((a,b)=>avgRating(b.id)-avgRating(a.id));
    if(sort==="newest")list.sort((a,b)=>(b.updated||"").localeCompare(a.updated||""));
    if(sort==="featured")list.sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured)));
    return list;
  }
  function renderApps(){
    const list=visibleApps(), favs=getFavs();
    $("resultCount").textContent=`${list.length} натиҷа`;
    $("statApps").textContent=apps.length;$("statCategories").textContent=new Set(apps.map(a=>a.category)).size;
    $("appGrid").innerHTML=list.map(a=>`<article class="app-card">
      <div class="app-top">${iconMarkup(a)}<div><div class="app-name">${safe(a.name)}</div><div class="app-meta">${safe(a.category)} · v${safe(a.version||"1.0")}</div></div></div>
      <p class="app-desc">${safe(a.description||"Маълумот дар бораи ин барнома.")}</p>
      <div class="app-bottom"><span class="rating">★ ${avgRating(a.id)?avgRating(a.id).toFixed(1):"Нав"} </span><div class="card-actions">
      <button class="small-btn" data-detail="${safe(a.id)}">Маълумот</button><button class="small-btn gold" data-fav="${safe(a.id)}" aria-label="Дӯстдошта">${favs.includes(a.id)?"♥":"♡"}</button></div></div>
    </article>`).join("");
    $("emptyState").classList.toggle("hidden",list.length!==0);
    renderRecent();
  }
  function renderRecent(){
    const ids=read(STORAGE.recent,[]), recent=ids.map(id=>apps.find(a=>a.id===id)).filter(Boolean);
    $("recentWrap").classList.toggle("hidden",!recent.length);
    $("recentList").innerHTML=recent.map(a=>`<div class="recent-item" data-detail="${safe(a.id)}">✦ ${safe(a.name)}<small style="display:block;color:#999">${safe(a.category)}</small></div>`).join("");
  }
  function openDetail(id){
    const a=apps.find(x=>x.id===id);if(!a)return;activeDetailId=id;
    const recent=read(STORAGE.recent,[]).filter(x=>x!==id);recent.unshift(id);write(STORAGE.recent,recent.slice(0,6));
    const reviews=getReviews()[id]||[];
    const shots=(a.screenshots||[]).filter(Boolean);
    $("detailContent").innerHTML=`<div class="detail-head">${iconMarkup(a)}<div><div class="eyebrow">${safe(a.category)}</div><h2 id="detailTitle">${safe(a.name)}</h2><div class="app-meta">${safe(a.developer||"SoniOfficial")} · v${safe(a.version||"1.0")} · ${safe(a.size||"—")}</div></div></div>
      <p class="detail-copy">${safe(a.description||"Маълумот дастрас нест.")}</p>
      ${shots.length?`<div class="detail-screens">${shots.map(s=>`<img src="${safe(s)}" alt="Скриншоти ${safe(a.name)}" loading="lazy">`).join("")}</div>`:""}
      <div class="detail-actions">${a.downloadUrl?`<a class="primary-btn" href="${safe(a.downloadUrl)}" target="_blank" rel="noopener noreferrer">↓ Зеркашии APK</a>`:`<button class="primary-btn" disabled title="Линки APK ҳоло илова нашудааст">APK ҳоло дастрас нест</button>`}<button class="outline-btn" data-fav="${safe(a.id)}">${getFavs().includes(a.id)?"♥ Дар дӯстдошта":"♡ Ба дӯстдошта"}</button></div>
      <div class="review-area"><h3>Баҳо диҳед</h3><div class="stars">${[1,2,3,4,5].map(n=>`<button class="star-btn ${n<=selectedRating?"selected":""}" data-star="${n}" aria-label="${n} ситора">★</button>`).join("")}</div><button class="outline-btn" id="rateSubmit">Сабти рейтинг</button><h3>Шарҳҳо (${reviews.length})</h3><textarea id="reviewText" rows="2" maxlength="300" placeholder="Назари худро нависед..."></textarea><button class="outline-btn" id="reviewSubmit" style="margin-top:8px">Иловаи шарҳ</button><div class="review-list">${reviews.map(r=>`<div class="review-item">★ ${r.rating||"—"} — ${safe(r.text)}</div>`).join("")}</div></div>`;
    $("detailModal").classList.remove("hidden");renderRecent();
  }
  function closeModal(name){$(name==="detail"?"detailModal":"adminModal").classList.add("hidden")}
  function toggleFav(id){let f=getFavs();f=f.includes(id)?f.filter(x=>x!==id):[...f,id];write(STORAGE.fav,f);renderApps();if(activeDetailId)openDetail(activeDetailId);toast(f.includes(id)?"Ба дӯстдошта илова шуд":"Аз дӯстдошта хориҷ шуд")}
  function resetForm(){ $("appForm").reset();$("editId").value="";$("saveAppBtn").textContent="+ Нигоҳ доштан";$("cancelEdit").classList.add("hidden"); }
  function renderAdmin(){
    $("adminList").innerHTML=apps.map(a=>`<div class="admin-row"><div><strong>${safe(a.name)}</strong><small>${safe(a.category)} · ${safe(a.version||"1.0")}</small></div><div class="admin-row-actions"><button class="small-btn" data-edit="${safe(a.id)}">Таҳрир</button><button class="small-btn" data-delete="${safe(a.id)}">Нест</button></div></div>`).join("")||"<p class='app-meta'>Ҳоло барнома нест.</p>";
  }
  function persistApps(){write(STORAGE.apps,apps);renderCategories();renderApps();renderAdmin()}
  function editApp(id){
    const a=apps.find(x=>x.id===id);if(!a)return;
    $("editId").value=a.id;$("appName").value=a.name;$("appCategory").value=a.category;$("appVersion").value=a.version||"";$("appSize").value=a.size||"";$("appDeveloper").value=a.developer||"";$("appDownload").value=a.downloadUrl||"";$("appIcon").value=a.icon||"";$("appDescription").value=a.description||"";$("appScreenshots").value=(a.screenshots||[]).join("\n");
    $("saveAppBtn").textContent="Сабти тағйирот";$("cancelEdit").classList.remove("hidden");$("appName").focus();
  }
  function exportJSON(){
    const blob=new Blob([JSON.stringify(apps,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="apps.json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast("apps.json содир шуд");
  }
  function validateApps(data){return Array.isArray(data)&&data.every(a=>a&&typeof a.id==="string"&&typeof a.name==="string"&&typeof a.category==="string")}
  function bindEvents(){
    $("searchInput").addEventListener("input",renderApps);$("sortSelect").addEventListener("change",renderApps);
    $("categoryRow").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;renderCategories();renderApps()});
    $("appGrid").addEventListener("click",e=>{const d=e.target.closest("[data-detail]"),f=e.target.closest("[data-fav]");if(d)openDetail(d.dataset.detail);if(f)toggleFav(f.dataset.fav)});
    $("recentList").addEventListener("click",e=>{const d=e.target.closest("[data-detail]");if(d)openDetail(d.dataset.detail)});
    $("detailContent").addEventListener("click",e=>{
      const f=e.target.closest("[data-fav]"),s=e.target.closest("[data-star]");
      if(f){toggleFav(f.dataset.fav);return}
      if(s){selectedRating=Number(s.dataset.star);$("detailContent").querySelectorAll("[data-star]").forEach(b=>b.classList.toggle("selected",Number(b.dataset.star)<=selectedRating));return}
      if(e.target.id==="rateSubmit"){const all=getRatings();all[activeDetailId]=[...(all[activeDetailId]||[]),selectedRating].slice(-30);write(STORAGE.ratings,all);toast("Рейтинг сабт шуд");renderApps();return}
      if(e.target.id==="reviewSubmit"){const t=$("reviewText").value.trim();if(!t){toast("Аввал шарҳ нависед");return}const all=getReviews();all[activeDetailId]=[...(all[activeDetailId]||[]),{text:t,rating:selectedRating,date:new Date().toISOString()}].slice(-30);write(STORAGE.reviews,all);openDetail(activeDetailId);toast("Шарҳ илова шуд")}
    });
    document.body.addEventListener("click",e=>{const c=e.target.closest("[data-close]");if(c)closeModal(c.dataset.close)});
    $("adminOpen").addEventListener("click",()=>{$("adminModal").classList.remove("hidden");renderAdmin()});
    $("appForm").addEventListener("submit",e=>{
      e.preventDefault();const id=$("editId").value||("app-"+Date.now());
      const old=apps.find(a=>a.id===id);
      const item={id,name:$("appName").value.trim(),category:$("appCategory").value.trim(),version:$("appVersion").value.trim()||"1.0",size:$("appSize").value.trim()||"—",developer:$("appDeveloper").value.trim()||"SoniOfficial",downloadUrl:$("appDownload").value.trim(),icon:$("appIcon").value.trim()||"assets/logo.svg",description:$("appDescription").value.trim(),screenshots:$("appScreenshots").value.split("\n").map(x=>x.trim()).filter(Boolean),featured:old?.featured||false,updated:new Date().toISOString().slice(0,10)};
      if(old)apps=apps.map(a=>a.id===id?item:a);else apps.unshift(item);persistApps();resetForm();toast("Маълумоти барнома нигоҳ дошта шуд");
    });
    $("cancelEdit").addEventListener("click",resetForm);
    $("adminList").addEventListener("click",e=>{
      const ed=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");
      if(ed)editApp(ed.dataset.edit);
      if(del&&confirm("Ин барномаро нест мекунед?")){apps=apps.filter(a=>a.id!==del.dataset.delete);persistApps();toast("Барнома нест шуд")}
    });
    $("exportBtn").addEventListener("click",exportJSON);
    $("importFile").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!validateApps(data))throw new Error("Формати JSON нодуруст аст");apps=data;persistApps();toast("Маълумот ворид карда шуд")}catch(err){toast(err.message||"Хатои Import")}e.target.value=""});
    $("resetBtn").addEventListener("click",()=>{if(confirm("Маълумоти маҳаллиро ба намунаи аввал баргардонем?")){apps=fallbackApps.map(a=>({...a}));persistApps();toast("Барқарор шуд")}});
    $("requestForm").addEventListener("submit",e=>{e.preventDefault();const name=$("requestName").value.trim(),details=$("requestDetails").value.trim();if(!name)return;const title=encodeURIComponent("Дархости барнома: "+name),body=encodeURIComponent("Номи барнома: "+name+"\n\nМаълумоти иловагӣ:\n"+details+"\n\nФиристода шудааст аз SONI STORE.");window.open(`https://github.com/${OWNER}/${REPO}/issues/new?title=${title}&body=${body}`,"_blank","noopener");});
    $("clearRecent").addEventListener("click",()=>{write(STORAGE.recent,[]);renderRecent()});
    $("menuToggle").addEventListener("click",()=>$("main").previousElementSibling.querySelector(".nav").classList.toggle("open"));
    document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal("detail");closeModal("admin")}});
  }
  async function init(){
    try{const res=await fetch("data/apps.json",{cache:"no-store"});if(res.ok){const data=await res.json();if(validateApps(data)&&!localStorage.getItem(STORAGE.apps))apps=data}}catch(_){}
    $("year").textContent=new Date().getFullYear();bindEvents();renderCategories();renderApps();
  }
  init();
})();

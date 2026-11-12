'use strict';

const GITHUB_OWNER = 'SoniOfficial';
const GITHUB_REPO = 'soni-store';
const DATA_URL = 'data/apps.json';
const STORAGE = {
  apps: 'soni_store_v13_apps',
  favorites: 'soni_store_v13_favorites',
  reviews: 'soni_store_v13_reviews'
};

const sampleApps = [
  {id:'soni-words',name:'SONI WORDS',category:'Education',version:'1.0.0',size:'25 MB',developer:'SoniOfficial',description:'Барномаи омӯзиши калимаҳо ва забонҳо. Барои зиёд кардани захираи луғат ва машқҳои ҳаррӯза.',downloadUrl:'',icon:'',website:'',featured:true,updated:'2026-11-12'},
  {id:'soni-english-world',name:'SONI ENGLISH WORLD',category:'Education',version:'1.0.0',size:'35 MB',developer:'SoniOfficial',description:'Ҷаҳони омӯзиши забони англисӣ бо дарсҳо, машқҳо ва таҷрибаи интерактивӣ.',downloadUrl:'',icon:'',website:'',featured:true,updated:'2026-11-12'},
  {id:'soni-tools',name:'SONI TOOLS',category:'Tools',version:'1.0.0',size:'18 MB',developer:'SoniOfficial',description:'Маҷмӯи абзорҳои муфид барои корҳои ҳаррӯза дар телефон.',downloadUrl:'',icon:'',website:'',featured:false,updated:'2026-11-12'}
];

const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value='') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeUrl = (value='') => {
  try { const url = new URL(value); return ['http:','https:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
};
const readJSON = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
};
let apps = readJSON(STORAGE.apps, null);
if (!Array.isArray(apps)) apps = null;
let favorites = new Set(readJSON(STORAGE.favorites, []));
let reviews = readJSON(STORAGE.reviews, {});
let currentMode = 'all';
let toastTimer;

function notify(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function persistApps() { localStorage.setItem(STORAGE.apps, JSON.stringify(apps)); }
function persistFavorites() { localStorage.setItem(STORAGE.favorites, JSON.stringify([...favorites])); }
function persistReviews() { localStorage.setItem(STORAGE.reviews, JSON.stringify(reviews)); }
function ratingFor(id) {
  const list = Array.isArray(reviews[id]) ? reviews[id] : [];
  if (!list.length) return {average:0,count:0};
  return {average:list.reduce((sum,item)=>sum + Number(item.rating || 0),0)/list.length,count:list.length};
}
function stars(value) {
  const rounded = Math.round(value);
  return '★'.repeat(rounded) + '☆'.repeat(5-rounded);
}
function iconHTML(app) {
  const icon = safeUrl(app.icon);
  return icon ? `<img src="${escapeHTML(icon)}" alt="" loading="lazy" onerror="this.remove()">` : escapeHTML((app.name || 'S').trim().slice(0,2).toUpperCase());
}
function renderCategories() {
  const select = $('#categoryFilter');
  const selected = select.value || 'all';
  const categories = [...new Set(apps.map(app=>app.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  select.innerHTML = '<option value="all">Ҳама категорияҳо</option>' + categories.map(cat=>`<option value="${escapeHTML(cat)}">${escapeHTML(cat)}</option>`).join('');
  select.value = categories.includes(selected) ? selected : 'all';
}
function renderApps() {
  const query = $('#searchInput').value.trim().toLowerCase();
  const category = $('#categoryFilter').value;
  const sort = $('#sortSelect').value;
  let list = apps.filter(app => {
    const matchText = [app.name,app.category,app.description,app.developer].join(' ').toLowerCase().includes(query);
    const matchCategory = category === 'all' || app.category === category;
    const matchFavorite = currentMode !== 'favorites' || favorites.has(app.id);
    return matchText && matchCategory && matchFavorite;
  });
  if (sort === 'name') list.sort((a,b)=>a.name.localeCompare(b.name));
  if (sort === 'rating') list.sort((a,b)=>ratingFor(b.id).average-ratingFor(a.id).average);
  if (sort === 'newest') list.sort((a,b)=>String(b.updated||'').localeCompare(String(a.updated||'')));
  if (sort === 'featured') list.sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured)));
  $('#appsGrid').innerHTML = list.map(app => {
    const rating = ratingFor(app.id);
    const download = safeUrl(app.downloadUrl);
    return `<article class="app-card">
      <div class="card-top"><div class="app-icon">${iconHTML(app)}</div><div style="min-width:0"><div class="app-title">${escapeHTML(app.name)}</div><div class="app-category">${escapeHTML(app.category || 'Other')}</div></div>
      <button class="favorite-btn ${favorites.has(app.id)?'selected':''}" data-favorite="${escapeHTML(app.id)}" aria-label="Дӯстдошта">♡</button></div>
      <p class="card-description">${escapeHTML(app.description || 'Тавсиф дастрас нест.')}</p>
      <div class="card-meta"><span class="stars">${stars(rating.average)}</span><span>${rating.count ? rating.average.toFixed(1)+' ('+rating.count+')' : 'Бе баҳо'}</span><span>${escapeHTML(app.size||'—')}</span></div>
      <div class="card-actions"><button class="secondary-btn" data-details="${escapeHTML(app.id)}" type="button">Маълумот</button>${download?`<a class="primary-btn" href="${escapeHTML(download)}" target="_blank" rel="noopener">↓ Зеркашӣ</a>`:'<button class="primary-btn" data-request="${escapeHTML(app.name)}" type="button">Дархост</button>'}</div>
    </article>`;
  }).join('');
  $('#emptyState').classList.toggle('hidden', list.length !== 0);
  $('#resultCount').textContent = `${list.length} натиҷа`;
  $('#totalApps').textContent = apps.length;
  $('#favoriteCount').textContent = favorites.size;
}
function openDetails(id) {
  const app = apps.find(item=>item.id===id);
  if (!app) return;
  const rating = ratingFor(id);
  const list = reviews[id] || [];
  const download = safeUrl(app.downloadUrl);
  const website = safeUrl(app.website);
  $('#detailContent').innerHTML = `<div class="detail-head"><div class="app-icon">${iconHTML(app)}</div><div><h2>${escapeHTML(app.name)}</h2><div class="app-category">${escapeHTML(app.category||'Other')} · ${escapeHTML(app.developer||'SoniOfficial')}</div><div class="stars">${stars(rating.average)} <small>${rating.count?rating.average.toFixed(1):'Бе баҳо'}</small></div></div></div>
    <p class="detail-description">${escapeHTML(app.description||'Тавсиф дастрас нест.')}</p>
    <div class="detail-meta"><span class="meta-pill">Версия: ${escapeHTML(app.version||'—')}</span><span class="meta-pill">Андоза: ${escapeHTML(app.size||'—')}</span><span class="meta-pill">Навсозӣ: ${escapeHTML(app.updated||'—')}</span></div>
    <div class="detail-actions">${download?`<a class="primary-btn" href="${escapeHTML(download)}" target="_blank" rel="noopener">↓ Зеркашии APK</a>`:'<span class="meta-pill">APK ҳоло дастрас нест</span>'}${website?`<a class="secondary-btn" href="${escapeHTML(website)}" target="_blank" rel="noopener">Сомона ↗</a>`:''}<button class="secondary-btn" data-review="${escapeHTML(id)}" type="button">★ Баҳо додан</button></div>
    <h3>Шарҳҳо (${list.length})</h3><div class="review-list">${list.length?list.slice().reverse().map(item=>`<div class="review-item"><b>${escapeHTML(item.name||'Меҳмон')}</b> <span class="stars">${stars(Number(item.rating)||0)}</span><p>${escapeHTML(item.text)}</p></div>`).join(''):'<p class="detail-description">Ҳоло шарҳ нест. Аввалин шуда назар навис!</p>'}</div>`;
  $('#detailDialog').showModal();
}
function openReview(id) {
  $('#reviewAppId').value = id;
  $('#reviewDialog').showModal();
}
function clearAppForm() {
  $('#appForm').reset();
  $('#editAppId').value = '';
  $('#appId').disabled = false;
  $('#saveAppBtn').textContent = '+ Иловаи барнома';
}
function renderAdmin() {
  $('#adminCount').textContent = apps.length;
  $('#adminList').innerHTML = apps.map(app=>`<div class="admin-row"><div class="app-icon">${iconHTML(app)}</div><div class="admin-row-name">${escapeHTML(app.name)}<small>${escapeHTML(app.category||'Other')} · ${escapeHTML(app.version||'')}</small></div><button type="button" data-edit="${escapeHTML(app.id)}">Таҳрир</button><button type="button" class="delete-btn" data-delete="${escapeHTML(app.id)}">Нест кардан</button></div>`).join('') || '<p class="detail-description">Каталог холӣ аст.</p>';
}
function startEdit(id) {
  const app = apps.find(item=>item.id===id);
  if (!app) return;
  $('#editAppId').value = id;
  $('#appName').value = app.name || '';
  $('#appId').value = app.id || '';
  $('#appId').disabled = true;
  $('#appCategory').value = app.category || '';
  $('#appVersion').value = app.version || '';
  $('#appSize').value = app.size || '';
  $('#appDeveloper').value = app.developer || '';
  $('#appDescription').value = app.description || '';
  $('#appDownload').value = app.downloadUrl || '';
  $('#appIcon').value = app.icon || '';
  $('#appWebsite').value = app.website || '';
  $('#saveAppBtn').textContent = 'Сабти тағйирот';
  $('#appName').focus();
}
function exportCatalog() {
  const blob = new Blob([JSON.stringify(apps,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'apps.json'; anchor.click();
  URL.revokeObjectURL(url);
  notify('Файли apps.json экспорт шуд');
}
async function importCatalog(file) {
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed)) throw new Error('JSON бояд массиви барномаҳо бошад');
    const ids = new Set();
    for (const app of parsed) {
      if (!app || typeof app.id !== 'string' || typeof app.name !== 'string' || typeof app.category !== 'string' || typeof app.description !== 'string') throw new Error('Дар ҳар барнома id, name, category ва description лозим аст');
      if (ids.has(app.id)) throw new Error('ID такрорӣ аст: '+app.id);
      ids.add(app.id);
      if (app.downloadUrl && !safeUrl(app.downloadUrl)) throw new Error('URL-и APK нодуруст аст: '+app.name);
    }
    apps = parsed;
    persistApps(); renderCategories(); renderApps(); renderAdmin();
    notify('Каталог бомуваффақият ворид шуд');
  } catch(error) { notify('Хато: '+error.message); }
  $('#importInput').value = '';
}

async function loadCatalog() {
  if (apps) return;
  try {
    const response = await fetch(DATA_URL,{cache:'no-store'});
    if (!response.ok) throw new Error('HTTP '+response.status);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Формати apps.json нодуруст аст');
    apps = data;
  } catch(error) {
    apps = sampleApps;
    console.warn('SONI STORE: sample catalog loaded.',error);
  }
}

document.addEventListener('click', event => {
  const favorite = event.target.closest('[data-favorite]');
  if (favorite) {
    const id = favorite.dataset.favorite;
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    persistFavorites(); renderApps(); return;
  }
  const detail = event.target.closest('[data-details]');
  if (detail) { openDetails(detail.dataset.details); return; }
  const review = event.target.closest('[data-review]');
  if (review) { $('#detailDialog').close(); openReview(review.dataset.review); return; }
  const edit = event.target.closest('[data-edit]');
  if (edit) { startEdit(edit.dataset.edit); return; }
  const del = event.target.closest('[data-delete]');
  if (del) {
    const app = apps.find(item=>item.id===del.dataset.delete);
    if (app && confirm(`Барномаи "${app.name}" нест карда шавад?`)) {
      apps = apps.filter(item=>item.id!==del.dataset.delete);
      favorites.delete(del.dataset.delete); delete reviews[del.dataset.delete];
      persistApps(); persistFavorites(); persistReviews();
      renderCategories(); renderApps(); renderAdmin(); notify('Барнома нест карда шуд');
    }
    return;
  }
  const request = event.target.closest('[data-request]');
  if (request) {
    const title = encodeURIComponent('Дархости APK: '+request.dataset.request);
    window.open(`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new?title=${title}`,'_blank','noopener');
  }
});

$('#searchInput').addEventListener('input',renderApps);
$('#categoryFilter').addEventListener('change',renderApps);
$('#sortSelect').addEventListener('change',renderApps);
$('#homeNav').addEventListener('click',()=>{currentMode='all';$('#homeNav').classList.add('active');$('#favoritesNav').classList.remove('active');$('#catalogTitle').textContent='Каталоги барномаҳо';renderApps();$('#catalog').scrollIntoView({behavior:'smooth'});});
$('#favoritesNav').addEventListener('click',()=>{currentMode='favorites';$('#favoritesNav').classList.add('active');$('#homeNav').classList.remove('active');$('#catalogTitle').textContent='Дӯстдоштаҳои ман';renderApps();$('#catalog').scrollIntoView({behavior:'smooth'});});
$('#adminNav').addEventListener('click',()=>{renderAdmin();$('#adminDialog').showModal();});
$('#resetFilters').addEventListener('click',()=>{$('#searchInput').value='';$('#categoryFilter').value='all';currentMode='all';renderApps();});
$('#reviewForm').addEventListener('submit',event=>{
  event.preventDefault();
  const id=$('#reviewAppId').value;
  const text=$('#reviewText').value.trim();
  if(!text){notify('Матни шарҳро навис');return;}
  if(!Array.isArray(reviews[id])) reviews[id]=[];
  reviews[id].push({rating:Number($('#reviewRating').value),name:$('#reviewName').value.trim()||'Меҳмон',text,date:new Date().toISOString()});
  persistReviews();$('#reviewDialog').close();$('#reviewForm').reset();renderApps();openDetails(id);notify('Ташаккур барои баҳо!');
});
$('#appForm').addEventListener('submit',event=>{
  event.preventDefault();
  const editing=$('#editAppId').value;
  const id=editing||$('#appId').value.trim();
  const download=$('#appDownload').value.trim();
  const icon=$('#appIcon').value.trim();
  const website=$('#appWebsite').value.trim();
  if(download&&!safeUrl(download)){notify('URL-и APK бояд http ё https бошад');return;}
  if(icon&&!safeUrl(icon)){notify('URL-и тасвир нодуруст аст');return;}
  if(website&&!safeUrl(website)){notify('URL-и сомона нодуруст аст');return;}
  const existing=apps.find(item=>item.id===id)||{};
  const record={...existing,id,name:$('#appName').value.trim(),category:$('#appCategory').value.trim(),version:$('#appVersion').value.trim(),size:$('#appSize').value.trim(),developer:$('#appDeveloper').value.trim()||'SoniOfficial',description:$('#appDescription').value.trim(),downloadUrl:download,icon,website,featured:Boolean(existing.featured),updated:new Date().toISOString().slice(0,10)};
  if(editing) apps=apps.map(item=>item.id===editing?record:item); else apps.push(record);
  persistApps();clearAppForm();renderCategories();renderApps();renderAdmin();notify(editing?'Тағйирот сабт шуд':'Барнома илова шуд');
});
$('#clearFormBtn').addEventListener('click',clearAppForm);
$('#exportBtn').addEventListener('click',exportCatalog);
$('#importInput').addEventListener('change',event=>{const file=event.target.files?.[0];if(file)importCatalog(file);});
$('#resetDataBtn').addEventListener('click',()=>{
  if(!confirm('Каталог ба намунаи аввал барқарор шавад?'))return;
  apps=sampleApps.map(item=>({...item}));persistApps();renderCategories();renderApps();renderAdmin();notify('Каталоги намунавӣ барқарор шуд');
});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$('#'+button.dataset.close).close()));
['detailDialog','reviewDialog','adminDialog'].forEach(id=>$('#'+id).addEventListener('click',event=>{if(event.target===$('#'+id))$('#'+id).close();}));
$('#requestLink').href=`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new`;
$('#year').textContent=new Date().getFullYear();

loadCatalog().then(()=>{renderCategories();renderApps();});

const grid = document.getElementById("appGrid");
const searchInput = document.getElementById("searchInput");
const filters = document.getElementById("filters");
const dialog = document.getElementById("appDialog");
const dialogContent = document.getElementById("dialogContent");
const reviewDialog = document.getElementById("reviewDialog");
const reviewContent = document.getElementById("reviewContent");
let apps = [];
let activeCategory = "Ҳама";
let favorites = JSON.parse(localStorage.getItem("soniStoreFavorites") || "[]");
let ratings = JSON.parse(localStorage.getItem("soniStoreRatings") || "{}");
let reviews = JSON.parse(localStorage.getItem("soniStoreReviews") || "{}");

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("menuBtn").addEventListener("click", () => document.getElementById("nav").classList.toggle("open"));
document.getElementById("closeDialog").addEventListener("click", () => dialog.close());
document.getElementById("closeReviewDialog").addEventListener("click", () => reviewDialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
reviewDialog.addEventListener("click", e => { if (e.target === reviewDialog) reviewDialog.close(); });
document.getElementById("sortSelect").addEventListener("change", render);

fetch("data/apps.json").then(r => { if (!r.ok) throw new Error("Catalog not found"); return r.json(); })
  .then(data => { apps = data.apps || []; document.getElementById("appCount").textContent = apps.length; render(); })
  .catch(() => { grid.innerHTML = '<div class="empty">Каталог бор нашуд. Файли data/apps.json-ро санҷед.</div>'; });

function average(id) {
  const list = ratings[id] || [];
  return list.length ? list.reduce((a,b) => a + b, 0) / list.length : 0;
}
function render() {
  const term = searchInput.value.trim().toLowerCase();
  let filtered = apps.filter(app => {
    const matchesTerm = [app.name, app.description, app.category].join(" ").toLowerCase().includes(term);
    const matchesCategory = activeCategory === "Ҳама" || (activeCategory === "Дӯстдошта" ? favorites.includes(app.id) : app.category === activeCategory);
    return matchesTerm && matchesCategory;
  });
  const sort = document.getElementById("sortSelect").value;
  if (sort === "name") filtered.sort((a,b) => a.name.localeCompare(b.name));
  if (sort === "rating") filtered.sort((a,b) => average(b.id) - average(a.id));
  if (!filtered.length) { grid.innerHTML = '<div class="empty">Барнома ёфт нашуд.</div>'; return; }
  grid.innerHTML = filtered.map(app => {
    const avg = average(app.id);
    return `<article class="app-card">
      <div class="app-top"><div class="app-icon">${escapeHtml(app.icon || "✦")}</div><div><h3>${escapeHtml(app.name)}</h3><span class="category">${escapeHtml(app.category || "Дигар")}</span></div></div>
      <p>${escapeHtml(app.description || "")}</p>
      <div class="card-meta"><span>Версия: ${escapeHtml(app.version || "—")}</span><span>${escapeHtml(app.size || "—")}</span><span>★ ${avg ? avg.toFixed(1) : "—"}</span></div>
      <div class="card-actions">
        <button onclick="showDetails('${safeId(app.id)}')">Маълумот</button>
        ${app.downloadUrl ? `<a class="download" href="${escapeAttr(app.downloadUrl)}" target="_blank" rel="noopener">⬇ Зеркашӣ</a>` : '<button disabled title="Ҳоло дастрас нест">Омода мешавад</button>'}
        <button class="favorite ${favorites.includes(app.id) ? "saved" : ""}" aria-label="Дӯстдошта" onclick="toggleFavorite('${safeId(app.id)}')">${favorites.includes(app.id) ? "♥" : "♡"}</button>
      </div>
      <button class="review-link" onclick="openReviews('${safeId(app.id)}')">★ Баҳо ва шарҳҳо (${(reviews[app.id] || []).length})</button>
    </article>`;
  }).join("");
}
function showDetails(id) {
  const app = apps.find(a => a.id === id); if (!app) return;
  const shots = (app.screenshots || []).map(src => `<img src="${escapeAttr(src)}" alt="Скриншоти ${escapeAttr(app.name)}">`).join("");
  const avg = average(id);
  dialogContent.innerHTML = `<div class="dialog-icon">${escapeHtml(app.icon || "✦")}</div><h2>${escapeHtml(app.name)}</h2><p>${escapeHtml(app.description || "")}</p><div class="dialog-meta"><span>Категория: ${escapeHtml(app.category || "—")}</span><span>Версия: ${escapeHtml(app.version || "—")}</span><span>Ҳаҷм: ${escapeHtml(app.size || "—")}</span><span>Навсозӣ: ${escapeHtml(app.updated || "—")}</span><span>Таҳиягар: ${escapeHtml(app.developer || "SONI")}</span><span>Рейтинг: ${avg ? avg.toFixed(1) + " / 5" : "Ҳоло баҳо нест"}</span></div>${shots ? `<div class="screenshots">${shots}</div>` : ""}<p>${app.downloadUrl ? `<a class="primary-btn" href="${escapeAttr(app.downloadUrl)}" target="_blank" rel="noopener">⬇ Зеркашии барнома</a>` : '<span class="category">Ин барнома ҳоло дар омодагӣ аст.</span>'}</p><button class="review-link" onclick="openReviews('${safeId(id)}')">★ Баҳо додан ва навиштани шарҳ</button>`;
  dialog.showModal();
}
function openReviews(id) {
  const app = apps.find(a => a.id === id); if (!app) return;
  const list = reviews[id] || [];
  reviewContent.innerHTML = `<h2>Баҳо ва шарҳҳо</h2><p class="muted">${escapeHtml(app.name)}</p>
    <form id="reviewForm" class="review-form">
      <label>Баҳои ту</label><select id="ratingValue" required><option value="">Интихоб кун</option><option value="5">★★★★★ — Аъло</option><option value="4">★★★★ — Хуб</option><option value="3">★★★ — Миёна</option><option value="2">★★ — Бад</option><option value="1">★ — Хеле бад</option></select>
      <label>Номи ту (ихтиёрӣ)</label><input id="reviewName" maxlength="35" placeholder="Меҳмон">
      <label>Шарҳ</label><textarea id="reviewText" maxlength="400" required placeholder="Назари худро навис..."></textarea>
      <button class="primary-btn" type="submit">Фиристодани баҳо</button>
    </form>
    <div class="review-list">${list.length ? list.slice().reverse().map(r => `<article><b>${escapeHtml(r.name || "Меҳмон")}</b><span class="stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</span><p>${escapeHtml(r.text)}</p><small>${escapeHtml(r.date)}</small></article>`).join("") : '<p class="muted">Ҳоло шарҳ нест. Аввалин шуда фикратро навис!</p>'}</div>
    <p class="notice">Эзоҳ: баҳоҳо ва шарҳҳо дар ҳамин браузер нигоҳ дошта мешаванд; онҳо ҳоло барои ҳамаи меҳмонон умумӣ нестанд.</p>`;
  dialog.close();
  reviewDialog.showModal();
  document.getElementById("reviewForm").addEventListener("submit", e => {
    e.preventDefault();
    const rating = Number(document.getElementById("ratingValue").value);
    const text = document.getElementById("reviewText").value.trim();
    if (!rating || !text) return;
    ratings[id] = [...(ratings[id] || []), rating];
    reviews[id] = [...(reviews[id] || []), {rating, text, name: document.getElementById("reviewName").value.trim(), date: new Date().toLocaleDateString("tg-TJ")}];
    localStorage.setItem("soniStoreRatings", JSON.stringify(ratings));
    localStorage.setItem("soniStoreReviews", JSON.stringify(reviews));
    reviewDialog.close(); render();
  });
}
function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
  localStorage.setItem("soniStoreFavorites", JSON.stringify(favorites)); render();
}
function safeId(value) { return String(value).replace(/[^a-zA-Z0-9_-]/g, ""); }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function escapeAttr(value) { return escapeHtml(value); }
searchInput.addEventListener("input", render);
filters.addEventListener("click", e => {
  const button = e.target.closest("button[data-category]"); if (!button) return;
  activeCategory = button.dataset.category;
  filters.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === button)); render();
});
window.showDetails = showDetails; window.toggleFavorite = toggleFavorite; window.openReviews = openReviews;

const grid = document.getElementById("appGrid");
const searchInput = document.getElementById("searchInput");
const filters = document.getElementById("filters");
const dialog = document.getElementById("appDialog");
const dialogContent = document.getElementById("dialogContent");
let apps = [];
let activeCategory = "Ҳама";
let favorites = JSON.parse(localStorage.getItem("soniStoreFavorites") || "[]");

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("menuBtn").addEventListener("click", () => document.getElementById("nav").classList.toggle("open"));
document.getElementById("closeDialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });

fetch("data/apps.json").then(r => { if (!r.ok) throw new Error("Catalog not found"); return r.json(); })
  .then(data => { apps = data.apps || []; document.getElementById("appCount").textContent = apps.length; render(); })
  .catch(() => { grid.innerHTML = '<div class="empty">Каталог бор нашуд. Файли data/apps.json-ро санҷед.</div>'; });

function render() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = apps.filter(app => {
    const matchesTerm = [app.name, app.description, app.category].join(" ").toLowerCase().includes(term);
    const matchesCategory = activeCategory === "Ҳама" || (activeCategory === "Дӯстдошта" ? favorites.includes(app.id) : app.category === activeCategory);
    return matchesTerm && matchesCategory;
  });
  if (!filtered.length) { grid.innerHTML = '<div class="empty">Барнома ёфт нашуд.</div>'; return; }
  grid.innerHTML = filtered.map(app => `
    <article class="app-card">
      <div class="app-top"><div class="app-icon">${escapeHtml(app.icon || "✦")}</div><div><h3>${escapeHtml(app.name)}</h3><span class="category">${escapeHtml(app.category || "Дигар")}</span></div></div>
      <p>${escapeHtml(app.description || "")}</p>
      <div class="card-meta"><span>Версия: ${escapeHtml(app.version || "—")}</span><span>${escapeHtml(app.size || "—")}</span></div>
      <div class="card-actions">
        <button onclick="showDetails('${safeId(app.id)}')">Маълумот</button>
        ${app.downloadUrl ? `<a class="download" href="${escapeAttr(app.downloadUrl)}" target="_blank" rel="noopener">⬇ Зеркашӣ</a>` : '<button disabled title="Ҳоло дастрас нест">Омода мешавад</button>'}
        <button class="favorite ${favorites.includes(app.id) ? "saved" : ""}" aria-label="Дӯстдошта" onclick="toggleFavorite('${safeId(app.id)}')">${favorites.includes(app.id) ? "♥" : "♡"}</button>
      </div>
    </article>`).join("");
}
function showDetails(id) {
  const app = apps.find(a => a.id === id); if (!app) return;
  const shots = (app.screenshots || []).map(src => `<img src="${escapeAttr(src)}" alt="Скриншоти ${escapeAttr(app.name)}">`).join("");
  dialogContent.innerHTML = `<div class="dialog-icon">${escapeHtml(app.icon || "✦")}</div><h2>${escapeHtml(app.name)}</h2><p>${escapeHtml(app.description || "")}</p><div class="dialog-meta"><span>Категория: ${escapeHtml(app.category || "—")}</span><span>Версия: ${escapeHtml(app.version || "—")}</span><span>Ҳаҷм: ${escapeHtml(app.size || "—")}</span><span>Навсозӣ: ${escapeHtml(app.updated || "—")}</span><span>Таҳиягар: ${escapeHtml(app.developer || "SONI")}</span></div>${shots ? `<div class="screenshots">${shots}</div>` : ""}<p>${app.downloadUrl ? `<a class="primary-btn" href="${escapeAttr(app.downloadUrl)}" target="_blank" rel="noopener">⬇ Зеркашии барнома</a>` : '<span class="category">Ин барнома ҳоло дар омодагӣ аст.</span>'}</p>`;
  dialog.showModal();
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
window.showDetails = showDetails; window.toggleFavorite = toggleFavorite;

const OWNER = "SoniOfficial";
const REPO = "soni-store";
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
let allApps = [];
let activeCategory = "Ҳама";

const $ = (id) => document.getElementById(id);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

async function loadApps() {
  const grid = $("appGrid");
  try {
    const response = await fetch("data/apps.json", {cache:"no-store"});
    if (!response.ok) throw new Error("Файли каталог дастрас нест");
    const data = await response.json();
    allApps = Array.isArray(data.apps) ? data.apps : [];
    renderApps();
  } catch (error) {
    grid.innerHTML = `<div class="empty-state"><h3>Каталог бор нашуд</h3><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function renderApps() {
  const query = $("searchInput").value.trim().toLocaleLowerCase();
  const filtered = allApps.filter(app => {
    const matchesCategory = activeCategory === "Ҳама" || app.category === activeCategory;
    const haystack = `${app.name} ${app.description} ${app.category} ${app.tags || ""}`.toLocaleLowerCase();
    return matchesCategory && haystack.includes(query);
  });
  $("appCount").textContent = `${filtered.length} барнома`;
  $("emptyState").classList.toggle("hidden", filtered.length > 0);
  $("appGrid").innerHTML = filtered.map((app, index) => `
    <article class="app-card" tabindex="0" role="button" data-index="${allApps.indexOf(app)}" aria-label="Маълумоти ${escapeHtml(app.name)}">
      <div class="app-card-top"><div class="app-icon">${escapeHtml(app.icon || "✦")}</div><span class="app-tag">${escapeHtml(app.category || "Барномаҳо")}</span></div>
      <h3>${escapeHtml(app.name)}</h3><p>${escapeHtml(app.description || "")}</p>
      <div class="app-card-bottom"><span>${escapeHtml(app.version || "Версия: —")} · ${escapeHtml(app.size || "Ҳаҷм: —")}</span><b>${app.downloadUrl ? "↓ Зеркашӣ" : "Ба наздикӣ"}</b></div>
    </article>`).join("");
  document.querySelectorAll(".app-card").forEach(card => {
    const open = () => showApp(Number(card.dataset.index));
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}

function showApp(index) {
  const app = allApps[index];
  if (!app) return;
  const download = app.downloadUrl
    ? `<a class="btn btn-gold dialog-download" href="${escapeHtml(app.downloadUrl)}" target="_blank" rel="noopener">↓ Зеркашии APK</a>`
    : `<span class="status-pill">Ин барнома ҳоло нашр нашудааст</span>`;
  $("dialogContent").innerHTML = `<div class="dialog-icon">${escapeHtml(app.icon || "✦")}</div><span class="eyebrow">${escapeHtml(app.category || "Барномаҳо")}</span><h2>${escapeHtml(app.name)}</h2><p class="dialog-meta">${escapeHtml(app.description || "")}</p><p class="dialog-meta">Версия: ${escapeHtml(app.version || "—")}<br>Ҳаҷм: ${escapeHtml(app.size || "—")}<br>Таҳиягар: ${escapeHtml(app.developer || OWNER)}</p>${download}`;
  $("appDialog").showModal();
}

document.querySelectorAll(".category-chip").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".category-chip").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  activeCategory = button.dataset.category;
  renderApps();
}));
$("searchInput").addEventListener("input", renderApps);
document.addEventListener("keydown", e => {
  if (e.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) { e.preventDefault(); $("searchInput").focus(); }
});
$("dialogClose").addEventListener("click", () => $("appDialog").close());
$("appDialog").addEventListener("click", e => { if (e.target === $("appDialog")) $("appDialog").close(); });

$("requestForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("requestName").value.trim();
  const category = $("requestCategory").value;
  const details = $("requestDetails").value.trim();
  const author = $("requestAuthor").value.trim();
  const title = `[Дархости барнома] ${name}`;
  const body = `## Маълумоти дархост\n- **Ном:** ${name}\n- **Категория:** ${category}\n- **GitHub:** ${author ? "@" + author : "Номаълум"}\n\n## Тавсиф ва хусусиятҳои лозима\n${details}\n\n---\nДархост тавассути SONI STORE фиристода шуд.`;
  const url = `https://github.com/${OWNER}/${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent("app-request")}`;
  $("formMessage").textContent = "Ҳоло саҳифаи GitHub кушода мешавад. Барои фиристодани дархост тугмаи Submit new issue-ро пахш кун.";
  window.open(url, "_blank", "noopener");
});

$("statusForm").addEventListener("submit", async e => {
  e.preventDefault();
  const number = Number($("issueNumber").value);
  const result = $("statusResult");
  result.textContent = "Ҳолат санҷида мешавад...";
  try {
    const response = await fetch(`${API_BASE}/issues/${number}`, {headers:{"Accept":"application/vnd.github+json"}});
    if (!response.ok) throw new Error(response.status === 404 ? "Дархост ёфт нашуд. Рақами Issue-ро санҷ." : "Ҳоло санҷидан имкон надорад. Баъдтар кӯшиш кун.");
    const issue = await response.json();
    if (issue.pull_request) throw new Error("Ин рақам ба Pull Request тааллуқ дорад, на дархост.");
    const state = issue.state === "open" ? "Дар баррасӣ" : "Пӯшида / анҷомёфта";
    result.innerHTML = `<span class="status-pill">${state}</span> <a href="${escapeHtml(issue.html_url)}" target="_blank" rel="noopener">#${issue.number} — ${escapeHtml(issue.title)} ↗</a>`;
  } catch (error) {
    result.textContent = error.message;
  }
});

$("year").textContent = new Date().getFullYear();
loadApps();

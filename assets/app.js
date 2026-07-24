// ===================== Angular Academy — app.js =====================
'use strict';

// ---------- Kulcsok (a state előtt kell lenniük!) ----------
const STORE_KEY = 'ngAcademyProgress';
const THEME_KEY = 'ngAcademyTheme';

// ---------- localStorage: haladás ----------
function loadDone() {
  try { return new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveDone() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify([...state.done])); } catch {}
}

const state = {
  questions: [],
  appfiles: [],
  meta: null,
  topic: 'all',
  level: 'all',
  search: '',
  done: loadDone(),
  view: 'questions',
};

// ---------- Téma ----------
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) document.documentElement.dataset.theme = saved;
  updateThemeIcon();
}
function toggleTheme() {
  const cur = document.documentElement.dataset.theme;
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch {}
  updateThemeIcon();
}
function updateThemeIcon() {
  const dark = document.documentElement.dataset.theme === 'dark';
  const icon = document.getElementById('themeIcon');
  icon.innerHTML = dark
    ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
    : '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>';
}

// ---------- Escape + egyszerű TS/HTML szintaxis-kiemelés ----------
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const TS_KEYWORDS = ['import','from','export','class','interface','extends','implements','constructor','return','const','let','var','function','new','this','public','private','protected','readonly','get','set','if','else','for','of','in','async','await','type','enum','as','void','null','undefined','true','false'];
function highlight(code, lang) {
  let out = esc(code);
  // kommentek
  out = out.replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>');
  // stringek (aposztróf, idézőjel, backtick)
  out = out.replace(/(`[^`]*`|'[^']*'|"[^"]*")/g, m =>
    m.includes('tok-com') ? m : `<span class="tok-str">${m}</span>`);
  // dekorátorok
  out = out.replace(/(@[A-Za-z]+)/g, '<span class="tok-dec">$1</span>');
  // kulcsszavak
  const kw = new RegExp('\\b(' + TS_KEYWORDS.join('|') + ')\\b', 'g');
  out = out.replace(kw, '<span class="tok-key">$1</span>');
  // típusok (nagybetűvel kezdődő szavak)
  out = out.replace(/\b([A-Z][A-Za-z0-9]+)\b/g, '<span class="tok-typ">$1</span>');
  // számok
  out = out.replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');
  return out;
}

// ---------- Kód-blokk HTML ----------
function codeBlockHTML(code, lang, label) {
  const hl = highlight(code, lang || 'typescript');
  return `<div class="code-block">
    ${label ? `<div class="code-label">${label}</div>` : ''}
    <button class="copy-btn" data-copy="${encodeURIComponent(code)}">másol</button>
    <pre><code>${hl}</code></pre>
  </div>`;
}

// ---------- Betöltés ----------
async function loadData() {
  const [q, a] = await Promise.all([
    fetch('data/questions.json').then(r => r.json()),
    fetch('data/appcode.json').then(r => r.json()),
  ]);
  state.questions = q.questions;
  state.meta = q.meta;
  state.appfiles = a.files;
}

// ---------- Topic-nevek térkép ----------
function topicName(id) {
  const t = state.meta.topics.find(t => t.id === id);
  return t ? t.name : id;
}

// ---------- Renderelés: oldalsáv topicok ----------
function renderTopics() {
  const list = document.getElementById('topicList');
  const mobile = document.getElementById('mobileTopic');
  const counts = state.meta.topicCounts;
  let html = `<button class="topic-btn ${state.topic==='all'?'active':''}" data-topic="all">
      <span class="dot"></span> Minden topic <span class="cnt">${state.meta.total}</span></button>`;
  let mobileHtml = `<option value="all">Minden topic (${state.meta.total})</option>`;
  state.meta.topics.forEach(t => {
    const c = counts[t.id] || 0;
    if (!c) return;
    html += `<button class="topic-btn ${state.topic===t.id?'active':''}" data-topic="${t.id}">
      <span class="dot"></span> ${t.name} <span class="cnt">${c}</span></button>`;
    mobileHtml += `<option value="${t.id}" ${state.topic===t.id?'selected':''}>${t.name} (${c})</option>`;
  });
  list.innerHTML = html;
  mobile.innerHTML = mobileHtml;

  list.querySelectorAll('.topic-btn').forEach(b =>
    b.onclick = () => { state.topic = b.dataset.topic; renderTopics(); renderCards(); });
  mobile.onchange = () => { state.topic = mobile.value; renderTopics(); renderCards(); };
}

// ---------- Renderelés: hero statisztika ----------
function renderStats() {
  const el = document.getElementById('heroStats');
  const lc = state.meta.levelCounts;
  el.innerHTML = `
    <div class="stat"><span class="num">${state.meta.total}</span><span class="lbl">kérdés</span></div>
    <div class="stat"><span class="num">${state.meta.topics.length}</span><span class="lbl">topic</span></div>
    <div class="stat"><span class="num">${lc.junior||0}</span><span class="lbl">junior</span></div>
    <div class="stat"><span class="num">${lc.medior||0}</span><span class="lbl">medior</span></div>
    <div class="stat"><span class="num">${lc.senior||0}</span><span class="lbl">senior</span></div>`;
}

// ---------- Szűrés ----------
function filtered() {
  const s = state.search.toLowerCase().trim();
  return state.questions.filter(q => {
    if (state.topic !== 'all' && q.topic !== state.topic) return false;
    if (state.level !== 'all' && q.level !== state.level) return false;
    if (s) {
      const hay = (q.q + ' ' + q.a + ' ' + (q.code||'') + ' ' + q.tags.join(' ')).toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });
}

// ---------- Renderelés: kérdés-kártyák ----------
function renderCards() {
  const wrap = document.getElementById('cards');
  const list = filtered();
  document.getElementById('resultCount').textContent =
    `${list.length} találat${state.search ? ` a(z) "${state.search}" keresésre` : ''}`;

  if (!list.length) {
    wrap.innerHTML = `<div class="empty-state">
      <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
      <p>Nincs találat. Próbálj más keresést vagy szűrőt.</p></div>`;
    return;
  }

  wrap.innerHTML = list.map(q => {
    const done = state.done.has(q.id);
    const appLink = q.appFile
      ? `<a class="app-link" data-appfile="${q.appFile}"><span class="arrow">→</span> Nézd meg a kódban: <code>${q.appFile.split('/').pop()}</code></a>`
      : '';
    const code = q.code ? codeBlockHTML(q.code, 'typescript', 'példakód') : '';
    return `<div class="card ${done?'done':''}" data-id="${q.id}">
      <div class="card-head">
        <div class="card-check" title="Kész?">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <div style="flex:1">
          <div class="card-qtext">${esc(q.q)}</div>
          <div class="card-meta">
            <span class="badge topic">${topicName(q.topic)}</span>
            <span class="badge level-${q.level}">${q.level}</span>
          </div>
        </div>
        <svg class="card-chevron" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      </div>
      <div class="card-body">
        <div class="answer">${esc(q.a)}</div>
        ${code}
        ${appLink}
      </div>
    </div>`;
  }).join('');

  // Események
  wrap.querySelectorAll('.card').forEach(card => {
    const id = +card.dataset.id;
    const head = card.querySelector('.card-head');
    const check = card.querySelector('.card-check');
    // kibontás
    head.onclick = (e) => {
      if (e.target.closest('.card-check')) return;
      card.classList.toggle('open');
    };
    // kész-jelölés
    check.onclick = (e) => {
      e.stopPropagation();
      if (state.done.has(id)) state.done.delete(id); else state.done.add(id);
      card.classList.toggle('done');
      saveDone(); renderProgress();
    };
  });

  // copy gombok
  wrap.querySelectorAll('.copy-btn').forEach(b =>
    b.onclick = (e) => { e.stopPropagation(); copyCode(b); });
  // app-link -> ugrás az app nézetre a fájlhoz
  wrap.querySelectorAll('.app-link').forEach(l =>
    l.onclick = () => openAppFile(l.dataset.appfile));
}

function copyCode(btn) {
  const code = decodeURIComponent(btn.dataset.copy);
  navigator.clipboard.writeText(code).then(() => {
    const old = btn.textContent; btn.textContent = 'másolva ✓';
    setTimeout(() => btn.textContent = old, 1400);
  }).catch(() => {});
}

// ---------- Haladás ----------
function renderProgress() {
  const total = state.questions.length;
  const done = state.done.size;
  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById('progressVal').textContent = `${done} / ${total}`;
  document.getElementById('progressFill').style.width = pct + '%';
}

// ---------- App-kód nézet ----------
function renderAppFiles() {
  const wrap = document.getElementById('appfiles');
  wrap.innerHTML = state.appfiles.map((f, i) => {
    const concepts = f.concepts.map(c => `<span class="badge topic">${c}</span>`).join('');
    const initials = f.name.replace(/\.(ts|html)$/, '').slice(0, 2).toUpperCase();
    return `<div class="appfile" data-path="${f.path}">
      <div class="appfile-head">
        <div class="appfile-icon">${initials}</div>
        <div class="appfile-info">
          <div class="appfile-name">${f.name}</div>
          <div class="appfile-path">${f.path}</div>
          <div class="appfile-desc">${esc(f.desc)}</div>
          <div class="appfile-concepts">${concepts}</div>
        </div>
        <svg class="card-chevron" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      </div>
      <div class="appfile-body">${codeBlockHTML(f.code, f.lang, f.name)}</div>
    </div>`;
  }).join('');

  wrap.querySelectorAll('.appfile').forEach(af => {
    af.querySelector('.appfile-head').onclick = () => af.classList.toggle('open');
    af.querySelectorAll('.copy-btn').forEach(b =>
      b.onclick = (e) => { e.stopPropagation(); copyCode(b); });
  });
}

function openAppFile(path) {
  setView('appcode');
  const target = document.querySelector(`.appfile[data-path="${path}"]`);
  if (target) {
    target.classList.add('open');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.style.transition = 'border-color .3s';
    target.style.borderColor = 'var(--blue)';
    setTimeout(() => target.style.borderColor = '', 1600);
  }
}

// ---------- Nézetváltás ----------
function setView(view) {
  state.view = view;
  document.getElementById('cardsView').classList.toggle('hidden', view !== 'questions');
  document.getElementById('appcodeView').classList.toggle('visible', view === 'appcode');
  document.getElementById('btnQuestions').classList.toggle('active', view === 'questions');
  document.getElementById('btnAppcode').classList.toggle('active', view === 'appcode');
}

// ---------- Init ----------
async function init() {
  initTheme();
  document.getElementById('themeToggle').onclick = toggleTheme;

  try {
    await loadData();
  } catch (e) {
    document.getElementById('cards').innerHTML =
      '<div class="empty-state"><p>Nem sikerült betölteni az adatokat. Ha helyben nyitottad meg a fájlt, indíts egy kis szervert (pl. <code>npx serve</code>), mert a böngésző a fetch-et blokkolhatja file:// alól.</p></div>';
    return;
  }

  renderTopics();
  renderStats();
  renderProgress();
  renderCards();
  renderAppFiles();

  // kereső
  const search = document.getElementById('search');
  let t;
  search.oninput = () => { clearTimeout(t); t = setTimeout(() => { state.search = search.value; renderCards(); }, 180); };

  // szint-szűrők
  document.querySelectorAll('#levelFilters .chip').forEach(chip =>
    chip.onclick = () => {
      document.querySelectorAll('#levelFilters .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.level = chip.dataset.level;
      renderCards();
    });

  // nézetváltó
  document.getElementById('btnQuestions').onclick = () => setView('questions');
  document.getElementById('btnAppcode').onclick = () => setView('appcode');

  // haladás visszaállítás
  document.getElementById('resetProgress').onclick = () => {
    if (confirm('Biztosan törlöd a haladásod? Ez nem vonható vissza.')) {
      state.done.clear(); saveDone(); renderProgress(); renderCards();
    }
  };
}

document.addEventListener('DOMContentLoaded', init);

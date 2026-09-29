// Frontend: consumes the REST API with fetch()
const API = '/api';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function api(path, options) {
  const res = await fetch(API + path, options);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.status === 204 ? null : res.json();
}

// ---- signal trace in the header (decorative) ----
function drawTrace() {
  let d = 'M0 60';
  for (let x = 0; x <= 1200; x += 6) {
    const beat = x > 520 && x < 640 ? Math.sin((x - 520) / 120 * Math.PI * 6) * 42 * Math.sin((x - 520) / 120 * Math.PI) : 0;
    const y = 60 + Math.sin(x / 38) * 10 + Math.sin(x / 11) * 3 + beat;
    d += ` L${x} ${y.toFixed(1)}`;
  }
  $('tracePath').setAttribute('d', d);
}

// ---- profile ----
async function loadProfile() {
  const p = await api('/profile');
  if (!p) return;
  $('fullName').textContent = p.full_name;
  if (p.nickname) $('nickname').textContent = `Hi, I'm ${p.nickname}`;
  $('group').textContent = p.student_group;
  $('email').textContent = p.email;
  $('email').href = `mailto:${p.email}`;
  $('city').textContent = p.city || '—';
  $('bio').textContent = p.bio;
  $('university').textContent = p.university || '';
  document.title = `${p.full_name} — portfolio`;
}

// ---- skills + likes ----
const liked = new Set();
const heart = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.4 1.1 5.2 3 1.8-1.9 3.2-3 5.2-3 3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z"/></svg>';

function skillRow(s) {
  const bars = [1, 2, 3, 4, 5].map((n) => `<i class="${n <= s.level ? 'on' : ''}"></i>`).join('');
  return `<div class="skill">
    <span>${esc(s.name)}</span>
    <span class="level" title="Level ${s.level} of 5" aria-label="Level ${s.level} of 5">${bars}</span>
    <button class="like ${liked.has(s.id) ? 'liked' : ''}" data-id="${s.id}" aria-label="Like ${esc(s.name)}">${heart}<span>${s.likes}</span></button>
  </div>`;
}

async function loadSkills() {
  const skills = await api('/skills');
  const groups = {};
  skills.forEach((s) => (groups[s.category] ??= []).push(s));
  $('skills').innerHTML = Object.entries(groups).map(([cat, list]) =>
    `<div class="cat"><h3>${esc(cat)}</h3>${list.map(skillRow).join('')}</div>`).join('');
}

$('skills').addEventListener('click', async (e) => {
  const btn = e.target.closest('.like');
  if (!btn || liked.has(+btn.dataset.id)) return;
  try {
    const s = await api(`/skills/${btn.dataset.id}/like`, { method: 'POST' });
    liked.add(s.id);
    btn.classList.add('liked');
    btn.querySelector('span').textContent = s.likes;
  } catch (err) { alert('Like not saved: ' + err.message); }
});

// ---- projects ----
function projectItem(p, skill = '') {
  const tags = p.tech.map((t) => {
    const hit = skill && t.toLowerCase().includes(skill.toLowerCase());
    return `<span class="${hit ? 'hit' : ''}">${esc(t)}</span>`;
  }).join('');
  return `<li><strong>${esc(p.name)}</strong><div>${esc(p.description)}</div><div class="tags">${tags}</div></li>`;
}

async function loadProjects() {
  const projects = await api('/projects');
  $('projects').innerHTML = projects.map((p) => projectItem(p)).join('');
}

// ---- search (consumes /api/search, which uses SQL ILIKE) ----
async function runSearch() {
  const name = $('qName').value.trim();
  const skill = $('qSkill').value.trim();
  const out = $('searchResults');
  if (!name && !skill) { out.innerHTML = '<p class="muted">Type a project name or a skill to search.</p>'; return; }
  try {
    const params = new URLSearchParams({ name, skill });
    const r = await api(`/search?${params}`);
    let html = '';
    if (skill) {
      html += `<h3>Skills matching “${esc(skill)}” (${r.skills.length})</h3>`;
      html += r.skills.length
        ? `<ul>${r.skills.map((s) => `<li>${esc(s.name)} <span class="muted">· ${esc(s.category)}, level ${s.level}/5</span></li>`).join('')}</ul>`
        : '<p class="muted">No skills match. Try a shorter word, like “py”.</p>';
    }
    html += `<h3>Projects (${r.projects.length})</h3>`;
    html += r.projects.length
      ? `<ul class="projects">${r.projects.map((p) => projectItem(p, skill)).join('')}</ul>`
      : '<p class="muted">No projects match these filters.</p>';
    out.innerHTML = html;
  } catch (err) {
    out.innerHTML = `<p class="error">Search failed: ${esc(err.message)}</p>`;
  }
}

let timer;
$('searchForm').addEventListener('submit', (e) => { e.preventDefault(); runSearch(); });
['qName', 'qSkill'].forEach((id) => $(id).addEventListener('input', () => {
  clearTimeout(timer); timer = setTimeout(runSearch, 300);   // live search while typing
}));

// ---- boot ----
drawTrace();
Promise.all([loadProfile(), loadSkills(), loadProjects()])
  .then(() => api('/health'))
  .then((h) => { $('status').textContent = `Server ${h.status}, database ${h.db}.`; })
  .catch((err) => { $('status').innerHTML = `<span class="error">Can't reach the API: ${esc(err.message)}</span>`; });

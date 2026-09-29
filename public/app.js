const API = '/api';

async function getJSON(url) {
  const res = await fetch(API + url);
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  return res.json();
}

function projectHTML(p) {
  const tags = p.tech.map(t => `<span class="tag">${t}</span>`).join('');
  return `<div class="project"><b>${p.name}</b><br>${p.description}<br>${tags}</div>`;
}

async function loadProfile() {
  const p = await getJSON('/profile');
  document.getElementById('fullName').textContent = p.full_name;
  document.getElementById('group').textContent = p.student_group;
  document.getElementById('email').textContent = p.email;
  document.getElementById('email').href = 'mailto:' + p.email;
  document.getElementById('city').textContent = p.city;
  document.getElementById('bio').textContent = p.bio;
  document.getElementById('university').textContent = p.university;
}

async function loadSkills() {
  const skills = await getJSON('/skills');
  document.getElementById('skills').innerHTML = skills
    .map(s => `<span class="chip">${s.name} (${s.level}/5)</span>`)
    .join('');
}

async function loadProjects() {
  const projects = await getJSON('/projects');
  document.getElementById('projects').innerHTML = projects.map(projectHTML).join('');
}

async function search(event) {
  event.preventDefault();
  const name = document.getElementById('qName').value.trim();
  const skill = document.getElementById('qSkill').value.trim();
  const out = document.getElementById('searchResults');

  if (!name && !skill) {
    out.innerHTML = '<p>Type a project name or a skill.</p>';
    return;
  }

  try {
    const params = new URLSearchParams({ name, skill });
    const data = await getJSON('/search?' + params);
    let html = '';
    if (skill) {
      html += '<h3>Skills</h3>';
      html += data.skills.length
        ? data.skills.map(s => `<span class="chip">${s.name} (${s.level}/5)</span>`).join('')
        : '<p>No skills found.</p>';
    }
    html += '<h3>Projects</h3>';
    html += data.projects.length
      ? data.projects.map(projectHTML).join('')
      : '<p>No projects found.</p>';
    out.innerHTML = html;
  } catch (err) {
    out.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

document.getElementById('searchForm').addEventListener('submit', search);

loadProfile();
loadSkills();
loadProjects();

// Web & Cloud Applications exercise — Express REST API + PostgreSQL + static frontend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, init } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));   // serves the static frontend

// small helper so every route handles errors the same way
const route = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Database error', detail: err.message });
  });

// ---------- Health ----------
app.get('/api/health', route(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
}));

// ---------- Profile ----------
app.get('/api/profile', route(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM profile ORDER BY id LIMIT 1');
  res.json(rows[0] || null);
}));

// ---------- Skills (CRUD) ----------
// GET /api/skills?category=Web
app.get('/api/skills', route(async (req, res) => {
  const { category } = req.query;
  const { rows } = category
    ? await pool.query('SELECT * FROM skills WHERE category = $1 ORDER BY level DESC, name', [category])
    : await pool.query('SELECT * FROM skills ORDER BY category, level DESC, name');
  res.json(rows);
}));

app.get('/api/skills/:id', route(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM skills WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Skill not found' });
  res.json(rows[0]);
}));

app.post('/api/skills', route(async (req, res) => {
  const { name, category, level } = req.body;
  if (!name || !category || !(level >= 1 && level <= 5))
    return res.status(400).json({ error: 'name, category and level (1-5) are required' });
  const { rows } = await pool.query(
    'INSERT INTO skills (name, category, level) VALUES ($1, $2, $3) RETURNING *',
    [name.trim(), category.trim(), level]);
  res.status(201).json(rows[0]);
}));

app.put('/api/skills/:id', route(async (req, res) => {
  const { name, category, level } = req.body;
  const { rows } = await pool.query(
    `UPDATE skills SET name = COALESCE($1, name), category = COALESCE($2, category),
     level = COALESCE($3, level) WHERE id = $4 RETURNING *`,
    [name, category, level, req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Skill not found' });
  res.json(rows[0]);
}));

app.delete('/api/skills/:id', route(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM skills WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Skill not found' });
  res.status(204).end();
}));

// Like a skill (the "like" button on the page)
app.post('/api/skills/:id/like', route(async (req, res) => {
  const { rows } = await pool.query(
    'UPDATE skills SET likes = likes + 1 WHERE id = $1 RETURNING *', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Skill not found' });
  res.json(rows[0]);
}));

// ---------- Projects ----------
app.get('/api/projects', route(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects ORDER BY id');
  res.json(rows);
}));

// ---------- SEARCH (SQL LIKE / ILIKE) ----------
// GET /api/search?name=smart          -> projects whose name matches
// GET /api/search?skill=python        -> skills + projects that use that skill
// GET /api/search?name=smart&skill=rust  -> both filters combined
app.get('/api/search', route(async (req, res) => {
  const name = (req.query.name || '').trim();
  const skill = (req.query.skill || '').trim();
  if (!name && !skill) return res.status(400).json({ error: 'Give ?name= and/or ?skill=' });

  const namePattern = `%${name}%`;
  const skillPattern = `%${skill}%`;

  const skills = skill
    ? (await pool.query(
        'SELECT * FROM skills WHERE name ILIKE $1 OR category ILIKE $1 ORDER BY level DESC',
        [skillPattern])).rows
    : [];

  const projects = (await pool.query(
    `SELECT * FROM projects
     WHERE ($1 = '' OR name ILIKE $2 OR description ILIKE $2)
       AND ($3 = '' OR EXISTS (SELECT 1 FROM unnest(tech) t WHERE t ILIKE $4))
     ORDER BY name`,
    [name, namePattern, skill, skillPattern])).rows;

  res.json({ query: { name, skill }, skills, projects });
}));

// unknown API routes -> JSON 404
app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found' }));

const PORT = process.env.PORT || 3000;
init()
  .then(() => app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Could not connect to PostgreSQL. Check DATABASE_URL in .env', err.message);
    process.exit(1);
  });

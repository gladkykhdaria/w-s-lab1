# Web & Cloud Applications — Portfolio app

**Daria Gladkykh (Hope) · Group 1231EB · FILS, UNSTPB**

| Requirement | Where it is |
|---|---|
| 1. Static frontend (HTML/CSS) with name, group, email, about me, skills | `public/index.html`, `public/style.css` |
| 2. Consuming an API search (name, skills) with a LIKE endpoint | `public/app.js` calls `GET /api/search?name=&skill=` → SQL `ILIKE '%...%'` in `server.js` |
| 3. Backend REST API + PostgreSQL | `server.js` (Express), `db.js`, `db/schema.sql`, `db/seed.sql` |
| 4. Git + code | this repo (see `git log`) |
| 5. Cloud — app published online | `render.yaml` (Render.com: web service + Postgres), `Dockerfile` |

## Architecture

```
Browser ──fetch()──▶ Express REST API (Node.js) ──SQL──▶ PostgreSQL
   ▲                        │
   └── static HTML/CSS/JS ◀─┘  (served by the same server)
```

## Endpoints

| Method | URL | What it does |
|---|---|---|
| GET | `/api/health` | server + DB status |
| GET | `/api/profile` | name, group, email, bio |
| GET | `/api/skills` (`?category=Web`) | list skills |
| GET | `/api/skills/:id` | one skill |
| POST | `/api/skills` body `{name, category, level}` | add skill |
| PUT | `/api/skills/:id` | edit skill |
| DELETE | `/api/skills/:id` | delete skill |
| POST | `/api/skills/:id/like` | +1 like |
| GET | `/api/projects` | list projects |
| GET | `/api/search?name=smart&skill=py` | **LIKE search** on project names + skills |

The search, in plain words: "find anything that *contains* this text, ignoring upper/lower case":
```sql
SELECT * FROM skills WHERE name ILIKE '%py%' OR category ILIKE '%py%';
SELECT * FROM projects
WHERE name ILIKE '%smart%'
  AND EXISTS (SELECT 1 FROM unnest(tech) t WHERE t ILIKE '%py%');
```
Values are passed as parameters (`$1`, `$2`), so the search is safe from SQL injection.

## 0. Put in your details
Edit `db/seed.sql` → change the **email** (it's a placeholder) and anything else.
Tables are created and seeded automatically the first time the server starts.
If it already ran once and you want the new seed: `DROP TABLE profile, skills, projects;` then restart.

## 1. Run locally (Windows)

**Option A — Docker Desktop (easiest, no Postgres install):**
```
docker compose up --build
```
Open http://localhost:3000

**Option B — Node + installed PostgreSQL:**
1. Install Node.js 18+ and PostgreSQL 16 (remember the `postgres` password you set).
2. In pgAdmin or psql: `CREATE DATABASE portfolio;`
3. In the project folder:
```
copy .env.example .env      (then put your password in DATABASE_URL)
npm install
npm start
```
Open http://localhost:3000

Quick API test (PowerShell):
```
curl.exe "http://localhost:3000/api/search?skill=python"
curl.exe -X POST http://localhost:3000/api/skills -H "Content-Type: application/json" -d "{\"name\":\"Docker\",\"category\":\"Tools\",\"level\":2}"
```

## 2. Git → GitHub
The zip already contains a git repo with commit history. Push it:
```
git remote add origin https://github.com/<your-username>/cloud-webapp.git
git push -u origin main
```

## 3. Publish online (Render.com, free)
1. Sign in at https://render.com with GitHub.
2. **New → Blueprint** → pick the `cloud-webapp` repo.
3. Render reads `render.yaml` and creates **portfolio-db** (PostgreSQL) + **portfolio-app** (Node). Click **Apply**.
4. Wait for the build (~2–3 min). The app is live at `https://portfolio-app-xxxx.onrender.com`.
5. Check `https://.../api/health` → `{"status":"ok","db":"connected"}`.

Notes: free Render apps sleep after ~15 min idle (first load then takes ~30 s), and the free
Postgres expires after 30 days, so deploy close to the presentation.
Alternatives: Railway, or Neon/Supabase for the DB + Render for the app (just set `DATABASE_URL`).

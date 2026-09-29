-- Tables are created automatically when the server starts
CREATE TABLE IF NOT EXISTS profile (
  id            SERIAL PRIMARY KEY,
  full_name     TEXT NOT NULL,
  nickname      TEXT,
  student_group TEXT NOT NULL,
  email         TEXT NOT NULL,
  university    TEXT,
  city          TEXT,
  bio           TEXT
);

CREATE TABLE IF NOT EXISTS skills (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  category  TEXT NOT NULL,           -- Languages, Embedded, Data, Web, Soft skills...
  level     INT  NOT NULL CHECK (level BETWEEN 1 AND 5),
  likes     INT  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  tech        TEXT[] NOT NULL DEFAULT '{}'   -- skills used, searchable
);

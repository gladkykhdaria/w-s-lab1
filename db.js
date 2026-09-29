const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const isLocal = !connectionString || /localhost|127\.0\.0\.1|@db:/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
  await pool.query(schema);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM profile');
  if (rows[0].n === 0) {
    const seed = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf8');
    await pool.query(seed);
    console.log('Database seeded');
  }
}

module.exports = { pool, init };

// db.js — the ONE place our server connects to PostgreSQL.
//
// A "Pool" keeps a handful of database connections open and reuses them.
// Opening a brand-new connection for every request would be slow, so the pool
// hands out an idle connection, then takes it back when the query finishes.

import pg from 'pg';

const { Pool } = pg;

// DATABASE_URL comes from the .env file (loaded in index.js).
// Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Other files call db.query(...) instead of touching the pool directly.
// The `params` array is how we pass values SAFELY into SQL:
//   db.query('SELECT * FROM users WHERE id = $1', [userId])
// Postgres fills in $1 itself, so user input can never be run as SQL
// (that attack is called "SQL injection").
export function query(text, params) {
  return pool.query(text, params);
}

export default pool;

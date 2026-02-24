const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is missing.');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('railway')
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

module.exports = { query };

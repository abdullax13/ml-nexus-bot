const { query } = require('./db');

async function runMigrations() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      discord_id TEXT UNIQUE NOT NULL,
      ml_player_id TEXT NOT NULL,
      ml_server_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id SERIAL PRIMARY KEY,
      discord_id TEXT NOT NULL,
      rank TEXT,
      stars INT,
      winrate NUMERIC,
      matches INT,
      kda NUMERIC,
      top_heroes JSONB,
      fetched_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_snapshots_discord_id
    ON snapshots(discord_id, fetched_at DESC);
  `);
}

module.exports = { runMigrations };

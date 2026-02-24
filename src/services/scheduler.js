const cron = require('node-cron');
const { query } = require('./db');
const { fetchPlayerStats } = require('./statsProvider');

function startScheduler() {
  // كل 6 ساعات
  cron.schedule('0 */6 * * *', async () => {
    console.log('[scheduler] snapshot run started');
    try {
      const users = await query(`SELECT discord_id, ml_player_id, ml_server_id FROM users`);
      for (const u of users.rows) {
        const stats = await fetchPlayerStats({ playerId: u.ml_player_id, serverId: u.ml_server_id });

        await query(
          `INSERT INTO snapshots (discord_id, rank, stars, winrate, matches, kda, top_heroes)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            u.discord_id,
            stats.rank,
            stats.stars,
            stats.winrate,
            stats.matches,
            stats.kda,
            JSON.stringify(stats.topHeroes ?? []),
          ]
        );
      }
      console.log('[scheduler] snapshot run done');
    } catch (e) {
      console.error('[scheduler] error', e);
    }
  });
}

module.exports = { startScheduler };

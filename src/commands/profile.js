const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { query } = require('../services/db');
const { fetchPlayerStats } = require('../services/statsProvider');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('يعرض إحصائياتك (أو آخر Snapshot)'),

  async execute(interaction) {
    const user = await query(`SELECT ml_player_id, ml_server_id FROM users WHERE discord_id=$1`, [interaction.user.id]);
    if (user.rowCount === 0) {
      return interaction.reply({ content: 'اربط حسابك أول: `/link player_id server_id`', ephemeral: true });
    }

    const { ml_player_id, ml_server_id } = user.rows[0];
    const stats = await fetchPlayerStats({ playerId: ml_player_id, serverId: ml_server_id });

    // خزّن Snapshot سريع
    await query(
      `INSERT INTO snapshots (discord_id, rank, stars, winrate, matches, kda, top_heroes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        interaction.user.id,
        stats.rank,
        stats.stars,
        stats.winrate,
        stats.matches,
        stats.kda,
        JSON.stringify(stats.topHeroes ?? []),
      ]
    );

    const top = (stats.topHeroes ?? []).slice(0, 3)
      .map(h => `• **${h.name}** — WR ${h.wr}% (${h.matches} games)`)
      .join('\n') || '—';

    const emb = new EmbedBuilder()
      .setTitle(`ML Profile — ${interaction.user.username}`)
      .setDescription(`Source: **${stats.source}**`)
      .addFields(
        { name: 'Rank', value: `${stats.rank ?? '—'}`, inline: true },
        { name: 'Stars', value: `${stats.stars ?? '—'}`, inline: true },
        { name: 'Win Rate', value: `${stats.winrate ?? '—'}%`, inline: true },
        { name: 'Matches', value: `${stats.matches ?? '—'}`, inline: true },
        { name: 'KDA', value: `${stats.kda ?? '—'}`, inline: true },
        { name: 'Top Heroes', value: top, inline: false },
      );

    await interaction.reply({ embeds: [emb] });
  },
};

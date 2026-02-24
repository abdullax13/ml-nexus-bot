const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { query } = require('../services/db');
const { fetchPlayerStats } = require('../services/statsProvider');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compare')
    .setDescription('قارن بينك وبين لاعب ثاني مربوط')
    .addUserOption(o => o.setName('user').setDescription('اللاعب الثاني').setRequired(true)),

  async execute(interaction) {
    const other = interaction.options.getUser('user', true);

    const meRow = await query(`SELECT ml_player_id, ml_server_id FROM users WHERE discord_id=$1`, [interaction.user.id]);
    const otherRow = await query(`SELECT ml_player_id, ml_server_id FROM users WHERE discord_id=$1`, [other.id]);

    if (meRow.rowCount === 0) return interaction.reply({ content: 'اربط حسابك أول: `/link`', ephemeral: true });
    if (otherRow.rowCount === 0) return interaction.reply({ content: 'اللاعب الثاني مو رابط حسابه: خله يسوي `/link`', ephemeral: true });

    const me = await fetchPlayerStats({ playerId: meRow.rows[0].ml_player_id, serverId: meRow.rows[0].ml_server_id });
    const ot = await fetchPlayerStats({ playerId: otherRow.rows[0].ml_player_id, serverId: otherRow.rows[0].ml_server_id });

    const emb = new EmbedBuilder()
      .setTitle('Comparison')
      .addFields(
        { name: interaction.user.username, value: `Rank: **${me.rank}**\nWR: **${me.winrate}%**\nMatches: **${me.matches}**\nKDA: **${me.kda}**`, inline: true },
        { name: other.username, value: `Rank: **${ot.rank}**\nWR: **${ot.winrate}%**\nMatches: **${ot.matches}**\nKDA: **${ot.kda}**`, inline: true },
      );

    await interaction.reply({ embeds: [emb] });
  },
};

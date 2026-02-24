const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../services/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('اربط حسابك في ML بحساب الديسكورد')
    .addStringOption(o => o.setName('player_id').setDescription('Player ID').setRequired(true))
    .addStringOption(o => o.setName('server_id').setDescription('Server ID').setRequired(true)),

  async execute(interaction) {
    const playerId = interaction.options.getString('player_id', true);
    const serverId = interaction.options.getString('server_id', true);

    await query(
      `INSERT INTO users (discord_id, ml_player_id, ml_server_id)
       VALUES ($1,$2,$3)
       ON CONFLICT (discord_id)
       DO UPDATE SET ml_player_id = EXCLUDED.ml_player_id, ml_server_id = EXCLUDED.ml_server_id`,
      [interaction.user.id, playerId, serverId]
    );

    await interaction.reply({
      content: `تم الربط ✅\nPlayerID: **${playerId}** | ServerID: **${serverId}**`,
      ephemeral: true,
    });
  },
};

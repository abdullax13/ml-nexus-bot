const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCounter } = require('../services/heroMetaProvider');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('counter')
    .setDescription('يعرض كاونترات بطل (يتطلب ML_HERO_API_BASE)')
    .addStringOption(o => o.setName('hero').setDescription('اسم البطل').setRequired(true)),

  async execute(interaction) {
    const hero = interaction.options.getString('hero', true);
    const res = await getCounter(hero);

    if (!res.ok) {
      return interaction.reply({
        content: `الكاونتر مو مفعل لأن ML_HERO_API_BASE مو محدد.\n(نفعّله بعد ما نختار مزود الأبطال)`,
        ephemeral: true,
      });
    }

    const counters = Array.isArray(res.data) ? res.data : (res.data.counters || []);
    const text = counters.slice(0, 10).map(c => `• **${c.name ?? c.hero ?? '—'}**`).join('\n') || '—';

    const emb = new EmbedBuilder()
      .setTitle(`Counters — ${hero}`)
      .setDescription(text);

    await interaction.reply({ embeds: [emb] });
  },
};

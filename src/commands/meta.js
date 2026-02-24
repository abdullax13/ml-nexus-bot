const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTopMeta } = require('../services/heroMetaProvider');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meta')
    .setDescription('يعرض أفضل أبطال الميتا (يتطلب ML_HERO_API_BASE)')
    .addStringOption(o =>
      o.setName('role')
        .setDescription('مثال: jungle / gold / exp / roam / mid / all')
        .setRequired(false)
    ),

  async execute(interaction) {
    const role = interaction.options.getString('role') || 'all';
    const res = await getTopMeta({ role });

    if (!res.ok) {
      return interaction.reply({
        content: `الميتا مو مفعلة لأن ML_HERO_API_BASE مو محدد.\n(نفعّلها بعد ما نختار مزود الأبطال)`,
        ephemeral: true,
      });
    }

    // نتوقع بيانات على شكل قائمة
    const list = Array.isArray(res.data) ? res.data : (res.data.items || []);
    const top = list.slice(0, 10).map((h, i) => `${i + 1}) **${h.name ?? h.hero ?? '—'}**`).join('\n') || '—';

    const emb = new EmbedBuilder()
      .setTitle(`Meta Top — ${role}`)
      .setDescription(top);

    await interaction.reply({ embeds: [emb] });
  },
};

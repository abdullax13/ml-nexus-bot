require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { runMigrations } = require('./services/migrations');
const { startScheduler } = require('./services/scheduler');

async function main() {
  // health server (Railway يحب وجود HTTP)
  const app = express();
  app.get('/health', (_, res) => res.json({ ok: true }));
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`[http] listening on ${port}`));

  await runMigrations();
  console.log('[db] migrations done');

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.commands = new Collection();

  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
  }

  client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    startScheduler();
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`[cmd:${interaction.commandName}]`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'صار خطأ بالنظام. شيّك اللوق.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'صار خطأ بالنظام. شيّك اللوق.', ephemeral: true });
      }
    }
  });

  if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN missing');
  await client.login(process.env.DISCORD_TOKEN);
}

main().catch((e) => {
  console.error('[fatal]', e);
  process.exit(1);
});

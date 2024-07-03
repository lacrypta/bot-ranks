import { BotEvent } from '../types/botEvents';
import { deployCommands } from '../deployCommands';
import { cacheService } from '../services/cache';
import { Client, Guild } from 'discord.js';

const event: BotEvent = {
  name: 'ready',
  once: true,
  execute: async (_client: Client) => {
    await deployCommands();

    // Iterate over each guild the bot is in
    _client.guilds.cache.forEach(async (guild: Guild) => {
      try {
        const guildId = guild.id;
        await cacheService.createGuild(guildId);
        console.log(`Guild created/updated in the database: ${guild.name} (${guildId})`);
      } catch (error) {
        console.error(`Failed to create/update guild: ${guild.name} (${guild.id})`, error);
      }
    });

    console.log('\x1b[37m\x1b[42m%s\x1b[0m', 'Discord bot ready!');
  },
};

export default event;

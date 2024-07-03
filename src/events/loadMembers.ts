import { BotEvent } from '../types/botEvents';
import { Client } from 'discord.js';
import { cacheService } from '../services/cache';

const event: BotEvent = {
  name: 'ready',
  once: true,
  execute: async (client: Client) => {
    console.log('-> Loading members...');

    for (const [guildId, guild] of client.guilds.cache) {
      try {
        const members = await guild.members.fetch();

        for (const member of members.values()) {
          if (!member.user.bot) {
            await cacheService.upsertMember(guildId, member.id, member.displayName, member.displayAvatarURL());
          }
        }

        console.log(`Members loaded for guild: ${guild.name}`);
      } catch (error) {
        console.error(`Failed to load members for guild: ${guild.name}`, error);
      }
    }

    console.log(`All members loaded`);
  },
};

export default event;

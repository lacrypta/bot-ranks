import { BotEvent } from '../types/botEvents';
import { deployCommands } from '../deployCommands';
import { cacheService } from '../services/cache';
import { Client, Guild, Role } from 'discord.js';
import { Prisma } from '@prisma/client';

const event: BotEvent = {
  name: 'ready',
  once: true,
  execute: async (_client: Client) => {
    await deployCommands(_client);

    // const prismadb = Prisma.dmmf.datamodel.models;
    // console.log(prismadb);

    console.log('\n---> Loading guilds, roles, and members... <---');

    for (const [guildId, guild] of _client.guilds.cache) {
      try {
        await cacheService.upsertGuild(guildId);
        console.log('\x1b[37m\x1b[42m%s\x1b[0m', `\nGuild created/updated in the database: ${guild.name} (${guildId})`);
        console.log();

        for (const role of guild.roles.cache.values()) {
          try {
            await cacheService.upsertRole(guildId, role.id, role.name);
            console.log(`Role created/updated in the database: ${role.name} (${role.id})`);
          } catch (error) {
            console.error(`Failed to create/update role: ${role.name} (${role.id})`, error);
          }
        }

        console.log();

        const members = await guild.members.fetch();
        for (const member of members.values()) {
          if (!member.user.bot) {
            try {
              await cacheService.upsertMember(guildId, member.id, member.displayName, member.displayAvatarURL());
              console.log(`Member upserted in the database: ${member.displayName} (${member.id})`);
            } catch (error) {
              console.error(`Failed to upsert member: ${member.displayName} (${member.id})`, error);
            }
          }
        }

        console.log(`\nMembers and roles loaded for guild: ${guild.name}`);
      } catch (error) {
        console.error(`Failed to process guild: ${guild.name} (${guildId})`, error);
      }
    }

    console.log('\n---> All guilds, roles, and members loaded <---');

    // Set up a timer to update members levels to the database
    setInterval(async () => {
      try {
        const updateLevelSatus: boolean = await cacheService.updateMembersLevelsToDatabase();
        console.log('updateLevelSatus:', updateLevelSatus);
      } catch (error) {
        console.error('Error in updating members levels to the database', error);
      }
    }, 60 * 1000); // 60 * 1000 ms = 1 minute

    console.log('\x1b[37m\x1b[42m%s\x1b[0m', 'Discord bot ready!');
  },
};

export default event;

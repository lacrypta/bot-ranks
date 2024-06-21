import { Member } from '@prisma/client';
import { BotEvent } from '../types/botEvents';
import { Client, GuildMember } from 'discord.js';
import { prisma } from '../services/prismaClient';
import { ClientRequest } from 'http';

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
            await upsertMember(member, guildId);
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

// Function to upsert a member in the database
async function upsertMember(member: GuildMember, guildId: string) {
  try {
    await prisma.member.upsert({
      where: {
        discordMemeberId: member.id,
      },
      update: {
        discordDisplayName: member.displayName,
        discordProfilePicture: member.user.displayAvatarURL(),
        guildId: guildId,
      },
      create: {
        discordMemeberId: member.id,
        discordDisplayName: member.displayName,
        discordProfilePicture: member.user.displayAvatarURL(),
        guildId: guildId,
      },
    });
  } catch (error) {
    console.error(`Failed to upsert member: ${member.user.tag}`, error);
  }
}

export default event;

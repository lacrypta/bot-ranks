import { BotEvent } from '../types/botEvents';
import { Client, GuildMember } from 'discord.js';
import { prisma } from '../services/prismaClient';

const event: BotEvent = {
  name: 'guildMemberAdd',
  once: false,
  execute: async (member: GuildMember) => {
    console.log(`New member joined: ${member.user.tag}`);

    try {
      await prisma.member.upsert({
        where: {
          discordMemeberId: member.id,
        },
        update: {
          discordDisplayName: member.displayName,
          discordProfilePicture: member.user.displayAvatarURL(),
          guildId: member.guild.id,
        },
        create: {
          discordMemeberId: member.id,
          discordDisplayName: member.displayName,
          discordProfilePicture: member.user.displayAvatarURL(),
          guildId: member.guild.id,
          discordTemporalLevelXp: 0,
          discordTemporalLevel: 0,
          discordTemporalLevelCooldown: Date.now().toString(),
        },
      });

      console.log(`Member ${member.user.tag} added to the database`);
    } catch (error) {
      console.error(`Failed to upsert member: ${member.user.tag}`, error);
    }
  },
};

export default event;

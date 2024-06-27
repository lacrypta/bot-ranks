import { Command } from './../../types/command';
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { cacheService } from '../../services/cache';
import { Member as PrismaMember } from '@prisma/client';

const ping: Command = {
  data: new SlashCommandBuilder()
    .setName('test-cache')
    .setDescription('test cache')
    .addStringOption((option) => option.setName('user_id').setDescription('id del miembro').setRequired(true)),
  execute: async (interaction: CommandInteraction) => {
    const userId: string = interaction.options.get('user_id', true).value as string;

    const prismaMember: PrismaMember | null = await cacheService.getMemberByDiscordId(userId);

    if (prismaMember) {
      await interaction.reply({
        content: `El usuario ${prismaMember.discordMemeberId} ya está en la cache`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `El usuario no existe`,
        ephemeral: true,
      });
    }
  },
};

export default ping;

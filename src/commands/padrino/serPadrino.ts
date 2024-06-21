import { Command } from '../../types/command';
import { SlashCommandBuilder, CommandInteraction, GuildMember } from 'discord.js';
import { modalMenu } from './serPadrinoHelpers';

const serPadrino: Command = {
  data: new SlashCommandBuilder().setName('ser-padrino-command').setDescription('Quiero ser un padrino!'),
  execute: async (discordInteraction: CommandInteraction) => {
    const userId = discordInteraction.user.id;
    const user: GuildMember | undefined = await discordInteraction.guild?.members.fetch(userId);

    const userRoles = user?.roles.cache.map((role) => role.name);

    if (!userRoles?.includes('Mérito de Bronce')) {
      await discordInteraction.reply({ content: 'Se necesita el mérito de bronce', ephemeral: true });

      return;
    }

    await modalMenu(discordInteraction);

    // await discordInteraction.reply({ content: 'Sos un padrino', ephemeral: true });

    return;
  },
};

export default serPadrino;

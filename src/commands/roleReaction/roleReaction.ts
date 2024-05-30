import {
  SlashCommandBuilder,
  CommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageReaction,
  Role,
  CacheType,
  TextChannel,
  Message,
  Options,
  Client,
} from 'discord.js';
import { Command } from './../../types/command';

const roleReaction: Command = {
  data: new SlashCommandBuilder()
    .setName('role_reaction')
    .setDescription('Configure role reactions')
    .addStringOption((option) =>
      option
        .setName('message_id')
        .setDescription('The ID of the message to add the role reaction to')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    const messageId = interaction.options.get('message_id', true).value as string;
    const message = await interaction.channel?.messages.fetch(messageId);

    // TODO: use roleList of setRanks command
    const rolesList = interaction.guild?.roles.cache
      .filter((role) => role.name.toLowerCase().startsWith('rank'))
      .map((role) => ({
        label: role.name,
        value: role.id,
      }));
    // console.log('Roles:', rolesList);
    // console.info(
    //   'Role:',
    //   interaction.guild?.roles.cache.find((role) => role.name.toLowerCase().startsWith('rank')),
    // );

    const options = rolesList!.map((role) =>
      new StringSelectMenuOptionBuilder().setLabel(role.label).setValue(role.value),
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select-role')
      .setPlaceholder('Select a role')
      .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.reply({
      content: 'Select a role to assign with a reaction:',
      components: [row],
      ephemeral: true,
    });
  },
};

export default roleReaction;

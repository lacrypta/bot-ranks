import {
  SlashCommandBuilder,
  CommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Message,
  MessageReaction,
  User,
} from 'discord.js';
import { Command } from './../../types/command';
import { prisma } from '../../services/prismaClient';

let message: Message | undefined = undefined;

const roleReaction: Command = {
  data: new SlashCommandBuilder()
    .setName('role-reaction')
    .setDescription('Configure role reactions')
    .addStringOption((option) =>
      option
        .setName('message_id')
        .setDescription('The ID of the message to add the role reaction to')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    const messageId = interaction.options.get('message_id', true).value as string;
    message = await interaction.channel?.messages.fetch(messageId);

    /// Get role list ///
    const rolesList = interaction.guild?.roles.cache
      .filter((role) => role.name.toLowerCase().startsWith('rank'))
      .map((role) => ({
        label: role.name,
        value: role.id,
      })); // TODO: use roleList of setRanks command

    /// Create select menu ///
    const roleOptions = rolesList!.map((role) =>
      new StringSelectMenuOptionBuilder().setLabel(role.label).setValue(role.value),
    ); // Only necesary data

    const menuComponent = new StringSelectMenuBuilder()
      .setCustomId('role-reaction')
      .setPlaceholder('Select a role')
      .addOptions(roleOptions); // Create select menu component

    const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menuComponent); // Create select menu

    /// Send message ///
    await interaction.reply({
      content: 'Select a role to assign with a reaction:',
      components: [selectMenu],
      ephemeral: true,
    });

    const prismaGuild = await prisma.guild.create({
      data: {
        discordGuildId: interaction.guildId!,
      },
    });
    const prismaChannel = await prisma.channel.create({
      data: {
        discordChannelId: interaction.channelId!,
        guildId: prismaGuild.id,
      },
    });
    const prismaMessage = await prisma.message.create({
      data: {
        discordMessageId: messageId,
        discordInteractionId: interaction.id,
        channelId: prismaChannel.id,
      },
    });

    // TODO: call function to wait to execute indeed reaction message with db data
  },
};

export async function makeRoleReaction() {
  if (message) {
    try {
      const reactionManager = message.reactions;
      // console.log('Awaiting reaction:', reactionManager.message.reactions.cache);

      // eventEmitter.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
      //   if (message && reaction.message.id === message.id) {
      //     try {
      //       await message.react(reaction.emoji);
      //       console.log(`[roleReactions.ts] Reacted to the message with ${reaction.emoji.name}`);
      //     } catch (error) {
      //       console.error('[roleReactions.ts] Failed to react to message:', error);
      //     }
      //   }
      // });

      // - [x] wait user reaction
      // - [x] get reaction
      // - [x] react to message with same react
      // - [ ] asign role to reaction
    } catch (error) {
      console.error('Failed to react to message:', error);
    }
  } else {
    console.error('Message is null or undefined');
  }
}

export default roleReaction;

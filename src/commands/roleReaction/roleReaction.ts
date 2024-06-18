import {
  SlashCommandBuilder,
  CommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Message,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Command } from './../../types/command';
import { prisma } from '../../services/prismaClient';
import { MessageReactionRole, Message as PrismaMessage, Role as PrismaRole } from '@prisma/client';

let discordMessageInstance: Message | undefined;
let discordInteraction: CommandInteraction;

const roleReaction: Command = {
  data: new SlashCommandBuilder()
    .setName('role-reaction-command')
    .setDescription('Configure role reactions')
    .addStringOption((option) =>
      option
        .setName('message_id')
        .setDescription('The ID of the message to add the role reaction to')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    /// Get message from Discord ///
    discordInteraction = interaction;
    const discordMessageId = discordInteraction.options.get('message_id', true).value as string;

    try {
      discordMessageInstance = await discordInteraction.channel?.messages.fetch(discordMessageId);
    } catch (error) {
      console.error('Failed to fetch message:', error);
      await discordInteraction.reply({
        content: 'Message not found',
        ephemeral: true,
      });

      return;
    }

    await selectMenu();

    /// Save data to database ///
    // Create guild
    try {
      const prismaGuild = await prisma.guild.create({
        data: {
          discordGuildId: discordInteraction.guildId!,
        },
      });
      // Create channel
      const prismaChannel = await prisma.channel.create({
        data: {
          discordChannelId: discordInteraction.channelId!,
          guildId: prismaGuild.id,
        },
      });
      // Create message
      await prisma.message.create({
        data: {
          discordMessageId: discordMessageId,
          discordCommandName: discordInteraction.commandName,
          channelId: prismaChannel.id,
        },
      });
    } catch (error) {
      console.error('Failed to save data to database:', error);
      await discordInteraction.reply({
        content: 'Failed to save data to database',
        ephemeral: true,
      });

      return;
    }
  },
};

/// Setup ///
export async function reactionToMessage(_discordMessageId: string, _discordEmojiId: string) {
  // Get message from database
  const prismaMessage: PrismaMessage[] = await prisma.message.findMany({
    where: {
      discordMessageId: _discordMessageId,
    },
  });

  const prismaMessageReactionRole: MessageReactionRole[] = await prisma.messageReactionRole.findMany({
    where: {
      messageId: prismaMessage[0]!.id,
    },
  });

  if (discordMessageInstance) {
    for (const messageReactionRole of prismaMessageReactionRole) {
      if (messageReactionRole.discordEmojiId === _discordEmojiId) {
        try {
          await discordMessageInstance.react(messageReactionRole.discordEmojiId!);
        } catch (error) {
          console.error('Failed to react to message:', error);
        }
      }
    }
  } else {
    console.error('Message is null or undefined');
  }
}

export async function selectMenu() {
  // Get roles list form database
  let rolesList;
  const prismaRoleList: PrismaRole[] | undefined = await prisma.role.findMany();

  if (prismaRoleList.length === 0) {
    discordInteraction.reply({
      content: 'Use `/set-rank` first.',
      components: [],
    });

    return;
  }

  rolesList = prismaRoleList.map((role) => {
    return {
      label: role.discordRoleName,
      value: role.discordRoleId,
    };
  });

  // Crete select menu options
  const roleOptions: StringSelectMenuOptionBuilder[] = rolesList!.map((role) =>
    new StringSelectMenuOptionBuilder().setLabel(role.label).setValue(role.value),
  );

  // Create select menu component
  const menuComponent: StringSelectMenuBuilder = new StringSelectMenuBuilder()
    .setCustomId('role-reaction-command-select-menu')
    .setPlaceholder('Select a role')
    .addOptions(roleOptions);

  // Create select menu
  const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menuComponent);

  // Check if discordInteraction is after replied
  if (!discordInteraction.replied) {
    // Send message
    await discordInteraction.reply({
      content: 'Select a role to assign with a reaction:',
      components: [selectMenu],
      ephemeral: true,
    });
  } else {
    // Create finish button
    const finishButton = new ButtonBuilder()
      .setCustomId('role-reaction-command-finish-button')
      .setLabel('Finalize')
      .setStyle(ButtonStyle.Primary);

    // Create button row
    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(finishButton);

    await discordInteraction.editReply({
      content: 'Select a role to assign with a reaction:',
      components: [selectMenu, buttonRow], // TODO: sacar de la lista los roles que ya se eligieron
    });
  }
}

export async function finalizeRoleReactionCommand() {
  await discordInteraction.editReply({
    content: 'Finalized role reaction command.\n\nYou can dissmis this message.',
    components: [],
  });
}

export default roleReaction;

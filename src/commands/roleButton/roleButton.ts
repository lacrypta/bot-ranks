import {
  SlashCommandBuilder,
  CommandInteraction,
  ActionRowBuilder,
  Message,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuComponent,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  discordSort,
  GuildBasedChannel,
  Guild,
  ChannelType,
} from 'discord.js';
import { Command } from '../../types/command';
import { prisma } from '../../services/prismaClient';
import { MessageReactionRole, Message as PrismaMessage, Role as PrismaRole } from '@prisma/client';

let discordInteraction: CommandInteraction;

const roleButton: Command = {
  data: new SlashCommandBuilder()
    .setName('role-button-command')
    .setDescription('Configure role reactions')
    .addStringOption((option) => option.setName('button_name_1').setDescription('Button Name 1').setRequired(true))
    .addStringOption((option) => option.setName('role_id_1').setDescription('Role ID 1').setRequired(true))
    .addStringOption((option) => option.setName('button_name_2').setDescription('Button Name 2').setRequired(false))
    .addStringOption((option) => option.setName('role_id_2').setDescription('Role ID 2').setRequired(false))
    .addStringOption((option) => option.setName('button_name_3').setDescription('Button Name 3').setRequired(false))
    .addStringOption((option) => option.setName('role_id_3').setDescription('Role ID 3').setRequired(false)),
  execute: async (interaction: CommandInteraction) => {
    discordInteraction = interaction;

    await modalMenu();
  },
};

async function modalMenu() {
  /// Role list and Send message ///
  try {
    const modal = new ModalBuilder().setCustomId('role-button-command-modal').setTitle('Personalice el texto');

    // Crete text input component
    const textInput = new TextInputBuilder()
      .setCustomId('role-button-command-text-input-message')
      .setLabel('Mensaje')
      .setStyle(TextInputStyle.Paragraph);

    // Create text input row
    const textInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);

    modal.addComponents(textInputRow);

    await discordInteraction.showModal(modal);
  } catch (error) {
    console.error('Failed to create modal:', error);

    return;
  }
}

export async function addButtonToMessage(discordMessageId: string) {
  // Get the message from Discord
  const message = await discordInteraction.channel?.messages.fetch(discordMessageId);

  // Create an array to hold the buttons
  const buttons = [];

  // Loop through the possible button names and role IDs
  for (let i = 1; i <= 3; i++) {
    const discordButtonName = discordInteraction.options.get(`button_name_${i}`, false)?.value as string;
    const discordRoleId = discordInteraction.options.get(`role_id_${i}`, false)?.value as string;
    const discordRoleName = discordInteraction.guild?.roles.cache.get(discordRoleId)?.name as string;

    // If both the button name and role ID exist, create a button
    if (discordButtonName && discordRoleId) {
      try {
        const role: PrismaRole = await prisma.role.upsert({
          where: {
            discordRoleId: discordRoleId,
          },
          update: {},
          create: {
            discordRoleId: discordRoleId,
            discordRoleName: discordRoleName,
          },
        });

        await prisma.reactionButton.create({
          data: {
            roleId: role.id,
            discordButtonId: `role-button-command-button-${i}`,
          },
        });
      } catch (error) {
        await message!.edit({
          content: 'Use `/set-rank` first.',
        });
        console.error('Failed to create messageReactionRole:', error);
      }

      const button = new ButtonBuilder()
        .setCustomId(`role-button-command-button-${i}`)
        .setLabel(discordButtonName)
        .setStyle(ButtonStyle.Primary);

      // Add the button to the array
      buttons.push(button);
    }
  }

  // Create a row with the buttons
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

  if (message) {
    await message.edit({
      components: [row],
    });
  }
}

export default roleButton;

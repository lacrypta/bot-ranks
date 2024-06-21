import {
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  User,
} from 'discord.js';
import { prisma } from '../../services/prismaClient';
import { Guild, Padrino } from '@prisma/client';

async function modalMenu(discordInteraction: CommandInteraction | ButtonInteraction) {
  try {
    const modal = new ModalBuilder().setCustomId('ser-padrino-command-modal').setTitle('Personalizá tu perfil');

    // Crete text input component
    const shortTextInput = new TextInputBuilder()
      .setCustomId('ser-padrino-command-short-text-input')
      .setLabel('Resumen')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(150);
    const longTextInput = new TextInputBuilder()
      .setCustomId('ser-padrino-command-long-text-input')
      .setLabel('Biografía')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(1024);

    // Create text input row
    const shortTextInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(shortTextInput);
    const longTextInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(longTextInput);

    modal.addComponents(shortTextInputRow, longTextInputRow);

    await discordInteraction.showModal(modal);
  } catch (error) {
    console.error('Failed to create modal:', error);

    return;
  }
}

async function createAndSendMessagePadrinoProfile(discordInteraction: ModalSubmitInteraction) {
  // Get inputs from modal
  const shortTextInput: string = discordInteraction.fields.fields.get('ser-padrino-command-short-text-input')!.value!;
  const longTextInput: string = discordInteraction.fields.fields.get('ser-padrino-command-long-text-input')!.value!;

  // Get user information
  const user: User = discordInteraction.user;
  const userId: string = user.id;
  const userName: string = user.displayName;
  const userAvatar: string = user.displayAvatarURL();

  // Create Padrino in db
  await createOrEditPadrinoProfile(userId, shortTextInput, longTextInput);

  // Create an embed message
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setThumbnail(userAvatar!)
    .addFields(
      { name: 'Nombre', value: userName, inline: true },
      { name: 'Resumen', value: shortTextInput, inline: false },
      { name: 'Biografía', value: longTextInput, inline: false },
    );

  // Create buttons
  const confirmButton = new ButtonBuilder()
    .setCustomId(`ser-padrino-command-confirm-button`)
    .setLabel('Confirmar perfil')
    .setStyle(ButtonStyle.Primary);
  const editButton = new ButtonBuilder()
    .setCustomId('ser-padrino-command-edit-button')
    .setLabel('Editar')
    .setStyle(ButtonStyle.Secondary);
  const rowButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, editButton);

  // Send embed message
  try {
    await discordInteraction.reply({
      content: '# Tu perfil de Padrino',
      embeds: [embed],
      components: [rowButtons],
      ephemeral: true,
    });
  } catch (error) {
    console.error('Failed to send embed message', error);
  }
}

async function createPadrinoProfile(_discordUserId: string, _shortDescription: string, _longDescription: string) {
  try {
    const padrino = await prisma.padrino.create({
      data: {
        discordUserId: _discordUserId,
        shortDescription: _shortDescription,
        longDescription: _longDescription,
      },
    });

    return padrino;
  } catch (error) {
    console.error('Failed to create Padrino:', error);
  }
}

async function editPadrinoProfile(_prismaId: string, _shortDescription: string, _longDescription: string) {
  // Create the data object dynamically based on non-empty inputs
  const data: { shortDescription?: string; longDescription?: string } = {};

  if (_shortDescription !== '') {
    data.shortDescription = _shortDescription;
  }

  if (_longDescription !== '') {
    data.longDescription = _longDescription;
  }

  // Update only if there's something to update
  if (Object.keys(data).length > 0) {
    const padrino = await prisma.padrino.update({
      where: {
        id: _prismaId,
      },
      data: data,
    });
  } else {
    throw new Error('No valid fields to update Padrino.');
  }
}

async function createOrEditPadrinoProfile(userId: string, shortDescription: string, longDescription: string) {
  const prismaPadrino: Padrino | null = await prisma.padrino.findUnique({
    where: {
      discordUserId: userId,
    },
  });

  if (prismaPadrino) {
    await editPadrinoProfile(prismaPadrino.id, shortDescription, longDescription);
  } else {
    await createPadrinoProfile(userId, shortDescription, longDescription);
  }
}

export { modalMenu, createAndSendMessagePadrinoProfile };

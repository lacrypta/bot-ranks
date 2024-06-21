import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  InteractionType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { prisma } from '../../services/prismaClient';
import { Padrino, Member } from '@prisma/client';
import { EmbedBuilder, embedLength } from '@discordjs/builders';
import { Console } from 'console';

interface PadrinoData {
  padrinoId: string;
  displayName: string;
  profilePicture: string;
  shortDescription: string;
  longDescription: string;
}

interface PadrinosList {
  [key: string]: PadrinoData;
}

async function createSelectPadrino(
  discordInteraction: CommandInteraction | StringSelectMenuInteraction,
  selectedPadrinoMemberId?: string,
) {
  const allPadrinos: PadrinosList = await getPadrinos();

  if (!allPadrinos) {
    throw new Error('Failed to get padrinos from database');
  }

  // Crete select menu options
  const roleOptions: StringSelectMenuOptionBuilder[] = Object.keys(allPadrinos).map((discordMemberId) => {
    const padrino = allPadrinos[discordMemberId];

    return new StringSelectMenuOptionBuilder()
      .setLabel(padrino!.displayName + ' - ' + padrino!.shortDescription)
      .setValue(discordMemberId);
  });

  try {
    // Create select menu component
    const menuComponent: StringSelectMenuBuilder = new StringSelectMenuBuilder()
      .setCustomId('obtener-padrino-command-select-menu')
      .setPlaceholder('Seleccioná tu padrino')
      .addOptions(roleOptions);

    // Create select menu
    const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menuComponent);

    // Check if discordInteraction is after replied
    if (discordInteraction.type === InteractionType.ApplicationCommand) {
      // Send message
      await discordInteraction.reply({
        content: '# Elegí tu padrino:',
        components: [selectMenu],
        ephemeral: true,
      });
    } else if (discordInteraction.type === InteractionType.MessageComponent) {
      // Create buttons
      const confirmButton = new ButtonBuilder()
        .setCustomId(`obtener-padrino-command-confirm-button-id:${allPadrinos[selectedPadrinoMemberId!]!.padrinoId}`)
        .setLabel('Confirmar padrino')
        .setStyle(ButtonStyle.Primary);
      const rowButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton);

      const embed = await createPadrinoEmbed(allPadrinos[selectedPadrinoMemberId!]!);

      await discordInteraction.update({
        content: '# Elegiste tu padrino\n> Confrimá o seleccioná otro.',
        embeds: [embed],
        components: [selectMenu, rowButtons], // TODO: sacar de la lista los roles que ya se eligieron
      });
    }
  } catch (error) {
    console.error('Failed to create select padrino:', error);
  }
}

async function getPadrinos() {
  const padrinos: Padrino[] | undefined = await prisma.padrino.findMany();
  const padrinosData: PadrinosList = {};

  for (const padrino of padrinos) {
    try {
      const member = await prisma.member.findUnique({
        where: {
          id: padrino.memberId,
        },
      });
      if (!member) {
        throw new Error('Member not found');
      }

      padrinosData[member.discordMemeberId] = {
        padrinoId: padrino.id,
        displayName: member.discordDisplayName,
        profilePicture: member.discordProfilePicture,
        shortDescription: padrino.shortDescription,
        longDescription: padrino.longDescription,
      };
    } catch (error) {
      console.error('Failed to get member from database:', error);
    }
  }

  return padrinosData;
}

async function createPadrinoEmbed(padrinoData: PadrinoData) {
  // Create an embed message
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setThumbnail(padrinoData.profilePicture)
    .addFields(
      { name: 'Nombre', value: padrinoData.displayName, inline: true },
      { name: 'Resumen', value: padrinoData.shortDescription, inline: false },
      { name: 'Biografía', value: padrinoData.longDescription, inline: false },
    );

  return embed;
}

async function confirmPadrino(prismaPadrinoId: string, discordUserId: string) {
  console.log('confirmPadrino', prismaPadrinoId, discordUserId);
  try {
    await prisma.member.update({
      where: {
        discordMemeberId: discordUserId,
      },
      data: {
        myPadrinoId: prismaPadrinoId,
      },
    });
  } catch (error) {
    console.error('Failed to confirm padrino:', error);
  }
}

export { createSelectPadrino, confirmPadrino };

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
import { Padrino as PrismaPadrino, Member as PrismaMember } from '@prisma/client';
import { EmbedBuilder } from '@discordjs/builders';
import { cacheService } from '../../services/cache';
import { PadrinoIndex } from '../../types/cache';

async function createSelectPadrino(
  _discordInteraction: CommandInteraction | StringSelectMenuInteraction,
  _selectedPadrinoMemberId?: string,
) {
  const discordUserIdInvokedIt: string = _discordInteraction.user.id;
  const discordGuildId: string = _discordInteraction.guildId!;

  const prismaPadrinosIndex: PadrinoIndex | null = await cacheService.getAllPadrinos();

  if (!prismaPadrinosIndex) {
    throw new Error('Failed to get padrinos from cache');
  }

  // Crete select menu options
  const prismaMemberInvokedIt: PrismaMember | null = await cacheService.getMemberByDiscordId(
    discordGuildId,
    discordUserIdInvokedIt,
  );

  const roleOptions: StringSelectMenuOptionBuilder[] = [];

  for (const [prismaMemberId, prismaPadrino] of Object.entries(prismaPadrinosIndex)) {
    if (prismaMemberId === prismaMemberInvokedIt?.id) {
      continue;
    }

    const prismaMemberOfPadrino = await cacheService.getMemberByPrismaId(prismaMemberId);

    if (!prismaMemberOfPadrino) {
      throw new Error('Failed to get padrino member from cache');
    }

    roleOptions.push(
      new StringSelectMenuOptionBuilder()
        .setLabel(prismaMemberOfPadrino.discordDisplayName + ' - ' + prismaPadrino.shortDescription)
        .setValue(prismaMemberId),
    );
  }

  try {
    if (roleOptions.length === 0) {
      // Send message
      await _discordInteraction.reply({
        content: 'No hay padrinos disponibles. :pensive:',
        components: [],
        ephemeral: true,
      });

      throw new Error('No padrinos found');
    }

    // Create select menu component
    const menuComponent: StringSelectMenuBuilder = new StringSelectMenuBuilder()
      .setCustomId('obtener-padrino-select-menu')
      .setPlaceholder('Seleccioná tu padrino')
      .addOptions(roleOptions);

    // Create select menu
    const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menuComponent);

    // Check if _discordInteraction is after replied
    if (_discordInteraction.type === InteractionType.ApplicationCommand) {
      // Send message
      await _discordInteraction.reply({
        content: '# Elegí tu padrino:',
        components: [selectMenu],
        ephemeral: true,
      });
    } else if (_discordInteraction.type === InteractionType.MessageComponent) {
      // Create buttons
      const confirmButton = new ButtonBuilder()
        .setCustomId(`obtener-padrino-confirm-button-id:${prismaPadrinosIndex[_selectedPadrinoMemberId!].id}`)
        .setLabel('Confirmar padrino')
        .setStyle(ButtonStyle.Primary);
      const rowButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton);

      const embed = await createPadrinoEmbed(prismaPadrinosIndex[_selectedPadrinoMemberId!]);

      await _discordInteraction.update({
        content: '# Elegiste tu padrino\n> Confrimá o seleccioná otro.',
        embeds: [embed],
        components: [selectMenu, rowButtons],
      });
    }
  } catch (error) {
    console.error('Failed to create select padrino:', error);
  }
}

async function createPadrinoEmbed(_prismaPadrino: PrismaPadrino) {
  const prismaMemberOfPadrino: PrismaMember | null = await cacheService.getMemberByPrismaId(_prismaPadrino.memberId);

  if (!prismaMemberOfPadrino) {
    throw new Error('Failed to get padrino member from cache');
  }

  // Create an embed message
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setThumbnail(prismaMemberOfPadrino.discordProfilePicture)
    .addFields(
      { name: 'Nombre', value: prismaMemberOfPadrino.discordDisplayName, inline: true },
      { name: 'Resumen', value: _prismaPadrino.shortDescription, inline: false },
      { name: 'Biografía', value: _prismaPadrino.longDescription, inline: false },
    );

  return embed;
}

export { createSelectPadrino };

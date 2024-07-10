import { Command } from '../../types/command';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { Member as PrismaMember } from '@prisma/client';
import { cacheService } from '../../services/cache';

const rankingLevels: Command = {
  data: new SlashCommandBuilder()
    .setName('ranking-niveles')
    .setDescription('Ver el ranking de niveles.') as SlashCommandBuilder,
  execute: async (_discordInteraction: CommandInteraction) => {
    const updateLevelSatus: boolean = await cacheService.updateMembersLevelsToDatabase();
    console.log('updateLevelSatus:', updateLevelSatus);

    const topTen: PrismaMember[] | null = await cacheService.getMembersRankingTopTen(_discordInteraction.guild?.id!);

    if (!topTen) return;

    const embed = new EmbedBuilder().setColor(0x0099ff);

    let data: string = '';
    topTen.forEach((member: PrismaMember, index: number) => {
      // Data in embed
      switch (index) {
        case 0:
          embed.addFields({
            name: `:trophy: Primero`,
            value: `**<@${member.discordMemeberId}>**\n*Nivel:* ${member.discordTemporalLevel} - *XP:* ${member.discordTemporalLevelXp}`,
            inline: false,
          });
          break;
        case 1:
          embed.addFields({
            name: `:second_place: Segundo`,
            value: `**<@${member.discordMemeberId}>**\n*Nivel:* ${member.discordTemporalLevel} - *XP:* ${member.discordTemporalLevelXp}`,
            inline: false,
          });
          break;
        case 2:
          embed.addFields({
            name: `:third_place: Tercero`,
            value: `**<@${member.discordMemeberId}>**\n*Nivel:* ${member.discordTemporalLevel} - *XP:* ${member.discordTemporalLevelXp}`,
            inline: false,
          });
          break;
        default:
          embed.addFields({
            name: `#${index + 1}`,
            value: `**<@${member.discordMemeberId}>**\n*Nivel:* ${member.discordTemporalLevel} - *XP:* ${member.discordTemporalLevelXp}`,
            inline: false,
          });
          break;
      }

      // Data in string
      // switch (index) {
      //   case 0:
      //     data += `# :trophy: **<@${member.discordMemeberId}>**\n> *Nivel:* ${member.discordTemporalLevel} - *XP:* ${member.discordTemporalLevelXp}\n`;
      //     break;
      //   case 1:
      //     data += `## :second_place: **<@${member.discordMemeberId}>**\n> *Nivel:* ${member.discordTemporalLevel} - *XP:* ${member.discordTemporalLevelXp}\n`;
      //     break;
      //   case 2:
      //     data += `### :third_place: **<@${member.discordMemeberId}>**\n> *Nivel:* ${member.discordTemporalLevel} - *XP:* ${member.discordTemporalLevelXp}\n`;
      //     break;
      //   default:
      //     data += `#${index + 1} **<@${member.discordMemeberId}>**\n> *Nivel:* ${member.discordTemporalLevel} - *XP:* ${member.discordTemporalLevelXp}\n`;
      //     break;
      // }
    });

    // Send embed message
    try {
      await _discordInteraction.reply({
        content: '# Ranking de niveles\n',
        embeds: [embed],
      });
    } catch (error) {
      console.error('Failed to send embed message', error);
    }
  },
};

export default rankingLevels;

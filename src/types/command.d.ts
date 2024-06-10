import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, CommandInteraction } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder /* | SlashCommandOptionsOnlyBuilder */;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

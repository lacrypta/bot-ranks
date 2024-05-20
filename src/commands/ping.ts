import { CommandInteraction } from "discord.js";

export const execute = async (interaction: CommandInteraction) => {
  await interaction.reply("Pong!");
};

export const data = {
  name: "ping",
  description: "Replies with Pong!",
};

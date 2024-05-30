import { ActionRowBuilder, ButtonBuilder, ButtonComponent, EmbedBuilder, Interaction } from 'discord.js';
import { BotEvent } from '../types/botEvents';
import { ExtendedClient } from '../types/discordClient';

const event: BotEvent = {
  name: 'interactionCreate',
  execute: async (interaction: Interaction) => {
    const client = interaction.client as ExtendedClient;
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      //   const cooldown = interaction.client.cooldowns.get(
      //     `${interaction.commandName}-${interaction.guildId}-${interaction.user.username}`,
      //   );
      if (!command) return;
      //   if (command.cooldown && cooldown) {
      //     if (Date.now() < cooldown) {
      //       const wait = formatWait(Math.abs(Date.now() - cooldown) / 1000);

      //       interaction.reply(`Tiene que esperar ${wait} para volver a usar este comando.`);
      //       setTimeout(() => interaction.deleteReply(), 5000);
      //       return;
      //     }
      //     interaction.client.cooldowns.set(
      //       `${interaction.commandName}-${interaction.user.username}`,
      //       Date.now() + command.cooldown * 1000,
      //     );
      //     setTimeout(() => {
      //       interaction.client.cooldowns.delete(`${interaction.commandName}-${interaction.user.username}`);
      //     }, command.cooldown * 1000);
      //   } else if (command.cooldown && !cooldown) {
      //     interaction.client.cooldowns.set(
      //       `${interaction.commandName}-${interaction.guildId}-${interaction.user.username}`,
      //       Date.now() + command.cooldown * 1000,
      //     );
      //   }
      command.execute(interaction);
    } else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }
    } else if (interaction.isButton()) {
      console.log(interaction);
      // TODO
      // switch (interaction.customId) { }
    } else if (interaction.isStringSelectMenu()) {
      console.log(interaction);
      // TODO
      // switch (interaction.customId) { }
    }
  },
};

export default event;

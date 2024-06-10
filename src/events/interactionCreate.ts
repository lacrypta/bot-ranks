import { Interaction } from 'discord.js';
import { BotEvent } from '../types/botEvents';
import { ExtendedClient } from '../types/discordClient';
import { prisma } from '../services/prismaClient';
import { Message } from '@prisma/client';

const event: BotEvent = {
  name: 'interactionCreate',
  once: false,
  execute: async (interaction: Interaction) => {
    const client = interaction.client as ExtendedClient;

    /// Slash Command ///
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName); // Get command from collection
      if (!command) return; // If command doesn't exist, return
      command.execute(interaction); // If command exist, execute it
    }
    /// Button ///
    else if (interaction.isButton()) {
      console.log(interaction);
    }
    /// String Select Menu ///
    else if (interaction.isStringSelectMenu()) {
      /// /role-rection ///
      if (interaction.customId === 'role-reaction') {
        const prismaMessage = await prisma.message.findMany({
          where: {
            discordInteractionId: interaction!.message!.interaction!.id,
          },
        });

        const selectedRoleId = interaction.values[0];
        const selectedRole = interaction.guild?.roles.cache.get(selectedRoleId!);

        if (selectedRole) {
          // TODO: enviar a la base de datos el id del rol con respecto al mensaje
          const prismaMessageReaction = await prisma.messageReaction.create({
            data: {
              discordRoleId: selectedRoleId!,
              messageId: prismaMessage[0]?.id!,
            },
          });

          await interaction.update({
            content: `You selected the role: ${selectedRole.name}.`,
            components: [],
          });
        }
      }
      /// Don't implemented String Select Menu ///
      else {
        console.log('Interaction is not implemented.');
      }
    }
  },
};

export default event;

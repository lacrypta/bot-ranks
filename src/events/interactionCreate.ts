import { Interaction, Role } from 'discord.js';
import { BotEvent } from '../types/botEvents';
import { ExtendedClient } from '../types/discordClient';
import { prisma } from '../services/prismaClient';
import { Message, MessageReactionRole } from '@prisma/client';
import { finalizeRoleReactionCommand } from '../commands/roleReaction/roleReaction';

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
      //// /role-rection-commnad ///
      if (interaction.customId === 'role-reaction-command-finish-button') {
        finalizeRoleReactionCommand();
      }
    }

    /// String Select Menu ///
    else if (interaction.isStringSelectMenu()) {
      /// /role-rection-commnad ///
      if (interaction.customId === 'role-reaction-command-select-menu') {
        // Get message from database
        let prismaMessage: Message[];
        try {
          prismaMessage = await prisma.message.findMany({
            where: {
              discordCommandName: 'role-reaction-command',
            },
          });
        } catch (error) {
          console.error('Failed to get message from database:', error);

          return;
        }

        // Get selected role
        const selectedRoleId: string = interaction.values[0]!;
        const selectedRole: Role | undefined = interaction.guild!.roles.cache.get(selectedRoleId);

        if (selectedRole) {
          try {
            await prisma.messageReactionRole.create({
              data: {
                discordRoleId: selectedRoleId,
                messageId: prismaMessage[0]!.id,
              },
            });
          } catch (error) {
            console.error('Failed to create messageReactionRole:', error);
          }

          await interaction.update({
            content: `You selected the role: ${selectedRole.name}.\n\nAdd reaction to message`,
            components: [],
          });
        } else {
          await interaction.update({
            content: 'Role not found.',
            components: [],
          });
        }
      }
    }

    /// Don't implemented String Select Menu ///
    else {
      console.log('Interaction is not implemented.');
    }
  },
};

export default event;

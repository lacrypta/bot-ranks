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

    /////////////////////
    /// Slash Command ///
    /////////////////////
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName); // Get command from collection
      if (!command) return; // If command doesn't exist, return
      command.execute(interaction); // If command exist, execute it
    }

    //////////////
    /// Button ///
    //////////////
    else if (interaction.isButton()) {
      //// /role-rection-commnad ///
      if (interaction.customId === 'role-reaction-command-finish-button') {
        finalizeRoleReactionCommand();
      /// /role-button-commnad ///
      else if (interaction.customId.startsWith('role-button-command-button-')) {
        const buttonId: string = interaction.customId;
        let prismaRole: PrismaRole[] | undefined;

        try {
          const prismaReactionButton: ReactionButton[] | undefined = await prisma.reactionButton.findMany({
            where: {
              discordButtonId: buttonId,
            },
          });
          prismaRole = await prisma.role.findMany({
            where: {
              id: prismaReactionButton[0]!.roleId,
            },
          });
        } catch (error) {
          console.error('Failed to get role from database:', error);
        }

        if (prismaRole) {
          const role: Role | undefined = interaction.guild!.roles.cache.get(prismaRole[0]!.discordRoleId);

          if (role) {
            const member = interaction.guild?.members.cache.get(interaction.user.id);
            if (member) {
              if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);

                await interaction.reply({
                  content: `You have been removed from the role: ${role.name}`,
                  ephemeral: true,
                });
              } else {
                await member.roles.add(role);

                await interaction.reply({
                  content: `You have been given the role: ${role.name}`,
                  ephemeral: true,
                });
              }
            }
          }
        }
      } /// End Of /role-button-commnad ///
    //////////////////////////
    /// String Select Menu ///
    //////////////////////////
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
    ////////////////////
    /// Modal Submit ///
    ////////////////////
    else if (interaction.isModalSubmit()) {
      /// /role-button-commnad ///
      if (interaction.customId === 'role-button-command-modal') {
        // Setup
        if (interaction.fields.fields.firstKey() === 'role-button-command-text-input-message') {
          // Get channel
          const channelId: string = interaction.channelId!;
          const channel: GuildBasedChannel | undefined = interaction.guild!.channels.cache.get(channelId);
          const textInputMessage: string = interaction.fields.fields.first()!.value!;

          // Send message
          if (channel?.type === ChannelType.GuildText) {
            try {
              await interaction.deferUpdate(); // Acknowledge the interaction
            } catch (error) {
              console.error('Failed defer modal message', error);
            }

            discordMessageInstance = await channel!.send(textInputMessage);

            await addButtonToMessage(discordMessageInstance.id);
          }
        }
      } /// End Of /role-button-commnad ///
    }

    /////////////////////////////////////
    /// Interaction is not implemented //
    //////////////////////////////////////
    else {
      console.log('Interaction is not implemented.');
    }
  },
};

export default event;

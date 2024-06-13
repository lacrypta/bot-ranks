import { MessageReaction, User } from 'discord.js';
import { BotEvent } from '../types/botEvents';
import { prisma } from '../services/prismaClient';
import { Message, MessageReactionRole } from '@prisma/client';
import { reactionToMessage, selectMenu } from '../commands/roleReaction/roleReaction';

const event: BotEvent = {
  name: 'messageReactionAdd',
  once: false,
  execute: async (reaction: MessageReaction, user: User) => {
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Something went wrong when fetching the message:', error);

        return;
      }
    }

    const discordEmojiId: string = reaction.emoji.id! || reaction.emoji.name!;
    const discordMessageId: string = reaction.message.id;
    console.log(`[messageReactionAdd.ts] ${user.tag} reacted with ${discordEmojiId} to message ${discordMessageId}`);
    // console.log(`[messageReactionAdd.ts] ${user.tag} reacted with ${discordEmojiId} to message ${discordMessageId}`);

    // Get messages from database
    let prismaMessages: Message[];
    try {
      prismaMessages = await prisma.message.findMany();
    } catch (error) {
      console.error('Failed to get message from database:', error);

      return;
    }

    for (const message of prismaMessages) {
      /// /role-reaction-command ///
      if (message.discordMessageId === discordMessageId && message.discordCommandName === 'role-reaction-command') {
        // Update messageReactionRole in db and react it with the bot
        const prismaMessageReactionRoleEmpty: MessageReactionRole[] = await prisma.messageReactionRole.findMany({
          where: {
            messageId: message.id,
            discordEmojiId: null,
          },
        });

        /// Setup if not exists
        if (prismaMessageReactionRoleEmpty.length > 0) {
          await prisma.messageReactionRole.updateMany({
            where: {
              messageId: message.id,
              discordEmojiId: null,
            },
            data: {
              discordEmojiId: discordEmojiId,
            },
          });

          await reactionToMessage(discordMessageId, discordEmojiId);
          await selectMenu();

          return;
        }
        /// Give role to user
        else {
          const guild = reaction.message.guild!;
          const member = guild.members.cache.get(user.id);

          // If isn't a bot
          if (!member!.user.bot) {
            // Get messageReactionRole from database
            try {
              const prismaMessageReactionRole: MessageReactionRole[] = await prisma.messageReactionRole.findMany({
                where: {
                  messageId: message.id,
                  discordEmojiId: discordEmojiId,
                },
              });

              const prismaRoleId: string = prismaMessageReactionRole[0]!.discordRoleId!;

              // Give role to user
              try {
                const role = guild.roles.cache.get(prismaRoleId);

                member!.roles.add(role!);
                console.log(`[messageReactionAdd.ts] Gave role ${role!.name} to ${user.tag}`);

                return;
              } catch (error) {
                console.error('Failed to give role to user:', error);
              }
            } catch (error) {
              console.error('Failed to get messageReactionRole from database:', error);
            }
          }
        }
      }

      /// /another-commnad ///
      if (false) {
        // your code
      }
    }
  },
};

export default event;

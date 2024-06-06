import { MessageReaction, User } from 'discord.js';
import { BotEvent } from '../types/botEvents';

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

    // TODO: get the id of the message in the database
    if (reaction.message.id != idInDataBase) {
      return;
    }

    // TODO: enviar id del emoji a la base de datos

    console.log(`[messageReactionAdd.ts] ${user.tag} reacted with ${reaction.emoji.name}.`);
  },
};

export default event;

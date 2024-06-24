import { GuildMember, Message, User } from 'discord.js';
import { BotEvent } from '../types/botEvents';
import { addXp } from '../services/temporalLevel';

const event: BotEvent = {
  name: 'messageCreate',
  once: false,
  execute: async (message: Message) => {
    if (message.author.bot) return;

    const currentXp: number | undefined = await addXp(message.member!.id, 1);

    console.log(`Member ${message.member!.displayName} has ${currentXp} xp.`);
  },
};

export default event;
